import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';

/**
 * Behandelt alle Suchoperationen für ecoDMS
 */
export async function handleSearchOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[] | IDataObject> {
	let responseData: any;

	switch (operation) {
		case Operation.Search:
			responseData = await handleSimpleSearch.call(this, credentials);
			break;
		case Operation.AdvancedSearch:
			responseData = await handleAdvancedSearch.call(this, credentials);
			break;
		case Operation.AdvancedSearchExtv2:
			responseData = await handleAdvancedSearchV2.call(this, credentials);
			break;
		case Operation.SearchAndDownload:
			responseData = await handleSearchAndDownload.call(this, items, credentials);
			break;
		default:
			throw new NodeOperationError(this.getNode(), `Die Operation "${operation}" wird nicht unterstützt!`);
	}

	return responseData;
}

/**
 * Implementiert die einfache Suche mit dem Endpunkt `/api/searchDocuments`
 * 
 * Die einfache Suche ermöglicht es, Dokumente anhand mehrerer Suchkriterien zu finden.
 * Jedes Suchkriterium (Filter) besteht aus:
 * - classifyAttribut: Name des Klassifikationsattributs (z.B. bemerkung, docart, folder)
 * - searchOperator: Vergleichsoperator (=, !=, like, ilike, >, <, etc.)
 * - searchValue: Suchwert
 * 
 * Die Suchfilter werden mit einem logischen UND verknüpft.
 * Die API gibt maximal 100 Dokumente zurück, sortiert nach Dokument-ID in absteigender Reihenfolge.
 * 
 * @see https://docs.ecodms.de/api/searchDocuments
 */
