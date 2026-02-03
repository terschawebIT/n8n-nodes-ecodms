import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';
import { createNodeError } from '../utils/errorHandler';
import { getBaseUrl, shouldSkipSslValidation } from '../utils/helpers';

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
	_items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	let result: ArchiveResponse;

	switch (operation) {
		case Operation.Connect:
			result = await handleConnectArchive.call(this, credentials);
			break;
		case Operation.GetInfo:
			result = await handleGetArchiveInfo.call(this, credentials);
			break;
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Die Operation "${operation}" wird nicht unterstützt!`,
			);
	}

	return [{ json: result }];
}

/**
 * Implementiert die Verbindung zum Archiv
 * GET ohne API-Key, POST mit API-Key (laut API-Doku)
 */
async function handleConnectArchive(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<ArchiveResponse> {
	const archiveId = this.getNodeParameter('archiveId', 0) as string;
	const apiKey = this.getNodeParameter('apiKey', 0, '') as string;

	try {
		// Verbindung zum Archiv herstellen
		const connectUrl = await getBaseUrl.call(this, `connect/${archiveId}`);

		let connectResponse: IDataObject;

		if (apiKey) {
			// Mit API-Key: POST Request
			connectResponse = await this.helpers.httpRequest({
				url: connectUrl,
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: { apiKey },
				json: true,
				auth: {
					username: credentials.username as string,
					password: credentials.password as string,
				},
				skipSslCertificateValidation: await shouldSkipSslValidation.call(this),
			});
		} else {
			// Ohne API-Key: GET Request
			connectResponse = await this.helpers.httpRequest({
				url: connectUrl,
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
				json: true,
				auth: {
					username: credentials.username as string,
					password: credentials.password as string,
				},
				skipSslCertificateValidation: await shouldSkipSslValidation.call(this),
			});
		}

		// Status prüfen nach Verbindung
		const statusUrl = await getBaseUrl.call(this, 'status');
		const statusResponse = await this.helpers.httpRequest({
			url: statusUrl,
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
			skipSslCertificateValidation: await shouldSkipSslValidation.call(this),
		});

		return {
			success: true,
			message: 'Erfolgreich mit Archiv verbunden',
			data: {
				archiveId,
				connection: connectResponse,
				status: statusResponse,
			},
		};
	} catch (error: unknown) {
		throw createNodeError(this.getNode(), 'Fehler beim Verbinden mit dem Archiv', error);
	}
}

/**
 * Implementiert das Abrufen der Archiv-Informationen
 * Ruft /api/archives (Liste) und /api/status (aktueller Status) ab
 */
async function handleGetArchiveInfo(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<ArchiveResponse> {
	try {
		// 1. Liste aller Archive abrufen (braucht keine Auth!)
		const archivesUrl = await getBaseUrl.call(this, 'archives');
		const archivesResponse = await this.helpers.httpRequest({
			url: archivesUrl,
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			json: true,
			skipSslCertificateValidation: await shouldSkipSslValidation.call(this),
		});

		// 2. Status abrufen (braucht Auth)
		const statusUrl = await getBaseUrl.call(this, 'status');
		const statusResponse = await this.helpers.httpRequest({
			url: statusUrl,
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
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
				archives: archivesResponse,
				status: statusResponse,
			},
		};
	} catch (error: unknown) {
		throw createNodeError(this.getNode(), 'Fehler beim Abrufen der Archiv-Informationen', error);
	}
}
