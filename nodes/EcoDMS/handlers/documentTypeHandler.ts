import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';
import { getBaseUrl } from '../utils/helpers';
import { createNodeError } from '../utils/errorHandler';

interface DocumentTypeResponse extends IDataObject {
	success?: boolean;
	message?: string;
	data?: IDataObject;
}

/**
 * Behandelt alle Dokumenttyp-Operationen für ecoDMS
 */
export async function handleDocumentTypeOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	let result: DocumentTypeResponse | INodeExecutionData[];

	switch (operation) {
		case Operation.GetTypes:
			result = await handleGetTypes.call(this, credentials);
			break;
		case Operation.GetTypeClassifications:
			result = await handleGetTypeClassifications.call(this, credentials);
			break;
		default:
			throw new NodeOperationError(this.getNode(), `Die Operation "${operation}" wird nicht unterstützt!`);
	}

	// Stelle sicher, dass wir immer ein Array von INodeExecutionData zurückgeben
	return Array.isArray(result) ? result : [{ json: result }];
}

/**
 * Implementiert das Abrufen der Dokumenttypen
 */
async function handleGetTypes(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<DocumentTypeResponse> {
	const url = await getBaseUrl.call(this, 'documentTypes');
	
	try {
		const response = await this.helpers.httpRequest({
			url,
			method: 'GET',
			headers: {
				'Accept': 'application/json',
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
	} catch (error: unknown) {
		throw createNodeError(this.getNode(), 'Fehler beim Abrufen der Dokumenttypen', error);
	}
}

/**
 * Implementiert das Abrufen der Dokumenttyp-Klassifikationen
 */
async function handleGetTypeClassifications(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<DocumentTypeResponse> {
	const typeId = this.getNodeParameter('typeId', 0) as string;
	const url = await getBaseUrl.call(this, `documentTypes/${typeId}/classifications`);
	
	try {
		const response = await this.helpers.httpRequest({
			url,
			method: 'GET',
			headers: {
				'Accept': 'application/json',
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
	} catch (error: unknown) {
		throw createNodeError(this.getNode(), 'Fehler beim Abrufen der Dokumenttyp-Klassifikationen', error);
	}
} 