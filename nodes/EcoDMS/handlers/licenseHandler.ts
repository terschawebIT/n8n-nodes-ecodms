import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';
import { getBaseUrl } from '../utils/helpers';

interface LicenseResponse extends IDataObject {
	success?: boolean;
	message?: string;
	data?: IDataObject;
}

/**
 * Behandelt alle Lizenz-Operationen für ecoDMS
 */
export async function handleLicenseOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	let result: LicenseResponse | INodeExecutionData[];

	switch (operation) {
		case Operation.GetInfo:
			result = await handleGetLicenseInfo.call(this, credentials);
			break;
		default:
			throw new NodeOperationError(this.getNode(), `Die Operation "${operation}" wird nicht unterstützt!`);
	}

	// Stelle sicher, dass wir immer ein Array von INodeExecutionData zurückgeben
	return Array.isArray(result) ? result : [{ json: result }];
}

/**
 * Implementiert das Abrufen der Lizenzinformationen
 */
async function handleGetLicenseInfo(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<LicenseResponse> {
	const url = await getBaseUrl.call(this, 'licenseInfo');
	
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
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Fehler beim Abrufen der Lizenzinformationen: ${error.message}`);
	}
} 