import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';
import { getBaseUrl } from '../utils/helpers';

interface ArchiveResponse extends IDataObject {
	success?: boolean;
	message?: string;
	data?: IDataObject;
}

/**
 * Behandelt alle Archiv-Operationen für ecoDMS
 */
export async function handleArchiveOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	let result: ArchiveResponse;

	switch (operation) {
		case Operation.GetInfo:
			result = await handleGetArchiveInfo.call(this, credentials);
			break;
		default:
			throw new NodeOperationError(this.getNode(), `Die Operation "${operation}" wird nicht unterstützt!`);
	}

	return [{ json: result }];
}

/**
 * Implementiert das Abrufen der Archiv-Informationen
 */
async function handleGetArchiveInfo(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<ArchiveResponse> {
	const url = await getBaseUrl.call(this, 'archiveInfo');
	
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
		throw new NodeOperationError(this.getNode(), `Fehler beim Abrufen der Archiv-Informationen: ${error.message}`);
	}
} 