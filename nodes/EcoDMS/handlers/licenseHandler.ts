import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';

/**
 * Behandelt alle License-Operationen für ecoDMS
 */
export async function handleLicenseOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[] | IDataObject> {
	switch (operation) {
		case Operation.GetInfo:
			return await handleGetLicenseInfo.call(this, credentials);
		default:
			throw new NodeOperationError(this.getNode(), `Die Operation "${operation}" wird nicht unterstützt!`);
	}
}

/**
 * Informationen über die aktuelle Lizenz abrufen
 */
async function handleGetLicenseInfo(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject> {
	try {
		return await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/getLicenseInfo`,
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
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Fehler beim Abrufen der Lizenzinformationen: ${error.message}`,
		);
	}
} 