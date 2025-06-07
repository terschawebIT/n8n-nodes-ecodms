import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';
import { createNodeError, getErrorMessage } from '../utils/errorHandler';
import { getBaseUrl } from '../utils/helpers';

interface WorkflowResponse extends IDataObject {
	success?: boolean;
	message?: string;
	data?: IDataObject;
}

/**
 * Behandelt alle Workflow-Operationen für ecoDMS
 */
export async function handleWorkflowOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	let result: WorkflowResponse | INodeExecutionData[];

	switch (operation) {
		case Operation.UploadAndClassify:
			result = await handleUploadAndClassify.call(this, items, credentials);
			break;
		case Operation.SearchAndDownload:
			return await handleSearchAndDownload.call(this, items, credentials);
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
 * Dokument hochladen und sofort klassifizieren
 */
async function handleUploadAndClassify(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<WorkflowResponse> {
	const docId = this.getNodeParameter('docId', 0) as string;
	const url = await getBaseUrl.call(this, `uploadAndClassify/${docId}`);

	try {
		const response = await this.helpers.httpRequest({
			url,
			method: 'POST',
			headers: {
				Accept: 'application/json',
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
		throw createNodeError(this.getNode(), 'Fehler beim Hochladen und Klassifizieren', error);
	}
}

/**
 * Nach Dokumenten suchen und als Binärdaten herunterladen
 */
async function handleSearchAndDownload(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	try {
		const searchTerm = this.getNodeParameter('searchTerm', 0) as string;
		const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
		const limit = this.getNodeParameter('limit', 0, 10) as number;

		// Suche nach Dokumenten
		const searchResponse = await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/search`,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: {
				searchTerm,
				limit,
			},
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});

		if (
			!searchResponse.results ||
			!Array.isArray(searchResponse.results) ||
			searchResponse.results.length === 0
		) {
			return [{ json: { success: true, message: 'Keine Dokumente gefunden' } }];
		}

		const returnItems: INodeExecutionData[] = [];

		// Für jedes gefundene Dokument
		for (const document of searchResponse.results) {
			try {
				const docId = document.id;

				// Dokument herunterladen
				const downloadResponse = await this.helpers.httpRequest({
					url: `${credentials.serverUrl as string}/api/document/${docId}`,
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
				});

				// Dateiname aus Content-Disposition-Header extrahieren
				const contentDisposition = downloadResponse.headers['content-disposition'] as string;
				let fileName = `document_${docId}.pdf`;
				if (contentDisposition) {
					const match = contentDisposition.match(/filename="(.+)"/);
					if (match) {
						fileName = match[1];
					}
				}

				// Mime-Typ bestimmen
				const contentType =
					(downloadResponse.headers['content-type'] as string) || 'application/octet-stream';

				// Neues Item mit Dokumentinformationen und Binärdaten erstellen
				const newItem: INodeExecutionData = {
					json: {
						...document,
						downloadSuccess: true,
					},
					binary: {},
				};

				// Binäre Daten hinzufügen
				newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(
					Buffer.from(downloadResponse.body as Buffer),
					fileName,
					contentType,
				);

				returnItems.push(newItem);
			} catch (error: unknown) {
				// Bei Fehler beim Herunterladen eines einzelnen Dokuments weitermachen
				returnItems.push({
					json: {
						...document,
						downloadSuccess: false,
						downloadError: getErrorMessage(error),
					},
				});
			}
		}

		return returnItems;
	} catch (error: unknown) {
		throw createNodeError(
			this.getNode(),
			'Fehler beim Suchen und Herunterladen der Dokumente',
			error,
		);
	}
}
