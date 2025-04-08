import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
	BINARY_ENCODING,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';
import FormData from 'form-data';

/**
 * Behandelt alle Workflow-Operationen für ecoDMS
 */
export async function handleWorkflowOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[] | IDataObject> {
	switch (operation) {
		case Operation.UploadAndClassify:
			return await handleUploadAndClassify.call(this, items, credentials);
		case Operation.SearchAndDownload:
			return await handleSearchAndDownload.call(this, items, credentials);
		default:
			throw new NodeOperationError(this.getNode(), `Die Operation "${operation}" wird nicht unterstützt!`);
	}
}

/**
 * Dokument hochladen und sofort klassifizieren
 */
async function handleUploadAndClassify(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	try {
		const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
		const classifyAttributes = this.getNodeParameter('classifyAttributes', 0) as string;
		const editRoles = this.getNodeParameter('editRoles', 0, '') as string;
		const readRoles = this.getNodeParameter('readRoles', 0, '') as string;
		
		const item = items[0];
		
		if (item.binary === undefined) {
			throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden!');
		}
		
		if (item.binary[binaryPropertyName] === undefined) {
			throw new NodeOperationError(this.getNode(), `Keine binären Daten in "${binaryPropertyName}" gefunden!`);
		}
		
		const binaryData = item.binary[binaryPropertyName];
		
		// Klassifikationsattribute parsen
		let classifyData: IDataObject;
		try {
			classifyData = JSON.parse(classifyAttributes);
		} catch (e) {
			throw new NodeOperationError(this.getNode(), 'Ungültiges JSON-Format für Klassifikationsattribute!');
		}
		
		// FormData erstellen
		const formData = new FormData();
		
		// Dokumentendaten hinzufügen
		formData.append('file', Buffer.from(binaryData.data, 'base64'), {
			filename: binaryData.fileName || 'document.pdf',
			contentType: binaryData.mimeType,
		});
		
		// Klassifizierung hinzufügen
		for (const key of Object.keys(classifyData)) {
			formData.append(`classify[${key}]`, classifyData[key] as string);
		}
		
		// Rollen hinzufügen, wenn vorhanden
		if (editRoles) {
			formData.append('editRoles', editRoles);
		}
		
		if (readRoles) {
			formData.append('readRoles', readRoles);
		}
		
		// API-Anfrage für Upload und Klassifizierung
		const response = await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/uploadAndClassify`,
			method: 'POST',
			headers: {
				...formData.getHeaders(),
				'Accept': 'application/json',
			},
			body: formData,
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});
		
		return [{
			json: response,
			binary: item.binary,
		}];
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Fehler beim Hochladen und Klassifizieren des Dokuments: ${error.message}`,
		);
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
				'Accept': 'application/json',
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
		
		if (!searchResponse.results || !Array.isArray(searchResponse.results) || searchResponse.results.length === 0) {
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
						'Accept': '*/*',
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
				const contentType = downloadResponse.headers['content-type'] as string || 'application/octet-stream';
				
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
			} catch (error) {
				// Bei Fehler beim Herunterladen eines einzelnen Dokuments weitermachen
				returnItems.push({
					json: {
						...document,
						downloadSuccess: false,
						downloadError: error.message,
					},
				});
			}
		}
		
		return returnItems;
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Fehler beim Suchen und Herunterladen der Dokumente: ${error.message}`,
		);
	}
} 