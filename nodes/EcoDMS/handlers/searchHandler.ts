import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
	NodeApiError,
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
			responseData = await handleSearch.call(this);
			break;
		case Operation.AdvancedSearch:
			responseData = await handleAdvancedSearch.call(this, credentials);
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
 * Implements the search operation.
 * Performs a search for documents in ecoDMS.
 */
export async function handleSearch(this: IExecuteFunctions): Promise<any> {
	try {
		// Simple search now uses just fulltext-ext with boolean search capabilities
		const searchText = this.getNodeParameter('searchText', 0, '') as string;
		const maxDocuments = this.getNodeParameter('maxDocuments', 0, 100) as number;
		
		// Get credentials to access the API
		const credentials = await this.getCredentials('ecoDmsApi');
		
		// Create search filter for fulltext extended search
		const searchFilters = [
			{
				classifyAttribut: 'fulltext-ext',
				searchOperator: '=',
				searchValue: searchText,
			},
		];
		
		// Execute API request
		const response = await this.helpers.httpRequest({
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
		
		// Maximum documents filter on client side if needed
		if (Array.isArray(response) && response.length > maxDocuments) {
			return response.slice(0, maxDocuments);
		}
		
		return response;
	} catch (error) {
		if (error.statusCode === 401) {
			throw new NodeOperationError(
				this.getNode(),
				'Nicht autorisiert. Bitte überprüfen Sie Ihre Zugangsdaten.',
			);
		} else if (error.statusCode === 404) {
			throw new NodeOperationError(
				this.getNode(),
				`Fehler bei der Suche: ${error.message}`,
			);
		} else {
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
	
	// Prüfen, ob überhaupt Filter vorhanden sind
	if (!filters || !Array.isArray(filters) || filters.length === 0) {
		console.log('Keine Suchfilter angegeben oder leeres Array erhalten');
		return searchFilters;
	}
	
	for (const filter of filters) {
		// Grundlegende Validierung
		if (!filter || typeof filter !== 'object') {
			console.log('Ungültiges Filter-Objekt übersprungen:', filter);
			continue;
		}
		
		const attribut = filter.classifyAttribut as string;
		if (!attribut) {
			console.log('Filter ohne Attribut übersprungen');
			continue;
		}
		
		let operator = filter.searchOperator as string;
		// Operator-Verarbeitung
		if (!operator || operator === '') {
			operator = getDefaultOperator(attribut);
			console.log(`Operator für ${attribut} auf Standardwert "${operator}" gesetzt`);
		}
		
		let value = filter.searchValue as string;
		
		// Konvertierung von null/undefined zu leerem String für konsistentes Verhalten
		if (value === undefined || value === null) {
			value = '';
		}
		
		// Leere Werte oder 'auto' überspringen
		if (value === '' || value === 'auto') {
			console.log(`Überspringe Filter für ${attribut} wegen leerem Wert "${value}"`);
			continue;
		}
		
		// Spezielle Behandlung für ID-basierte Werte (bei Dropdown-Menüs)
		if (['docart', 'folder', 'folderonly', 'status', 'mainfolder', 'mainfolderonly'].includes(attribut)) {
			// Stelle sicher, dass der Wert eine gültige ID ist
			try {
				// Versuche, ID als Zahl zu interpretieren (für API-Konsistenz)
				const numericId = parseInt(value, 10);
				if (!isNaN(numericId)) {
					value = numericId.toString();
				}
			} catch (error) {
				console.log(`Warnung: Probleme bei der Konvertierung der ID für ${attribut}: ${value}`);
			}
		}
		
		// Filter hinzufügen
		searchFilters.push({
			classifyAttribut: attribut,
			searchOperator: operator,
			searchValue: value,
		});
		
		console.log(`Filter hinzugefügt: ${attribut} ${operator} "${value}"`);
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