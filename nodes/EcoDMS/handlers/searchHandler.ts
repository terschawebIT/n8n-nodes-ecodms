import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';
import { createNodeError } from '../utils/errorHandler';
import { getBaseUrl, shouldSkipSslValidation } from '../utils/helpers';

interface SearchResponse extends IDataObject {
	success?: boolean;
	message?: string;
	data?: IDataObject;
	documents?: IDataObject[];
}

/**
 * Behandelt alle Such-Operationen für ecoDMS
 */
export async function handleSearchOperations(
	this: IExecuteFunctions,
	_items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	let result: SearchResponse | INodeExecutionData[];

	switch (operation) {
		case Operation.Search:
			result = await handleSearch.call(this, credentials);
			break;
		case Operation.AdvancedSearch:
			result = await handleAdvancedSearch.call(this, credentials);
			break;
		case Operation.SearchAndDownload:
			result = await handleSearchAndDownload.call(this, _items, credentials);
			break;
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Die Operation "${operation}" wird nicht unterstützt!`,
			);
	}

	// Stelle sicher, dass wir immer ein Array von INodeExecutionData zurückgeben
	return Array.isArray(result) ? result : [{ json: result }];
}

/**
 * Implementiert die einfache Suche
 */
async function handleSearch(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<SearchResponse> {
	const searchTerm = this.getNodeParameter('searchText', 0) as string;
	const maxDocuments = this.getNodeParameter('maxDocuments', 0, 100) as number;

	try {
		// Verwende die korrekte ecoDMS API URL
		const url = await getBaseUrl.call(this, 'searchDocuments');

		// Erstelle den korrekten Search Filter für Volltext-Suche
		// Verwende 'fulltext-ext' für Suche in Dokumentinhalten UND Klassifikationsattributen
		const searchFilters = [
			{
				classifyAttribut: 'fulltext-ext',
				searchValue: searchTerm,
				searchOperator: '=',
			},
		];

		const response = await this.helpers.httpRequest({
			url,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: searchFilters,
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
			skipSslCertificateValidation: await shouldSkipSslValidation.call(this),
		});

		// Limitiere die Ergebnisse entsprechend dem maxDocuments Parameter
		let documents = Array.isArray(response) ? response : [];
		if (maxDocuments > 0 && documents.length > maxDocuments) {
			documents = documents.slice(0, maxDocuments);
		}

		return {
			success: true,
			data: {
				documents,
				totalFound: Array.isArray(response) ? response.length : 0,
				limitedTo: maxDocuments,
			},
		};
	} catch (error: unknown) {
		throw createNodeError(this.getNode(), 'Fehler bei der Suche', error);
	}
}

/**
 * Formatiert einen Datumswert für die ecoDMS API
 */
function formatDateValue(dateValue: string | Date): string {
	if (!dateValue) return '';

	// Wenn es bereits ein String im richtigen Format ist
	if (typeof dateValue === 'string') {
		// Prüfe ob es ein ISO-String ist und konvertiere zu YYYY-MM-DD
		if (dateValue.includes('T')) {
			return dateValue.split('T')[0];
		}
		// Bereits im richtigen Format
		if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
			return dateValue;
		}
	}

	// Date-Objekt zu String konvertieren
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return '';

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function buildSearchFilters(filters: IDataObject[]): IDataObject[] {
	return filters.map((filter: IDataObject) => {
		let attributeName = filter.classifyAttribut as string;
		if (attributeName === 'custom' && filter.customFieldName) {
			attributeName = filter.customFieldName as string;
		}

		let searchValue = '';

		if (['cdate', 'defdate', 'ctimestamp'].includes(filter.classifyAttribut as string)) {
			searchValue = formatDateValue(filter.searchValueDate as string);
		} else if (filter.searchValueDocumentType) {
			searchValue = filter.searchValueDocumentType as string;
		} else if (filter.searchValueFolder) {
			searchValue = filter.searchValueFolder as string;
		} else if (filter.searchValueStatus) {
			searchValue = filter.searchValueStatus as string;
		} else if (filter.searchValueText) {
			searchValue = filter.searchValueText as string;
		} else if (filter.searchValue) {
			searchValue = filter.searchValue as string;
		}

		return {
			classifyAttribut: attributeName,
			searchValue,
			searchOperator: filter.searchOperator || '=',
		};
	});
}

/**
 * Implementiert die erweiterte Suche
 */
async function handleAdvancedSearch(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<SearchResponse> {
	const filters = this.getNodeParameter('searchFilters.filters', 0, []) as IDataObject[];
	const _additionalOptions = this.getNodeParameter('additionalOptions', 0, {}) as IDataObject;

	try {
		// Verwende die korrekte ecoDMS API URL
		const url = await getBaseUrl.call(this, 'searchDocuments');

		const searchFilters = buildSearchFilters(filters);

		const response = await this.helpers.httpRequest({
			url,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: searchFilters,
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
			skipSslCertificateValidation: await shouldSkipSslValidation.call(this),
		});

		return {
			success: true,
			data: {
				documents: Array.isArray(response) ? response : [],
				totalFound: Array.isArray(response) ? response.length : 0,
			},
		};
	} catch (error: unknown) {
		throw createNodeError(this.getNode(), 'Fehler bei der erweiterten Suche', error);
	}
}

/**
 * Implementiert die Suche und das Herunterladen von Dokumenten
 */
async function handleSearchAndDownload(
	this: IExecuteFunctions,
	_items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	const binaryPropertyName = this.getNodeParameter('binaryProperty', 0, 'data') as string;
	const filters = this.getNodeParameter('searchFilters.filters', 0, []) as IDataObject[];

	try {
		// Erst suchen
		const searchUrl = await getBaseUrl.call(this, 'searchDocuments');

		const searchFilters = buildSearchFilters(filters);

		const searchResponse = await this.helpers.httpRequest({
			url: searchUrl,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: searchFilters,
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
			skipSslCertificateValidation: await shouldSkipSslValidation.call(this),
		});

		if (!Array.isArray(searchResponse) || searchResponse.length === 0) {
			return [
				{
					json: {
						success: true,
						message: 'Keine Dokumente gefunden',
					},
				},
			];
		}

		const returnItems: INodeExecutionData[] = [];

		// Für jedes gefundene Dokument versuchen wir es herunterzuladen
		for (const document of searchResponse) {
			try {
				const docId = document.docId;
				const downloadUrl = await getBaseUrl.call(this, `document/${docId}`);

				const downloadResponse = await this.helpers.httpRequest({
					url: downloadUrl,
					method: 'GET',
					headers: {
						Accept: '*/*',
					},
					encoding: 'arraybuffer',
					returnFullResponse: true,
					auth: {
						username: credentials.username as string,
						password: credentials.password as string,
					},
					skipSslCertificateValidation: await shouldSkipSslValidation.call(this),
				});

				// Dateiname aus Content-Disposition oder aus bemerkung extrahieren
				const contentDisposition = downloadResponse.headers['content-disposition'] as string;
				let fileName = document.classifyAttributes?.bemerkung || `document_${docId}.pdf`;
				if (contentDisposition) {
					const match = contentDisposition.match(/filename="(.+)"/);
					if (match) {
						fileName = match[1];
					}
				}

				const contentType = (downloadResponse.headers['content-type'] as string) || 'application/pdf';

				const newItem: INodeExecutionData = {
					json: {
						...document,
						downloadSuccess: true,
						searchFilters,
					},
					binary: {},
				};

				newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(
					Buffer.from(downloadResponse.body as Buffer),
					fileName,
					contentType,
				);

				returnItems.push(newItem);
			} catch (downloadError: unknown) {
				// Bei Download-Fehler trotzdem das Dokument mit Fehlerinfo zurückgeben
				returnItems.push({
					json: {
						...document,
						downloadSuccess: false,
						downloadError: (downloadError as Error).message,
						searchFilters,
					},
				});
			}
		}

		return returnItems;
	} catch (error: unknown) {
		throw createNodeError(this.getNode(), 'Fehler bei der Suche und dem Download', error);
	}
}
