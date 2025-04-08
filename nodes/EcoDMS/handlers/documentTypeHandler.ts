import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';

/**
 * Behandelt alle DocumentType-Operationen für ecoDMS
 */
export async function handleDocumentTypeOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[] | IDataObject> {
	switch (operation) {
		case Operation.GetTypes:
			return await handleGetTypes.call(this, credentials);
		default:
			throw new NodeOperationError(this.getNode(), `Die Operation "${operation}" wird nicht unterstützt!`);
	}
}

/**
 * Liste aller Dokumenttypen abrufen
 */
async function handleGetTypes(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject> {
	try {
		const result = await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/types`,
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
		
		console.log(`Dokumenttypen abgerufen: ${result.length || 0} Einträge gefunden`);
		
		return { types: Array.isArray(result) ? result : [] };
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Fehler beim Abrufen der Dokumenttypen: ${error.message}`,
		);
	}
} 