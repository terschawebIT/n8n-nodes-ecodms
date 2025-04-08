import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';

/**
 * Behandelt alle Archive-Operationen für ecoDMS
 */
export async function handleArchiveOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[] | IDataObject> {
	switch (operation) {
		case Operation.Connect:
			return await handleConnect.call(this, credentials);
		default:
			throw new NodeOperationError(this.getNode(), `Die Operation "${operation}" wird nicht unterstützt!`);
	}
}

/**
 * Stellt eine Verbindung zum Archiv her
 */
async function handleConnect(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject> {
	try {
		const archiveId = this.getNodeParameter('archiveId', 0) as string;
		const apiKey = this.getNodeParameter('apiKey', 0, '') as string;
		
		const requestBody: IDataObject = {
			archiveId,
		};
		
		if (apiKey) {
			requestBody.apiKey = apiKey;
		}
		
		return await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/connect`,
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: requestBody,
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Fehler beim Herstellen der Verbindung zum Archiv: ${error.message}`,
		);
	}
} 