async function handleSimpleSearch(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject[]> {
	const filters = this.getNodeParameter('searchFilters.filters', 0, []) as IDataObject[];
	
	if (filters.length === 0) {
		throw new NodeOperationError(this.getNode(), 'Mindestens ein Suchfilter muss angegeben werden');
	}
	
	// Suchfilter vorbereiten
	const searchFilters: IDataObject[] = [];
	
	for (const filter of filters) {
		const attribut = filter.classifyAttribut as string;
		let operator = filter.searchOperator as string;
		const value = filter.searchValue as string;
		
		// Prüfen, ob alle erforderlichen Felder vorhanden sind
		if (!attribut) {
			throw new NodeOperationError(this.getNode(), 'Klassifikationsattribut muss angegeben werden');
		}
		
		if (!operator) {
			operator = getDefaultOperator(attribut);
		}
		
		// Leere Werte oder "auto" überspringen
		if (!value || value === '' || value === 'auto') {
			continue;
		}
		
		// Spezielle Validierung für Datumsfelder
		if (['cdate', 'defdate'].includes(attribut)) {
			// Prüfen, ob das Datum im ISO-Format (YYYY-MM-DD) ist
			const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
			if (!dateRegex.test(value)) {
				throw new NodeOperationError(
					this.getNode(),
					`Datum für "${attribut}" muss im Format YYYY-MM-DD sein (z.B. 2023-01-31)`,
				);
			}
		}
		
		// Spezielle Validierung für Zeitstempel
		if (attribut === 'ctimestamp') {
			// Prüfen, ob der Zeitstempel im Format YYYY-MM-DD oder YYYY-MM-DD HH:MM:SS ist
			const timestampRegex = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/;
			if (!timestampRegex.test(value)) {
				throw new NodeOperationError(
					this.getNode(),
					'Zeitstempel muss im Format YYYY-MM-DD oder YYYY-MM-DD HH:MM:SS sein',
				);
			}
		}
		
		// Für 'like' und 'ilike' Operatoren: Wildcard-Zeichen hinzufügen, falls nicht vorhanden
		let searchValue = value;
		if ((operator === 'like' || operator === 'ilike' || operator === '!like' || operator === '!ilike') && 
			!value.includes('%')) {
			searchValue = `%${value}%`;
		}
		
		// Filter hinzufügen
		searchFilters.push({
			classifyAttribut: attribut,
			searchOperator: operator,
			searchValue: searchValue,
		});
	}
	
	// Prüfen, ob nach der Validierung noch Filter übrig sind
	if (searchFilters.length === 0) {
		throw new NodeOperationError(
			this.getNode(),
			'Keine gültigen Suchfilter nach Validierung. Bitte mindestens einen gültigen Filter angeben.',
		);
	}
	
	// API-Anfrage ausführen
	try {
		return await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/searchDocuments`,
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: searchFilters,
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});
	} catch (error) {
		// Fehlerbehandlung für verschiedene HTTP-Statuscodes
		if (error.statusCode === 401) {
			throw new NodeOperationError(
				this.getNode(),
				'Nicht autorisiert. Bitte überprüfen Sie Ihre Zugangsdaten.',
			);
		} else if (error.statusCode === 404) {
			// Spezifische 404-Fehlermeldungen auswerten und benutzerfreundlich anzeigen
			if (error.message.includes('List of search filters must not be null')) {
				throw new NodeOperationError(this.getNode(), 'Die Liste der Suchfilter darf nicht leer sein');
			} else if (error.message.includes('search attribute was not found')) {
				throw new NodeOperationError(this.getNode(), 'Ein Suchattribut wurde nicht gefunden');
			} else if (error.message.includes('invalid search operator')) {
				throw new NodeOperationError(this.getNode(), 'Ungültiger Suchoperator für ein Attribut verwendet');
			} else if (error.message.includes('invalid date or timestamp pattern')) {
				throw new NodeOperationError(this.getNode(), 'Ungültiges Datums- oder Zeitstempelformat');
			} else {
				throw new NodeOperationError(
					this.getNode(),
					`Fehler bei der Suche: ${error.message}`,
				);
			}
		} else {
			// Allgemeinen Fehler weiterleiten
			throw new NodeOperationError(
				this.getNode(),
				`Fehler bei der Suche: ${error.message}`,
			);
		}
	}
}

/**
 * Implementiert die erweiterte Suche
 */
async function handleAdvancedSearch(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject[]> {
	const filters = this.getNodeParameter('searchFilters.filters', 0, []) as IDataObject[];
	const additionalOptions = this.getNodeParameter('additionalOptions', 0, {}) as IDataObject;
	
	if (filters.length === 0) {
		throw new NodeOperationError(this.getNode(), 'Mindestens ein Suchfilter muss angegeben werden');
	}
	
	// Suchfilter verarbeiten
	const searchFilters = processFilters.call(this, filters);
	
	// URL-Parameter aufbauen
	const queryParams: IDataObject = {
		personalDocumentsOnly: additionalOptions.personalDocumentsOnly === true ? 'true' : 'false',
		trashedDocuments: additionalOptions.trashedDocuments === true ? 'true' : 'false',
		readRoles: additionalOptions.readRoles !== false ? 'true' : 'false',
	};
	
	// Maximale Dokumentanzahl
	if (additionalOptions.maxDocumentCount) {
		const maxDocCount = parseInt(additionalOptions.maxDocumentCount as string, 10);
		if (!isNaN(maxDocCount) && maxDocCount > 0) {
			if (maxDocCount > 1000) {
				throw new NodeOperationError(this.getNode(), 'Maximale Anzahl der Dokumente ist 1000');
			}
			queryParams.maxDocumentCount = maxDocCount.toString();
		}
	}
	
	// URL erstellen
	let url = `${credentials.serverUrl as string}/api/searchDocumentsExt`;
	const queryString = Object.entries(queryParams)
		.map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
		.join('&');
	
	if (queryString) {
		url += `?${queryString}`;
	}
	
	// API-Anfrage ausführen
	return await this.helpers.httpRequest({
		url,
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: searchFilters,
		json: true,
		auth: {
			username: credentials.username as string,
			password: credentials.password as string,
		},
	});
}

/**
 * Implementiert die erweiterte Suche V2
 */
async function handleAdvancedSearchV2(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject[]> {
	const filters = this.getNodeParameter('searchFilters.filters', 0, []) as IDataObject[];
	const sortOrders = this.getNodeParameter('sortOrder.orders', 0, []) as IDataObject[];
	const additionalOptions = this.getNodeParameter('additionalOptions', 0, {}) as IDataObject;
	
	if (filters.length === 0) {
		throw new NodeOperationError(this.getNode(), 'Mindestens ein Suchfilter muss angegeben werden');
	}
	
	// Suchfilter verarbeiten
	const searchFilters = processFilters.call(this, filters);
	
	// Suchparameter aufbauen
	const searchParams: IDataObject = {
		filter: searchFilters,
		personalDocumentsOnly: additionalOptions.personalDocumentsOnly === true,
		trashedDocuments: additionalOptions.trashedDocuments === true,
		readRoles: additionalOptions.readRoles !== false,
	};
	
	// Maximale Dokumentanzahl
	if (additionalOptions.maxDocumentCount) {
		const maxDocCount = parseInt(additionalOptions.maxDocumentCount as string, 10);
		if (!isNaN(maxDocCount) && maxDocCount > 0) {
			if (maxDocCount > 1000) {
				throw new NodeOperationError(this.getNode(), 'Maximale Anzahl der Dokumente ist 1000');
			}
			searchParams.maxDocumentCount = maxDocCount;
		}
	}
	
	// Sortierung verarbeiten
	if (sortOrders && sortOrders.length > 0) {
		const sortParams: IDataObject[] = [];
		
		for (const order of sortOrders) {
			if (!order.classifyAttribut) {
				continue;
			}
			
			sortParams.push({
				classifyAttribut: order.classifyAttribut,
				sortDirection: order.sortDirection || 'desc',
			});
		}
		
		if (sortParams.length > 0) {
			searchParams.sortOrder = sortParams;
		}
	}
	
	// API-Anfrage ausführen
	return await this.helpers.httpRequest({
		url: `${credentials.serverUrl as string}/api/searchDocumentsExtv2`,
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: searchParams,
		json: true,
		auth: {
			username: credentials.username as string,
			password: credentials.password as string,
		},
	});
}

/**
 * Implementiert die Suche und das Herunterladen von Dokumenten
 */
async function handleSearchAndDownload(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	const filters = this.getNodeParameter('searchFilters.filters', 0, []) as IDataObject[];
	const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
	const maxDocuments = this.getNodeParameter('maxDocuments', 0, 10) as number;
	
	if (filters.length === 0) {
		throw new NodeOperationError(this.getNode(), 'Mindestens ein Suchfilter muss angegeben werden');
	}
	
	if (maxDocuments > 100) {
		throw new NodeOperationError(this.getNode(), 'Aus Leistungsgründen können maximal 100 Dokumente heruntergeladen werden');
	}
	
	// Suchfilter verarbeiten
	const searchFilters = processFilters.call(this, filters);
	
	// Suche durchführen
	const searchResult = await this.helpers.httpRequest({
		url: `${credentials.serverUrl as string}/api/searchDocuments`,
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: searchFilters,
		json: true,
		auth: {
			username: credentials.username as string,
			password: credentials.password as string,
		},
	});
	
	// Prüfen, ob Dokumente gefunden wurden
	if (!Array.isArray(searchResult) || searchResult.length === 0) {
		return [];
	}
	
	// Dokumente herunterladen
	const documents = searchResult.slice(0, maxDocuments);
	const downloadItems: INodeExecutionData[] = [];
	
	for (const document of documents) {
		try {
			// Dokument herunterladen
			const response = await this.helpers.httpRequest({
				url: `${credentials.serverUrl as string}/api/document/${document.docId}`,
				method: 'GET',
				headers: {
					'Accept': '*/*',
				},
				encoding: 'arraybuffer',
				returnFullResponse: true,
				auth: {
					username: credentials.username as string,
					password: credentials.password as string,
				},
			});
			
			// Neue Node mit Download-Ergebnis und Metadaten erstellen
			const newItem: INodeExecutionData = {
				json: document,
				binary: {},
			};
			
			// Dateiname aus Content-Disposition-Header extrahieren
			const contentDisposition = response.headers['content-disposition'] as string;
			let fileName = `document_${document.docId}.pdf`;
			if (contentDisposition) {
				const match = contentDisposition.match(/filename="(.+)"/);
				if (match) {
					fileName = match[1];
				}
			}
			
			// Mime-Typ bestimmen
			const contentType = response.headers['content-type'] as string || 'application/octet-stream';
			
			// Binäre Daten hinzufügen
			newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(
				Buffer.from(response.body as Buffer),
				fileName,
				contentType,
			);
			
			downloadItems.push(newItem);
		} catch (error) {
			// Fehler beim Herunterladen des Dokuments
			console.error(`Fehler beim Herunterladen des Dokuments mit ID ${document.docId}:`, error);
			
			// Nur die Metadaten zurückgeben
			downloadItems.push({
				json: {
					...document,
					downloadError: true,
					errorMessage: error.message,
				},
			});
		}
	}
	
	return downloadItems;
}

/**
 * Hilfsfunktion: Verarbeitet Suchfilter und gibt die aufbereiteten Filter zurück
 */
function processFilters(this: IExecuteFunctions, filters: IDataObject[]): IDataObject[] {
	const searchFilters: IDataObject[] = [];
	
	for (const filter of filters) {
		const attribut = filter.classifyAttribut as string;
		let operator = filter.searchOperator as string;
		
		// Operator-Verarbeitung
		if (!operator || operator === '') {
			operator = getDefaultOperator(attribut);
		}
		
		const value = filter.searchValue as string;
		
		// 'auto'-Wert überspringen
		if (value === 'auto') {
			continue;
		}
		
		// Filter hinzufügen
		searchFilters.push({
			classifyAttribut: attribut,
			searchOperator: operator,
			searchValue: value,
		});
	}
	
	return searchFilters;
}

/**
 * Hilfsfunktion: Liefert den Standardoperator für ein Attribut
 */
function getDefaultOperator(attribut: string): string {
	if (['bemerkung', 'changeid', 'docid', 'revision', 'ctimestamp'].includes(attribut)) {
		return 'like'; // Text-Felder
	} else if (['docart', 'folder', 'folderonly', 'status', 'mainfolder', 'mainfolderonly'].includes(attribut)) {
		return '='; // Dropdown-Felder
	} else if (['defdate', 'cdate'].includes(attribut)) {
		return '>='; // Datums-/Zeitfelder
	}
	return '='; // Fallback
} 