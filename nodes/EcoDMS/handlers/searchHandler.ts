import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';

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
	items: INodeExecutionData[],
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
			result = await handleSearchAndDownload.call(this, items, credentials);
			break;
		default:
			throw new NodeOperationError(this.getNode(), `Die Operation "${operation}" wird nicht unterstützt!`);
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
	const searchTerm = this.getNodeParameter('searchTerm', 0) as string;
	
	try {
		const response = await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/search`,
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: {
				searchTerm,
			},
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});

		return {
			success: true,
			data: response,
		};
	} catch (_error) {
		throw new NodeOperationError(this.getNode(), `Fehler bei der Suche: ${_error.message}`);
	}
}

/**
 * Implementiert die erweiterte Suche
 */
async function handleAdvancedSearch(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<SearchResponse> {
	const filters = this.getNodeParameter('searchFilters.filters', 0, []) as IDataObject[];
	const additionalOptions = this.getNodeParameter('additionalOptions', 0, {}) as IDataObject;
	
	try {
		const response = await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/advancedSearch`,
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: {
				filters,
				...additionalOptions,
			},
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});

		return {
			success: true,
			data: response,
		};
	} catch (_error) {
		throw new NodeOperationError(this.getNode(), `Fehler bei der erweiterten Suche: ${_error.message}`);
	}
}

/**
 * Implementiert die Suche und das Herunterladen von Dokumenten
 */
async function handleSearchAndDownload(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	const searchTerm = this.getNodeParameter('searchTerm', 0) as string;
	const binaryPropertyName = this.getNodeParameter('binaryProperty', 0, 'data') as string;
	
	try {
		const response = await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/searchAndDownload`,
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: {
				searchTerm,
			},
			encoding: 'arraybuffer',
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});

		const newItem: INodeExecutionData = {
			json: {
				success: true,
				searchTerm,
			},
			binary: {},
		};

		newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(
			Buffer.from(response as Buffer),
			'search_results.zip',
			'application/zip',
		);

		return [newItem];
	} catch (_error) {
		throw new NodeOperationError(this.getNode(), `Fehler bei der Suche und dem Download: ${_error.message}`);
	}
} 