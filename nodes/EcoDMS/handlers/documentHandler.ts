import FormData from 'form-data';
import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';
import { createNodeError, getErrorMessage } from '../utils/errorHandler';
import { getBaseUrl } from '../utils/helpers';

interface DocumentResponse extends IDataObject {
	success?: boolean;
	message?: string;
	data?: IDataObject;
}

/**
 * Behandelt alle Document-Operationen für ecoDMS
 */
export async function handleDocumentOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	let result: DocumentResponse | INodeExecutionData[];
	let info: DocumentResponse;

	switch (operation) {
		case Operation.Get:
			result = await handleGetDocument.call(this, credentials);
			break;
		case Operation.GetDocumentInfo:
			info = await handleDocumentInfo.call(this, credentials);
			result = [{ json: info }];
			break;
		case Operation.GetDocumentWithClassification:
			result = await handleGetDocumentWithClassification.call(this, items, credentials);
			break;
		case Operation.GetDocumentVersion:
			result = await handleGetDocumentVersion.call(this, items, credentials);
			break;
		case Operation.Upload:
			result = await handleUploadDocument.call(this, items, credentials);
			break;
		case Operation.AddVersion:
			result = await handleAddDocumentVersion.call(this, items, credentials);
			break;
		case Operation.UploadFile:
			result = await handleUploadFile.call(this, items, credentials);
			break;
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
 * Implementiert das Abrufen der Dokumentinformationen
 */
async function handleDocumentInfo(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<DocumentResponse> {
	const docId = this.getNodeParameter('docId', 0) as string;

	const url = await getBaseUrl.call(this, `documentInfo/${docId}`);
	console.log('Dokument-Info URL:', url);

	try {
		const response = await this.helpers.httpRequest({
			url,
			method: 'GET',
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
		throw createNodeError(this.getNode(), 'Fehler beim Abrufen der Dokumentinformationen', error);
	}
}

/**
 * Implementiert das Herunterladen eines Dokuments
 */
async function handleGetDocument(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	const docId = this.getNodeParameter('docId', 0) as string;
	const binaryPropertyName = this.getNodeParameter('binaryProperty', 0, 'data') as string;

	const downloadUrl = await getBaseUrl.call(this, `document/${docId}`);
	console.log(`Dokument-Download URL: ${downloadUrl}`);

	try {
		// Dokument herunterladen
		const response = await this.helpers.httpRequest({
			url: downloadUrl,
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

		// Metadaten des Dokuments abrufen
		const infoUrl = await getBaseUrl.call(this, `documentInfo/${docId}`);
		console.log(`Dokument-Info URL: ${infoUrl}`);

		let documentInfo: any;
		try {
			documentInfo = await this.helpers.httpRequest({
				url: infoUrl,
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
				json: true,
				auth: {
					username: credentials.username as string,
					password: credentials.password as string,
				},
			});
		} catch (error: unknown) {
			console.error(`Fehler beim Abrufen der Dokumentinformationen: ${getErrorMessage(error)}`);
			// Wenn die Infos nicht abgerufen werden können, erstellen wir ein Basisdokument-Info-Objekt
			documentInfo = {
				docId,
				success: true,
				note: 'Dokumentinformationen konnten nicht abgerufen werden',
			};
		}

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
		const contentType = (response.headers['content-type'] as string) || 'application/octet-stream';

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
	} catch (error: unknown) {
		// Mehr Diagnose-Informationen anzeigen
		let baseMessage = `Fehler beim Herunterladen des Dokuments mit ID ${docId}`;

		if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
			baseMessage = `Das Dokument mit ID ${docId} wurde nicht gefunden oder der Benutzer hat keine Berechtigung zum Herunterladen dieses Dokuments. Bitte prüfen Sie die Dokument-ID und die API-Berechtigungen.`;
		}

		throw createNodeError(this.getNode(), baseMessage, error);
	}
}

/**
 * Implementiert das Herunterladen eines Dokuments mit Klassifikations-ID
 */
async function handleGetDocumentWithClassification(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	const docId = this.getNodeParameter('docId', 0) as string;
	const clDocId = this.getNodeParameter('clDocId', 0) as string;
	const binaryPropertyName = this.getNodeParameter('binaryProperty', 0, 'data') as string;

	const downloadUrl = await getBaseUrl.call(this, `document/${docId}/${clDocId}`);
	console.log(`Dokument-Download URL mit Klassifikation: ${downloadUrl}`);

	try {
		// Dokument herunterladen
		const response = await this.helpers.httpRequest({
			url: downloadUrl,
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
		const contentDisposition = response.headers['content-disposition'] as string;
		let fileName = `document_${docId}_${clDocId}.pdf`;
		if (contentDisposition) {
			const match = contentDisposition.match(/filename="(.+)"/);
			if (match) {
				fileName = match[1];
			}
		}

		// Mime-Typ bestimmen
		const contentType = (response.headers['content-type'] as string) || 'application/octet-stream';

		// Binäre Daten zum Dokument hinzufügen
		const newItem: INodeExecutionData = {
			json: {
				docId,
				clDocId,
				success: true,
			},
			binary: {},
		};

		newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(
			Buffer.from(response.body as Buffer),
			fileName,
			contentType,
		);

		return [newItem];
	} catch (error: unknown) {
		let baseMessage = `Fehler beim Herunterladen des Dokuments mit ID ${docId} und Klassifikations-ID ${clDocId}`;

		if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
			baseMessage = `Das Dokument mit ID ${docId} und Klassifikations-ID ${clDocId} wurde nicht gefunden oder der Benutzer hat keine Berechtigung zum Herunterladen dieses Dokuments.`;
		}

		throw createNodeError(this.getNode(), baseMessage, error);
	}
}

/**
 * Implementiert das Herunterladen einer Dokumentversion
 */
async function handleGetDocumentVersion(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	const docId = this.getNodeParameter('docId', 0) as string;
	const version = this.getNodeParameter('version', 0) as string;
	const binaryPropertyName = this.getNodeParameter('binaryProperty', 0, 'data') as string;

	// Prüfen, ob clDocId angegeben wurde
	let downloadUrl: string;
	const useClassification = this.getNodeParameter('useClassification', 0, false) as boolean;

	if (useClassification) {
		const clDocId = this.getNodeParameter('clDocId', 0) as string;
		downloadUrl = await getBaseUrl.call(this, `document/${docId}/${clDocId}/version/${version}`);
		console.log(`Dokument-Version Download URL mit clDocId: ${downloadUrl}`);
	} else {
		downloadUrl = await getBaseUrl.call(this, `document/${docId}/version/${version}`);
		console.log(`Dokument-Version Download URL: ${downloadUrl}`);
	}

	try {
		// Dokument herunterladen
		const response = await this.helpers.httpRequest({
			url: downloadUrl,
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
		const contentDisposition = response.headers['content-disposition'] as string;
		let fileName = `document_${docId}_v${version}.pdf`;
		if (contentDisposition) {
			const match = contentDisposition.match(/filename="(.+)"/);
			if (match) {
				fileName = match[1];
			}
		}

		// Mime-Typ bestimmen
		const contentType = (response.headers['content-type'] as string) || 'application/octet-stream';

		// Binäre Daten zum Dokument hinzufügen
		const newItem: INodeExecutionData = {
			json: {
				docId,
				version,
				clDocId: useClassification ? this.getNodeParameter('clDocId', 0) : undefined,
				success: true,
				fileName,
				contentType,
			},
			binary: {},
		};

		newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(
			Buffer.from(response.body as Buffer),
			fileName,
			contentType,
		);

		return [newItem];
	} catch (error: unknown) {
		// Mehr Diagnose-Informationen anzeigen
		let baseMessage = `Fehler beim Herunterladen der Dokumentversion mit ID ${docId} und Version ${version}`;

		if (useClassification) {
			const clDocId = this.getNodeParameter('clDocId', 0) as string;
			baseMessage += ` und Klassifikations-ID ${clDocId}`;
		}

		baseMessage += `: ${getErrorMessage(error)}`;

		if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
			baseMessage = `Die angeforderte Dokumentversion (Dokument-ID: ${docId}, Version: ${version}`;

			if (useClassification) {
				const clDocId = this.getNodeParameter('clDocId', 0) as string;
				baseMessage += `, Klassifikations-ID: ${clDocId}`;
			}

			baseMessage +=
				') wurde nicht gefunden oder der Benutzer hat keine Berechtigung zum Herunterladen. Bitte prüfen Sie die IDs, die Versionsnummer und die API-Berechtigungen.';
		}

		throw createNodeError(this.getNode(), baseMessage, error);
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
	const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
	const versionControlled = this.getNodeParameter('versionControlled', 0, false) as boolean;

	const item = items[0];

	if (item.binary === undefined) {
		throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden!');
	}

	if (item.binary[binaryPropertyName] === undefined) {
		throw new NodeOperationError(
			this.getNode(),
			`Keine binären Daten in "${binaryPropertyName}" gefunden!`,
		);
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

		// URL vorbereiten
		const uploadUrl = await getBaseUrl.call(this, `uploadFile/${versionControlled}`);
		console.log('Dokument-Upload URL:', uploadUrl);

		// API-Anfrage für Upload
		const response = await this.helpers.httpRequest({
			url: uploadUrl,
			method: 'POST',
			headers: {
				...formData.getHeaders(),
				Accept: 'application/json',
			},
			body: formData,
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});

		return [
			{
				json: response,
				binary: item.binary,
			},
		];
	} catch (error: unknown) {
		throw createNodeError(this.getNode(), 'Fehler beim Hochladen des Dokuments', error);
	}
}

/**
 * Implementiert das Hinzufügen einer Dokumentversion
 */
async function handleAddDocumentVersion(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	const docId = this.getNodeParameter('docId', 0) as string;
	const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;

	const item = items[0];

	if (item.binary === undefined || item.binary[binaryPropertyName] === undefined) {
		throw new NodeOperationError(
			this.getNode(),
			`Keine binären Daten in "${binaryPropertyName}" gefunden!`,
		);
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

		// URL vorbereiten
		const url = await getBaseUrl.call(this, `addDocumentVersion/${docId}`);
		console.log('Dokument-Version URL:', url);

		// API-Anfrage für Upload einer neuen Version
		const response = await this.helpers.httpRequest({
			url,
			method: 'POST',
			headers: {
				...formData.getHeaders(),
				Accept: 'application/json',
			},
			body: formData,
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});

		return [
			{
				json: response,
				binary: item.binary,
			},
		];
	} catch (error: unknown) {
		throw createNodeError(
			this.getNode(),
			'Fehler beim Hinzufügen einer neuen Dokumentversion',
			error,
		);
	}
}

/**
 * Implementiert das Hochladen einer Datei (allgemein)
 */
async function handleUploadFile(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;

	const item = items[0];

	if (item.binary === undefined || item.binary[binaryPropertyName] === undefined) {
		throw new NodeOperationError(
			this.getNode(),
			`Keine binären Daten in "${binaryPropertyName}" gefunden!`,
		);
	}

	const binaryData = item.binary[binaryPropertyName];

	try {
		// FormData erstellen
		const formData = new FormData();

		// Datei hinzufügen
		formData.append('file', Buffer.from(binaryData.data, 'base64'), {
			filename: binaryData.fileName || 'document.pdf',
			contentType: binaryData.mimeType,
		});

		// URL vorbereiten
		const url = await getBaseUrl.call(this, 'uploadFile');
		console.log('Datei-Upload URL:', url);

		// API-Anfrage für Upload
		const response = await this.helpers.httpRequest({
			url,
			method: 'POST',
			headers: {
				...formData.getHeaders(),
				Accept: 'application/json',
			},
			body: formData,
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});

		return [
			{
				json: response,
				binary: item.binary,
			},
		];
	} catch (error: unknown) {
		throw createNodeError(this.getNode(), 'Fehler beim Hochladen der Datei', error);
	}
}
