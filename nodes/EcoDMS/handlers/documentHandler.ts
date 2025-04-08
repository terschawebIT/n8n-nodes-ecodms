import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';
import FormData from 'form-data';
import { basename } from 'path';

/**
 * Behandelt alle Document-Operationen für ecoDMS
 */
export async function handleDocumentOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[] | IDataObject> {
	switch (operation) {
		case Operation.Get:
			return await handleGetDocument.call(this, credentials);
		case Operation.GetDocumentInfo:
			return await handleDownloadDocument.call(this, items, credentials);
		case Operation.Upload:
			return await handleUploadDocument.call(this, items, credentials);
		case Operation.AddVersion:
			return await handleDeleteDocument.call(this, credentials);
		case Operation.UploadFile:
			return await handleMoveDocument.call(this, credentials);
		default:
			throw new NodeOperationError(this.getNode(), `Die Operation "${operation}" wird nicht unterstützt!`);
	}
}

/**
 * Implementiert das Abrufen eines Dokuments
 */
async function handleGetDocument(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject> {
	const docId = this.getNodeParameter('docId', 0) as string;
	
	return await this.helpers.httpRequest({
		url: `${credentials.serverUrl as string}/api/getDocument/${docId}`,
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
}

/**
 * Implementiert das Herunterladen eines Dokuments
 */
async function handleDownloadDocument(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	const docId = this.getNodeParameter('docId', 0) as string;
	const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
	
	try {
		// Dokument herunterladen
		const response = await this.helpers.httpRequest({
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
		
		// Metadaten des Dokuments abrufen
		const documentInfo = await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/getDocument/${docId}`,
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
		
		// Dateiname aus Content-Disposition-Header extrahieren
		const contentDisposition = response.headers['content-disposition'] as string;
		let fileName = `document_${docId}.pdf`;
		if (contentDisposition) {
			const match = contentDisposition.match(/filename="(.+)"/);
			if (match) {
				fileName = match[1];
			}
		}
		
		// Mime-Typ bestimmen
		const contentType = response.headers['content-type'] as string || 'application/octet-stream';
		
		// Binäre Daten zum Dokument hinzufügen
		const newItem: INodeExecutionData = {
			json: documentInfo,
			binary: {},
		};
		
		newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(
			Buffer.from(response.body as Buffer),
			fileName,
			contentType,
		);
		
		return [newItem];
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Fehler beim Herunterladen des Dokuments: ${error.message}`);
	}
}

/**
 * Implementiert das Hochladen eines Dokuments
 */
async function handleUploadDocument(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	const uploadData = this.getNodeParameter('uploadData', 0) as IDataObject;
	const binaryPropertyName = uploadData.binaryPropertyName as string;
	
	const item = items[0];
	
	if (item.binary === undefined) {
		throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden!');
	}
	
	if (item.binary[binaryPropertyName] === undefined) {
		throw new NodeOperationError(this.getNode(), `Keine binären Daten in "${binaryPropertyName}" gefunden!`);
	}
	
	const binaryData = item.binary[binaryPropertyName];
	
	try {
		// FormData erstellen
		const formData = new FormData();
		
		// Dokumentendaten hinzufügen
		formData.append('file', Buffer.from(binaryData.data, 'base64'), {
			filename: binaryData.fileName || 'document.pdf',
			contentType: binaryData.mimeType,
		});
		
		// Klassifizierung hinzufügen
		if (uploadData.classify) {
			const classifyData = uploadData.classify as IDataObject;
			
			for (const key of Object.keys(classifyData)) {
				if (key !== 'additionalFields') {
					formData.append(`classify[${key}]`, classifyData[key] as string);
				}
			}
			
			// Zusätzliche Felder hinzufügen
			if (classifyData.additionalFields) {
				const additionalFields = classifyData.additionalFields as IDataObject;
				for (const key of Object.keys(additionalFields)) {
					formData.append(`classify[${key}]`, additionalFields[key] as string);
				}
			}
		}
		
		// API-Anfrage für Upload
		const response = await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/upload`,
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
		throw new NodeOperationError(this.getNode(), `Fehler beim Hochladen des Dokuments: ${error.message}`);
	}
}

/**
 * Implementiert das Löschen eines Dokuments
 */
async function handleDeleteDocument(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject> {
	const docId = this.getNodeParameter('docId', 0) as string;
	const forceDelete = this.getNodeParameter('forceDelete', 0, false) as boolean;
	
	const endpoint = forceDelete ? 'deleteDocument' : 'trashDocument';
	
	return await this.helpers.httpRequest({
		url: `${credentials.serverUrl as string}/api/${endpoint}/${docId}`,
		method: 'DELETE',
		headers: {
			'Accept': 'application/json',
		},
		json: true,
		auth: {
			username: credentials.username as string,
			password: credentials.password as string,
		},
	});
}

/**
 * Implementiert das Verschieben eines Dokuments
 */
async function handleMoveDocument(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject> {
	const docId = this.getNodeParameter('docId', 0) as string;
	const targetFolder = this.getNodeParameter('targetFolder', 0) as string;
	
	return await this.helpers.httpRequest({
		url: `${credentials.serverUrl as string}/api/moveDocument`,
		method: 'PUT',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: {
			docId,
			folder: targetFolder,
		},
		json: true,
		auth: {
			username: credentials.username as string,
			password: credentials.password as string,
		},
	});
} 