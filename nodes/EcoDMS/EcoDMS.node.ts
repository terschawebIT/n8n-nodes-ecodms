import {
	BINARY_ENCODING,
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IRequestOptions,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

import { Resource, Operation } from './utils/constants';
import { documentOperations, documentFields } from './resources/document';
import { classificationOperations, classificationFields } from './resources/classification';
import { archiveOperations, archiveFields } from './resources/archive';
import { searchOperations, searchFields } from './resources/search';
import { folderOperations, folderFields } from './resources/folder';
import { licenseOperations, licenseFields } from './resources/license';
import { workflowOperations, workflowFields } from './resources/workflow';
import { getFolders, getDocumentTypes, getStatusValues } from './utils/helpers';

export { Resource, Operation };

export class EcoDMS implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ecoDMS',
		name: 'ecoDMS',
		icon: 'file:ecoDms.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'ecoDMS-Integration für n8n',
		defaults: {
			name: 'ecoDMS',
		},
		inputs: [{type: NodeConnectionType.Main}],
		outputs: [{type: NodeConnectionType.Main}],
		credentials: [
			{
				name: 'ecoDmsApi',
				required: true,
			},
		],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Archiv',
						value: Resource.Archive,
						description: 'Archiv verwalten',
					},
					{
						name: 'Dokument',
						value: Resource.Document,
						description: 'Dokumente verwalten',
					},
					{
						name: 'Klassifikation',
						value: Resource.Classification,
						description: 'Dokumente klassifizieren',
					},
					{
						name: 'Suche',
						value: Resource.Search,
						description: 'Nach Dokumenten suchen',
					},
					{
						name: 'Ordner',
						value: Resource.Folder,
						description: 'Ordner verwalten',
					},
					{
						name: 'Lizenz',
						value: Resource.License,
						description: 'Lizenzinformationen abrufen',
					},
					{
						name: 'Workflow',
						value: Resource.Workflow,
						description: 'Kombinierte Operationen für vereinfachte Workflows',
					},
				],
				default: Resource.Document,
				required: true,
			},
			
			// Operations für die verschiedenen Ressourcentypen
			documentOperations,
			classificationOperations,
			archiveOperations,
			searchOperations,
			folderOperations,
			licenseOperations,
			workflowOperations,
			
			// Parameter für die Ressourcentypen
			...documentFields,
			...classificationFields,
			...archiveFields,
			...searchFields,
			...folderFields,
			...licenseFields,
			...workflowFields,
		],
	};

	// Methode zum Laden der dynamischen Optionen für Dropdown-Menüs
	async loadOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const methodName = this.getNodeParameter('loadOptionsMethod', 0) as string;
		
		const options: INodePropertyOptions[] = [];
		
		try {
			// Implementierungen in der Helfer-Datei aufrufen
			if (methodName === 'getFolders') {
				// Ordner laden
				return await getFolders.call(this);
			} else if (methodName === 'getDocumentTypes') {
				// Dokumentarten laden
				return await getDocumentTypes.call(this);
			} else if (methodName === 'getStatusValues') {
				// Status-Werte laden
				return await getStatusValues.call(this);
			}
		} catch (error) {
			console.error(`Fehler beim Laden der Optionen für '${methodName}':`, error);
		}
		
		return options;
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		// Einfach als any deklarieren, um TypeScript-Probleme zu vermeiden
		// In der tatsächlichen Implementierung wird dieser mit korrekten Typen gefüllt
		let responseData: any;
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const credentials = await this.getCredentials('ecoDmsApi');
		
		// Prüfe, ob die Server-URL gültig ist
		if (!credentials.serverUrl) {
			throw new NodeOperationError(this.getNode(), 'Server-URL ist nicht konfiguriert. Bitte in den Anmeldedaten angeben.');
		}

		if (resource === 'archive' && operation === 'connect') {
			// Verbindung zum Archiv herstellen
			const archiveId = this.getNodeParameter('archiveId', 0) as string;
			const apiKey = this.getNodeParameter('apiKey', 0) as string;
			
			if (apiKey) {
				// Wenn API-Key vorhanden, dann POST-Anfrage
				responseData = await this.helpers.httpRequest({
					url: `${credentials.serverUrl as string}/api/connect/${archiveId}`,
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: {
						apiKey,
					},
					json: true,
					auth: {
						username: credentials.username as string,
						password: credentials.password as string,
					},
				});
			} else {
				// Ohne API-Key, GET-Anfrage
				responseData = await this.helpers.httpRequest({
					url: `${credentials.serverUrl as string}/api/connect/${archiveId}`,
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

			// Status prüfen
			const statusResponse = await this.helpers.httpRequest({
				url: `${credentials.serverUrl as string}/api/status`,
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
			
			// Status zur Antwort hinzufügen
			responseData = {
				connection: responseData,
				status: statusResponse,
			};
		} else if (resource === 'license' && operation === 'getInfo') {
			// Lizenzinformationen abrufen
			responseData = await this.helpers.httpRequest({
				url: `${credentials.serverUrl as string}/api/licenseInfo`,
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
		} else {
			// Alle anderen API-Aufrufe ohne explizite Archiv-Verbindung
			
			// Die eigentliche Operation ausführen
			if (resource === 'document') {
				if (operation === 'get') {
					// Dokument herunterladen
					const documentId = this.getNodeParameter('docId', 0) as string;
					const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
					
					// Für Dokument-Download müssen wir */* als Accept-Header verwenden
					const response = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/document/${documentId}`,
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
					
					const newItem: INodeExecutionData = {
						json: items[0].json,
						binary: {},
					};
					
					if (items[0].binary !== undefined) {
						newItem.binary = items[0].binary;
					}
					
					// Dateiname aus Content-Disposition-Header extrahieren oder fallback verwenden
					const contentDisposition = response.headers['content-disposition'] as string;
					let fileName = `document_${documentId}.pdf`;
					if (contentDisposition) {
						const match = contentDisposition.match(/filename="(.+)"/);
						if (match) {
							fileName = match[1];
						}
					}
					
					// Mime-Typ aus Content-Type-Header extrahieren oder fallback verwenden
					const contentType = response.headers['content-type'] as string || 'application/octet-stream';
					
					// Binäre Daten hinzufügen
					newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(
						Buffer.from(response.body as Buffer),
						fileName,
						contentType,
					);
					
					responseData = [newItem];
				} else if (operation === 'upload') {
					// Dokument hochladen
					const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
					const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;
					
					if (items[0].binary === undefined) {
						throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden');
					}
					
					const binaryData = items[0].binary[binaryPropertyName];
					if (binaryData === undefined) {
						throw new NodeOperationError(
							this.getNode(),
							`Keine binären Daten in der Eigenschaft "${binaryPropertyName}" gefunden`,
						);
					}
					
					const dataBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);
					
					// Multipart-Daten für den Upload erstellen
					const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
					const multipartData: Buffer[] = [];
					
					// Datei hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${binaryData.fileName || 'document.pdf'}"\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Type: ${binaryData.mimeType}\r\n\r\n`, 'utf8'));
					multipartData.push(dataBuffer);
					multipartData.push(Buffer.from('\r\n', 'utf8'));
					
					// Zusätzliche Felder hinzufügen
					if (additionalFields.title) {
						multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Disposition: form-data; name="title"\r\n\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`${additionalFields.title}\r\n`, 'utf8'));
					}
					if (additionalFields.description) {
						multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Disposition: form-data; name="description"\r\n\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`${additionalFields.description}\r\n`, 'utf8'));
					}
					if (additionalFields.documentType) {
						multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Disposition: form-data; name="documentType"\r\n\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`${additionalFields.documentType}\r\n`, 'utf8'));
					}
					
					// Abschließender Boundary
					multipartData.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
					
					// Dokument hochladen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/document`,
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': `multipart/form-data; boundary=${boundary}`,
						},
						body: Buffer.concat(multipartData),
						json: true,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
				} else if (operation === 'getDocumentWithClassification') {
					// Dokument mit bestimmter Klassifikation herunterladen
					const documentId = this.getNodeParameter('docId', 0) as string;
					const classificationId = this.getNodeParameter('clDocId', 0) as string;
					const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
					
					// Für Dokument-Download müssen wir */* als Accept-Header verwenden
					const response = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/document/${documentId}/${classificationId}`,
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
					
					const newItem: INodeExecutionData = {
						json: items[0].json,
						binary: {},
					};
					
					if (items[0].binary !== undefined) {
						newItem.binary = items[0].binary;
					}
					
					// Dateiname aus Content-Disposition-Header extrahieren oder fallback verwenden
					const contentDisposition = response.headers['content-disposition'] as string;
					let fileName = `document_${documentId}_cl${classificationId}.pdf`;
					if (contentDisposition) {
						const match = contentDisposition.match(/filename="(.+)"/);
						if (match) {
							fileName = match[1];
						}
					}
					
					// Mime-Typ aus Content-Type-Header extrahieren oder fallback verwenden
					const contentType = response.headers['content-type'] as string || 'application/octet-stream';
					
					// Binäre Daten hinzufügen
					newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(
						Buffer.from(response.body as Buffer),
						fileName,
						contentType,
					);
					
					responseData = [newItem];
				} else if (operation === 'uploadToInbox') {
					// PDF-Datei in Inbox hochladen
					const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
					const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;
					
					// Prüfen, ob binäre Daten vorhanden sind
					if (items[0].binary === undefined) {
						throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden');
					}
					
					// PDF-Datei prüfen
					const binaryData = items[0].binary[binaryPropertyName];
					if (binaryData === undefined) {
						throw new NodeOperationError(
							this.getNode(),
							`Keine binären Daten in der Eigenschaft "${binaryPropertyName}" gefunden`,
						);
					}
					
					// Binäre Daten laden
					const dataBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);
					
					// Prüfen, ob es sich um eine PDF-Datei handelt
					if (binaryData.mimeType !== 'application/pdf' && !binaryData.fileName?.toLowerCase().endsWith('.pdf')) {
						throw new NodeOperationError(
							this.getNode(),
							'Für den Upload in die Inbox werden nur PDF-Dateien unterstützt',
						);
					}
					
					// Benutzerrechte einrichten, falls angegeben
					let queryParams = '';
					if (additionalFields.rights && Array.isArray(additionalFields.rights)) {
						const rights = additionalFields.rights as string[];
						queryParams = rights.map(right => `rights=${encodeURIComponent(right)}`).join('&');
						if (queryParams) {
							queryParams = '?' + queryParams;
						}
					}
					
					// Multipart-Daten für den Upload erstellen
					const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
					const multipartData: Buffer[] = [];
					
					// Datei hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${binaryData.fileName || 'document.pdf'}"\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Type: ${binaryData.mimeType}\r\n\r\n`, 'utf8'));
					multipartData.push(dataBuffer);
					multipartData.push(Buffer.from('\r\n', 'utf8'));
					
					// Abschließender Boundary
					multipartData.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
					
					// Dokument hochladen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/uploadFileToInbox${queryParams}`,
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': `multipart/form-data; boundary=${boundary}`,
						},
						body: Buffer.concat(multipartData),
						json: true,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
				} else if (operation === 'uploadWithPdf') {
					// Dokument mit PDF hochladen
					const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
					const pdfPropertyName = this.getNodeParameter('pdfProperty', 0) as string;
					const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;
					const versionControlled = this.getNodeParameter('versionControlled', 0, false) as boolean;
					
					// Prüfen, ob binäre Daten vorhanden sind
					if (items[0].binary === undefined) {
						throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden');
					}
					
					// Originaldatei prüfen
					const binaryData = items[0].binary[binaryPropertyName];
					if (binaryData === undefined) {
						throw new NodeOperationError(
							this.getNode(),
							`Keine binären Daten in der Eigenschaft "${binaryPropertyName}" gefunden`,
						);
					}
					
					// PDF-Datei prüfen
					const pdfData = items[0].binary[pdfPropertyName];
					if (pdfData === undefined) {
						throw new NodeOperationError(
							this.getNode(),
							`Keine binären Daten in der Eigenschaft "${pdfPropertyName}" gefunden`,
						);
					}
					
					// Binäre Daten laden
					const fileBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);
					const pdfBuffer = await this.helpers.getBinaryDataBuffer(0, pdfPropertyName);
					
					// Multipart-Daten für den Upload erstellen
					const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
					const multipartData: Buffer[] = [];
					
					// Originaldatei hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${binaryData.fileName || 'document'}"\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Type: ${binaryData.mimeType}\r\n\r\n`, 'utf8'));
					multipartData.push(fileBuffer);
					multipartData.push(Buffer.from('\r\n', 'utf8'));
					
					// PDF-Datei hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="pdfFile"; filename="${pdfData.fileName || 'document.pdf'}"\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Type: ${pdfData.mimeType}\r\n\r\n`, 'utf8'));
					multipartData.push(pdfBuffer);
					multipartData.push(Buffer.from('\r\n', 'utf8'));
					
					// Zusätzliche Felder hinzufügen
					if (additionalFields.title) {
						multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Disposition: form-data; name="title"\r\n\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`${additionalFields.title}\r\n`, 'utf8'));
					}
					if (additionalFields.description) {
						multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Disposition: form-data; name="description"\r\n\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`${additionalFields.description}\r\n`, 'utf8'));
					}
					if (additionalFields.documentType) {
						multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Disposition: form-data; name="documentType"\r\n\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`${additionalFields.documentType}\r\n`, 'utf8'));
					}
					
					// Abschließender Boundary
					multipartData.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
					
					// Dokument hochladen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/uploadFileWithPdf/${versionControlled}`,
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': `multipart/form-data; boundary=${boundary}`,
						},
						body: Buffer.concat(multipartData),
						json: true,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
				} else if (operation === 'getDocumentInfo') {
					// Metadaten eines Dokuments abrufen
					const documentId = this.getNodeParameter('docId', 0) as string;
					
					// API-Aufruf durchführen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/document/${documentId}/info`,
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
				} else if (operation === 'uploadFile') {
					// Datei direkt hochladen
					const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
					const versionControlled = this.getNodeParameter('versionControlled', 0, false) as boolean;
					const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;
					
					// Prüfen, ob binäre Daten vorhanden sind
					if (items[0].binary === undefined) {
						throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden');
					}
					
					// Datei prüfen
					const binaryData = items[0].binary[binaryPropertyName];
					if (binaryData === undefined) {
						throw new NodeOperationError(
							this.getNode(),
							`Keine binären Daten in der Eigenschaft "${binaryPropertyName}" gefunden`,
						);
					}
					
					// Binäre Daten laden
					const dataBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);
					
					// Multipart-Daten für den Upload erstellen
					const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
					const multipartData: Buffer[] = [];
					
					// Datei hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${binaryData.fileName || 'document'}"\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Type: ${binaryData.mimeType}\r\n\r\n`, 'utf8'));
					multipartData.push(dataBuffer);
					multipartData.push(Buffer.from('\r\n', 'utf8'));
					
					// Zusätzliche Felder hinzufügen
					if (additionalFields.title) {
						multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Disposition: form-data; name="title"\r\n\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`${additionalFields.title}\r\n`, 'utf8'));
					}
					if (additionalFields.description) {
						multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Disposition: form-data; name="description"\r\n\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`${additionalFields.description}\r\n`, 'utf8'));
					}
					if (additionalFields.documentType) {
						multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Disposition: form-data; name="documentType"\r\n\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`${additionalFields.documentType}\r\n`, 'utf8'));
					}
					
					// Abschließender Boundary
					multipartData.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
					
					// Dokument hochladen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/uploadFile/${versionControlled}`,
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': `multipart/form-data; boundary=${boundary}`,
						},
						body: Buffer.concat(multipartData),
						json: true,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
				} else if (operation === 'checkDuplicates') {
					// Prüfen, ob ein Dokument bereits vorhanden ist
					const binary = this.getNodeParameter('binary', 0) as boolean;
					const maxMatchValue = this.getNodeParameter('maxMatchValue', 0) as number;
					
					if (binary) {
						// Prüfung auf Basis einer Datei
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;
						
						// Prüfen, ob binäre Daten vorhanden sind
						if (items[0].binary === undefined) {
							throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden');
						}
						
						// Datei prüfen
						const binaryData = items[0].binary[binaryPropertyName];
						if (binaryData === undefined) {
							throw new NodeOperationError(
								this.getNode(),
								`Keine binären Daten in der Eigenschaft "${binaryPropertyName}" gefunden`,
							);
						}
						
						// Binäre Daten laden
						const dataBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);
						
						// Multipart-Daten für den Upload erstellen
						const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
						const multipartData: Buffer[] = [];
						
						// Datei hinzufügen
						multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${binaryData.fileName || 'document'}"\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Type: ${binaryData.mimeType}\r\n\r\n`, 'utf8'));
						multipartData.push(dataBuffer);
						multipartData.push(Buffer.from('\r\n', 'utf8'));
						
						// MatchValue hinzufügen
						multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Disposition: form-data; name="maxMatchValue"\r\n\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`${maxMatchValue}\r\n`, 'utf8'));
						
						// Abschließender Boundary
						multipartData.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
						
						// Duplikate prüfen
						responseData = await this.helpers.httpRequest({
							url: `${credentials.serverUrl as string}/api/checkDuplicatesWithPdf`,
							method: 'POST',
							headers: {
								'Accept': 'application/json',
								'Content-Type': `multipart/form-data; boundary=${boundary}`,
							},
							body: Buffer.concat(multipartData),
							json: true,
							auth: {
								username: credentials.username as string,
								password: credentials.password as string,
							},
						});
					} else {
						// Prüfung auf Basis eines existierenden Dokuments
						const documentId = this.getNodeParameter('docId', 0) as string;
						
						// Duplikate prüfen
						responseData = await this.helpers.httpRequest({
							url: `${credentials.serverUrl as string}/api/checkDuplicates/${documentId}/${maxMatchValue}`,
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
				} else if (operation === 'getTemplatesForFile') {
					// Templates für Datei abrufen
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;
					
					// Prüfen, ob binäre Daten vorhanden sind
					if (items[0].binary === undefined) {
						throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden');
					}
					
					// Datei prüfen
					const binaryData = items[0].binary[binaryPropertyName];
					if (binaryData === undefined) {
						throw new NodeOperationError(
							this.getNode(),
							`Keine binären Daten in der Eigenschaft "${binaryPropertyName}" gefunden`,
						);
					}
					
					// Binäre Daten laden
					const dataBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);
					
					// Multipart-Daten für den Upload erstellen
					const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
					const multipartData: Buffer[] = [];
					
					// Datei hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${binaryData.fileName || 'document'}"\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Type: ${binaryData.mimeType}\r\n\r\n`, 'utf8'));
					multipartData.push(dataBuffer);
					multipartData.push(Buffer.from('\r\n', 'utf8'));
					
					// Abschließender Boundary
					multipartData.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
					
					// Templates abrufen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/getTemplatesForFile`,
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': `multipart/form-data; boundary=${boundary}`,
						},
						body: Buffer.concat(multipartData),
						json: true,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
				} else if (operation === 'addVersion') {
					// Version zu einem bestehenden Dokument hinzufügen
					const docId = this.getNodeParameter('docId', 0) as number;
					const fixed = this.getNodeParameter('fixed', 0) as boolean;
					const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
					
					// Prüfen, ob binäre Daten vorhanden sind
					if (items[0].binary === undefined) {
						throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden');
					}
					
					// Datei prüfen
					const binaryData = items[0].binary[binaryPropertyName];
					if (binaryData === undefined) {
						throw new NodeOperationError(
							this.getNode(),
							`Keine binären Daten in der Eigenschaft "${binaryPropertyName}" gefunden`,
						);
					}
					
					// Binäre Daten laden
					const dataBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);
					
					// Multipart-Daten für den Upload erstellen
					const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
					const multipartData: Buffer[] = [];
					
					// Datei hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${binaryData.fileName || 'document'}"\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Type: ${binaryData.mimeType}\r\n\r\n`, 'utf8'));
					multipartData.push(dataBuffer);
					multipartData.push(Buffer.from('\r\n', 'utf8'));
					
					// Fixed-Parameter hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="fixed"\r\n\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`${fixed}\r\n`, 'utf8'));
					
					// Abschließender Boundary
					multipartData.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
					
					// Version hinzufügen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/document/${docId}/addVersion`,
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': `multipart/form-data; boundary=${boundary}`,
						},
						body: Buffer.concat(multipartData),
						json: true,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
				} else if (operation === 'addVersionWithPdf') {
					// Version mit PDF zu einem bestehenden Dokument hinzufügen
					const docId = this.getNodeParameter('docId', 0) as number;
					const fixed = this.getNodeParameter('fixed', 0) as boolean;
					const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
					const pdfPropertyName = this.getNodeParameter('pdfProperty', 0) as string;
					
					// Prüfen, ob binäre Daten vorhanden sind
					if (items[0].binary === undefined) {
						throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden');
					}
					
					// Originaldatei prüfen
					const binaryData = items[0].binary[binaryPropertyName];
					if (binaryData === undefined) {
						throw new NodeOperationError(
							this.getNode(),
							`Keine binären Daten in der Eigenschaft "${binaryPropertyName}" gefunden`,
						);
					}
					
					// PDF-Datei prüfen
					const pdfData = items[0].binary[pdfPropertyName];
					if (pdfData === undefined) {
						throw new NodeOperationError(
							this.getNode(),
							`Keine binären Daten in der Eigenschaft "${pdfPropertyName}" gefunden`,
						);
					}
					
					// Binäre Daten laden
					const fileBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);
					const pdfBuffer = await this.helpers.getBinaryDataBuffer(0, pdfPropertyName);
					
					// Multipart-Daten für den Upload erstellen
					const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
					const multipartData: Buffer[] = [];
					
					// Originaldatei hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${binaryData.fileName || 'document'}"\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Type: ${binaryData.mimeType}\r\n\r\n`, 'utf8'));
					multipartData.push(fileBuffer);
					multipartData.push(Buffer.from('\r\n', 'utf8'));
					
					// PDF-Datei hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="pdfFile"; filename="${pdfData.fileName || 'document.pdf'}"\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Type: ${pdfData.mimeType}\r\n\r\n`, 'utf8'));
					multipartData.push(pdfBuffer);
					multipartData.push(Buffer.from('\r\n', 'utf8'));
					
					// Fixed-Parameter hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="fixed"\r\n\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`${fixed}\r\n`, 'utf8'));
					
					// Abschließender Boundary
					multipartData.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
					
					// Version mit PDF hinzufügen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/document/${docId}/addVersionWithPdf`,
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': `multipart/form-data; boundary=${boundary}`,
						},
						body: Buffer.concat(multipartData),
						json: true,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
				} else if (operation === 'getClassificationWithTemplateRecognition') {
					// Klassifikation mit Template-Erkennung abrufen
					const mode = this.getNodeParameter('mode', 0) as string;
					
					if (mode === 'file') {
						// Für eine Datei
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;
						
						// Prüfen, ob binäre Daten vorhanden sind
						if (items[0].binary === undefined) {
							throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden');
						}
						
						// Datei prüfen
						const binaryData = items[0].binary[binaryPropertyName];
						if (binaryData === undefined) {
							throw new NodeOperationError(
								this.getNode(),
								`Keine binären Daten in der Eigenschaft "${binaryPropertyName}" gefunden`,
							);
						}
						
						// Binäre Daten laden
						const dataBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);
						
						// Multipart-Daten für den Upload erstellen
						const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
						const multipartData: Buffer[] = [];
						
						// Datei hinzufügen
						multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${binaryData.fileName || 'document'}"\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Type: ${binaryData.mimeType}\r\n\r\n`, 'utf8'));
						multipartData.push(dataBuffer);
						multipartData.push(Buffer.from('\r\n', 'utf8'));
						
						// Abschließender Boundary
						multipartData.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
						
						// Template-Erkennung durchführen
						responseData = await this.helpers.httpRequest({
							url: `${credentials.serverUrl as string}/api/getClassificationWithTemplateRecognition`,
							method: 'POST',
							headers: {
								'Accept': 'application/json',
								'Content-Type': `multipart/form-data; boundary=${boundary}`,
							},
							body: Buffer.concat(multipartData),
							json: true,
							auth: {
								username: credentials.username as string,
								password: credentials.password as string,
							},
						});
					} else if (mode === 'document') {
						// Für ein bestehendes Dokument
						const documentId = this.getNodeParameter('docId', 0) as number;
						const versionId = this.getNodeParameter('versionId', 0) as number;
						
						// Template-Erkennung für bestehendes Dokument durchführen
						responseData = await this.helpers.httpRequest({
							url: `${credentials.serverUrl as string}/api/getClassificationWithTemplateRecognition/${documentId}/${versionId}`,
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
				}
				// Weitere Operationen für document würden hier folgen
			} else if (resource === 'classification') {
				if (operation === 'classifyDocument') {
					// Dokument-Klassifikation aktualisieren
					const clDocId = this.getNodeParameter('clDocId', 0) as number;
					const docId = this.getNodeParameter('docId', 0) as number;
					let classifyAttributes = this.getNodeParameter('classifyAttributes', 0) as IDataObject;
					const editRolesString = this.getNodeParameter('editRoles', 0) as string;
					const readRolesString = this.getNodeParameter('readRoles', 0) as string;
					
					// Optionale Dropdown-Werte in classifyAttributes einfügen
					try {
						// Wenn als JSON-String, in Objekt umwandeln
						if (typeof classifyAttributes === 'string') {
							classifyAttributes = JSON.parse(classifyAttributes as string);
						}
						
						// Dokumenttyp aus Dropdown einfügen, wenn ausgewählt
						const docartSelect = this.getNodeParameter('docartSelect', 0, '') as string;
						if (docartSelect) {
							classifyAttributes.docart = docartSelect;
						}
						
						// Ordner aus Dropdown einfügen, wenn ausgewählt
						const folderSelect = this.getNodeParameter('folderSelect', 0, '') as string;
						if (folderSelect) {
							classifyAttributes.folder = folderSelect;
						}
						
						// Status aus Dropdown einfügen, wenn ausgewählt
						const statusSelect = this.getNodeParameter('statusSelect', 0, '') as string;
						if (statusSelect) {
							classifyAttributes.status = statusSelect;
						}
					} catch (error) {
						console.warn('Fehler beim Verarbeiten der Klassifikationsattribute:', error);
					}
					
					// Bearbeitungsrollen verarbeiten
					let editRoles: string[] = [];
					if (editRolesString) {
						editRoles = editRolesString.split(',').map(role => role.trim());
					}
					
					// Leserollen verarbeiten
					let readRoles: string[] = [];
					if (readRolesString) {
						readRoles = readRolesString.split(',').map(role => role.trim());
					}
					
					// API-Aufruf durchführen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/classifyDocument`,
						method: 'POST',
						body: {
							docId,
							clDocId,
							classifyAttributes,
							editRoles,
							readRoles,
						},
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						json: true,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
				}
				// Weitere Operationen für classification würden hier folgen
			} else if (resource === 'search') {
				if (operation === 'search') {
					// Einfache Suche mit n8n-freundlichem Interface
					const searchFiltersData = this.getNodeParameter('searchFilters', 0) as IDataObject;
					const searchFilters = searchFiltersData.filters as IDataObject[] || [];
					
					if (searchFilters.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Mindestens ein Suchfilter muss definiert werden',
						);
					}
					
					// API-Aufruf durchführen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/searchDocuments`,
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body: searchFilters,
						json: true,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
				} else if (operation === 'advancedSearch') {
					// Erweiterte Suche
					const searchFiltersData = this.getNodeParameter('searchFilters', 0) as IDataObject;
					const searchFilters = searchFiltersData.filters as IDataObject[] || [];
					const additionalOptions = this.getNodeParameter('additionalOptions', 0, {}) as IDataObject;
					
					if (searchFilters.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Mindestens ein Suchfilter muss definiert werden',
						);
					}
					
					// Parameter für die erweiterte Suche
					const queryParams = new URLSearchParams();
					
					if (additionalOptions.personalDocumentsOnly !== undefined) {
						queryParams.append('personalDocumentsOnly', additionalOptions.personalDocumentsOnly ? 'true' : 'false');
					} 
					
					if (additionalOptions.trashedDocuments !== undefined) {
						queryParams.append('trashedDocuments', additionalOptions.trashedDocuments ? 'true' : 'false');
					}
					
					if (additionalOptions.maxDocumentCount !== undefined) {
						const maxDocCount = parseInt(additionalOptions.maxDocumentCount as string, 10);
						if (maxDocCount > 1000) {
							throw new NodeOperationError(
								this.getNode(),
								'Die maximale Anzahl der Dokumente darf 1000 nicht überschreiten',
							);
						}
						queryParams.append('maxDocumentCount', maxDocCount.toString());
					}
					
					if (additionalOptions.readRoles !== undefined) {
						queryParams.append('readRoles', additionalOptions.readRoles ? 'true' : 'false');
					}
					
					const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
					
					// API-Aufruf durchführen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/searchDocumentsExt${queryString}`,
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body: searchFilters,
						json: true,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
				} else if (operation === 'advancedSearchExtv2') {
					// Erweiterte Suche V2 mit Sortierung
					const searchFiltersData = this.getNodeParameter('searchFilters', 0) as IDataObject;
					const searchFilters = searchFiltersData.filters as IDataObject[] || [];
					const sortOrderData = this.getNodeParameter('sortOrder', 0, {}) as IDataObject;
					const sortOrders = sortOrderData.orders as IDataObject[] || [];
					const additionalOptions = this.getNodeParameter('additionalOptions', 0, {}) as IDataObject;
					
					if (searchFilters.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Mindestens ein Suchfilter muss definiert werden',
						);
					}
					
					// Anfragekörper für die erweiterte Suche V2 erstellen
					const requestBody: IDataObject = {
						filter: searchFilters,
					};
					
					// Sortierung hinzufügen, wenn definiert
					if (sortOrders.length > 0) {
						requestBody.sortOrder = sortOrders;
					}
					
					// Zusätzliche Optionen hinzufügen
					if (additionalOptions.personalDocumentsOnly !== undefined) {
						requestBody.personalDocumentsOnly = additionalOptions.personalDocumentsOnly;
					}
					
					if (additionalOptions.trashedDocuments !== undefined) {
						requestBody.trashedDocuments = additionalOptions.trashedDocuments;
					}
					
					if (additionalOptions.maxDocumentCount !== undefined) {
						const maxDocCount = parseInt(additionalOptions.maxDocumentCount as string, 10);
						if (maxDocCount > 1000) {
							throw new NodeOperationError(
								this.getNode(),
								'Die maximale Anzahl der Dokumente darf 1000 nicht überschreiten',
							);
						}
						requestBody.maxDocumentCount = maxDocCount;
					}
					
					if (additionalOptions.readRoles !== undefined) {
						requestBody.readRoles = additionalOptions.readRoles;
					}
					
					// API-Aufruf durchführen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/searchDocumentsExtv2`,
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
				} else if (operation === 'searchAndDownload') {
					// Suchen und Dokumente herunterladen
					const searchFiltersData = this.getNodeParameter('searchFilters', 0) as IDataObject;
					const searchFilters = searchFiltersData.filters as IDataObject[] || [];
					const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
					const maxDocuments = this.getNodeParameter('maxDocuments', 0, 10) as number;
					
					if (searchFilters.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Mindestens ein Suchfilter muss definiert werden',
						);
					}
					
					// Zuerst Dokumente suchen
					const documentsResponse = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/searchDocuments`,
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body: searchFilters,
						json: true,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
					
					// Prüfen, ob Dokumente gefunden wurden
					if (!Array.isArray(documentsResponse) || documentsResponse.length === 0) {
						// Keine Dokumente gefunden
						return [[]];
					}
					
					// Begrenze die Anzahl der Dokumente, die heruntergeladen werden
					const documents = documentsResponse.slice(0, maxDocuments);
					
					// Dokumente herunterladen
					const downloadItems: INodeExecutionData[] = [];
					
					for (let i = 0; i < documents.length; i++) {
						const document = documents[i];
						
						try {
							// Für Dokument-Download müssen wir */* als Accept-Header verwenden
							const response = await this.helpers.httpRequest({
								url: `${credentials.serverUrl as string}/api/document/${document.docId}`,
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
							
							// Neue Node mit Download-Ergebnis und Metadaten erstellen
							const newItem: INodeExecutionData = {
								json: document,
								binary: {},
							};
							
							// Dateiname aus Content-Disposition-Header extrahieren oder fallback verwenden
							const contentDisposition = response.headers['content-disposition'] as string;
							let fileName = `document_${document.docId}.pdf`;
							if (contentDisposition) {
								const match = contentDisposition.match(/filename="(.+)"/);
								if (match) {
									fileName = match[1];
								}
							}
							
							// Mime-Typ aus Content-Type-Header extrahieren oder fallback verwenden
							const contentType = response.headers['content-type'] as string || 'application/octet-stream';
							
							// Binäre Daten hinzufügen
							newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(
								Buffer.from(response.body as Buffer),
								fileName,
								contentType,
							);
							
							downloadItems.push(newItem);
						} catch (error) {
							// Fehler beim Herunterladen des Dokuments
							console.error(`Fehler beim Herunterladen des Dokuments mit ID ${document.docId}:`, error);
							
							// Nur die Metadaten zurückgeben, wenn der Download fehlschlägt
							downloadItems.push({
								json: {
									...document,
									downloadError: true,
									errorMessage: error.message,
								},
							});
						}
					}
					
					responseData = downloadItems;
				}
			} else if (resource === 'classification') {
				if (operation === 'classifyDocument') {
					// Dokument-Klassifikation aktualisieren
					const clDocId = this.getNodeParameter('clDocId', 0) as number;
					const docId = this.getNodeParameter('docId', 0) as number;
					let classifyAttributes = this.getNodeParameter('classifyAttributes', 0) as IDataObject;
					const editRolesString = this.getNodeParameter('editRoles', 0) as string;
					const readRolesString = this.getNodeParameter('readRoles', 0) as string;
					
					// Optionale Dropdown-Werte in classifyAttributes einfügen
					try {
						// Wenn als JSON-String, in Objekt umwandeln
						if (typeof classifyAttributes === 'string') {
							classifyAttributes = JSON.parse(classifyAttributes as string);
						}
						
						// Dokumenttyp aus Dropdown einfügen, wenn ausgewählt
						const docartSelect = this.getNodeParameter('docartSelect', 0, '') as string;
						if (docartSelect) {
							classifyAttributes.docart = docartSelect;
						}
						
						// Ordner aus Dropdown einfügen, wenn ausgewählt
						const folderSelect = this.getNodeParameter('folderSelect', 0, '') as string;
						if (folderSelect) {
							classifyAttributes.folder = folderSelect;
						}
						
						// Status aus Dropdown einfügen, wenn ausgewählt
						const statusSelect = this.getNodeParameter('statusSelect', 0, '') as string;
						if (statusSelect) {
							classifyAttributes.status = statusSelect;
						}
					} catch (error) {
						console.warn('Fehler beim Verarbeiten der Klassifikationsattribute:', error);
					}
					
					// Bearbeitungsrollen verarbeiten
					let editRoles: string[] = [];
					if (editRolesString) {
						editRoles = editRolesString.split(',').map(role => role.trim());
					}
					
					// Leserollen verarbeiten
					let readRoles: string[] = [];
					if (readRolesString) {
						readRoles = readRolesString.split(',').map(role => role.trim());
					}
					
					// API-Aufruf durchführen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/classifyDocument`,
						method: 'POST',
						body: {
							docId,
							clDocId,
							classifyAttributes,
							editRoles,
							readRoles,
						},
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						json: true,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
				}
				// Weitere Operationen für classification würden hier folgen
			}
			// Weitere Resource-Typen würden hier folgen
		}
		
		// Rückgabe der Daten - verbesserte Version
		if (Array.isArray(responseData)) {
			// Direkt zurückgeben, wenn es sich um ein Array von Nodes handelt
			if (responseData.length > 0 && responseData[0].binary !== undefined) {
				return [responseData];
			}
			
			// Ansonsten jedes Element konvertieren und hinzufügen
			for (const item of responseData) {
				if (item.json !== undefined) {
					returnData.push(item as INodeExecutionData);
				} else {
					returnData.push({ json: item });
				}
			}
		} else if (responseData !== undefined) {
			// Einzelobjekt in Array umwandeln
			returnData.push({ json: responseData });
		}

		return [returnData];
	}
} 