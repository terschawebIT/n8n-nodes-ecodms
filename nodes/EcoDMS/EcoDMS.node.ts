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
} from 'n8n-workflow';

export const Resource = {
	Document: 'document',
	Archive: 'archive',
	Search: 'search',
	Thumbnail: 'thumbnail',
} as const;

export const Operation = {
	Get: 'get',
	List: 'list',
	Upload: 'upload',
	Search: 'search',
	GetInfo: 'getInfo',
} as const;

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
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'ecoDmsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Dokument',
						value: Resource.Document,
					},
					{
						name: 'Archiv',
						value: Resource.Archive,
					},
					{
						name: 'Suche',
						value: Resource.Search,
					},
					{
						name: 'Thumbnail',
						value: Resource.Thumbnail,
					},
				],
				default: Resource.Document,
				noDataExpression: true,
				required: true,
			},
			// Dokument-Operationen
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [Resource.Document],
					},
				},
				options: [
					{
						name: 'Dokument herunterladen',
						value: Operation.Get,
						description: 'Ein Dokument herunterladen',
						action: 'Ein Dokument herunterladen',
					},
					{
						name: 'Dokument hochladen',
						value: Operation.Upload,
						description: 'Ein Dokument hochladen',
						action: 'Ein Dokument hochladen',
					},
				],
				default: Operation.Get,
				noDataExpression: true,
				required: true,
			},
			// Archiv-Operationen
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [Resource.Archive],
					},
				},
				options: [
					{
						name: 'Archive abrufen',
						value: Operation.List,
						description: 'Alle verfügbaren Archive abrufen',
						action: 'Archive abrufen',
					},
				],
				default: Operation.List,
				noDataExpression: true,
				required: true,
			},
			// Such-Operationen
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [Resource.Search],
					},
				},
				options: [
					{
						name: 'Dokumente suchen',
						value: Operation.Search,
						description: 'Nach Dokumenten suchen',
						action: 'Nach Dokumenten suchen',
					},
				],
				default: Operation.Search,
				noDataExpression: true,
				required: true,
			},
			// Thumbnail-Operationen
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [Resource.Thumbnail],
					},
				},
				options: [
					{
						name: 'Thumbnail herunterladen',
						value: Operation.Get,
						description: 'Ein Thumbnail herunterladen',
						action: 'Ein Thumbnail herunterladen',
					},
				],
				default: Operation.Get,
				noDataExpression: true,
				required: true,
			},
			// Lizenzinformationen
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['license'],
					},
				},
				options: [
					{
						name: 'Lizenzinformationen abrufen',
						value: Operation.GetInfo,
						description: 'Lizenzinformationen abrufen',
						action: 'Lizenzinformationen abrufen',
					},
				],
				default: Operation.GetInfo,
				noDataExpression: true,
				required: true,
			},
			// Parameter für Dokument herunterladen
			{
				displayName: 'Dokument-ID',
				name: 'documentId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.Get],
					},
				},
				default: '',
				description: 'ID des Dokuments, das heruntergeladen werden soll',
			},
			{
				displayName: 'Binäre Eigenschaft',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.Get],
					},
				},
				description: 'Name der binären Eigenschaft, in der das heruntergeladene Dokument gespeichert werden soll',
			},
			// Parameter für Dokument hochladen
			{
				displayName: 'Binäre Eigenschaft',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.Upload],
					},
				},
				required: true,
				description: 'Name der binären Eigenschaft, die die hochzuladende Datei enthält',
			},
			{
				displayName: 'Zusätzliche Felder',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Feld hinzufügen',
				default: {},
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.Upload],
					},
				},
				options: [
					{
						displayName: 'Titel',
						name: 'title',
						type: 'string',
						default: '',
						description: 'Titel des Dokuments',
					},
					{
						displayName: 'Beschreibung',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Beschreibung des Dokuments',
					},
					{
						displayName: 'Dokumenten-Typ',
						name: 'documentType',
						type: 'string',
						default: '',
						description: 'Typ des Dokuments',
					},
				],
			},
			// Parameter für Thumbnail
			{
				displayName: 'Dokument-ID',
				name: 'documentId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Thumbnail],
						operation: [Operation.Get],
					},
				},
				default: '',
				description: 'ID des Dokuments, für das ein Thumbnail abgerufen werden soll',
			},
			{
				displayName: 'Seitenzahl',
				name: 'pageNumber',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Thumbnail],
						operation: [Operation.Get],
					},
				},
				default: 1,
				description: 'Seitenzahl des Dokuments, für die das Thumbnail abgerufen werden soll',
			},
			{
				displayName: 'Höhe',
				name: 'height',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Thumbnail],
						operation: [Operation.Get],
					},
				},
				default: 300,
				description: 'Höhe des Thumbnails in Pixeln',
			},
			{
				displayName: 'Binäre Eigenschaft',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				displayOptions: {
					show: {
						resource: [Resource.Thumbnail],
						operation: [Operation.Get],
					},
				},
				description: 'Name der binären Eigenschaft, in der das Thumbnail gespeichert werden soll',
			},
			// Parameter für Suche
			{
				displayName: 'Suchparameter',
				name: 'searchParameters',
				type: 'collection',
				placeholder: 'Parameter hinzufügen',
				default: {},
				displayOptions: {
					show: {
						resource: [Resource.Search],
						operation: [Operation.Search],
					},
				},
				options: [
					{
						displayName: 'Suchbegriff',
						name: 'query',
						type: 'string',
						default: '',
						description: 'Suchbegriff für die Suche',
					},
					{
						displayName: 'Maximale Ergebnisse',
						name: 'limit',
						type: 'number',
						default: 50,
						description: 'Maximale Anzahl der zurückzugebenden Ergebnisse',
					},
				],
			},
		],
	};

	// Diese Methode wird aufgerufen, wenn der Node ausgeführt wird
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		let responseData;
		
		// Credentials abrufen
		const credentials = await this.getCredentials('ecoDmsApi');
		
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Verbindung zum Server herstellen
		let sessionActive = false;
		
		try {
			// Für Ressourcen, die keine Authentifizierung benötigen
			if (
				(resource === 'archive' && operation === 'list') ||
				(resource === 'license' && operation === 'getInfo')
			) {
				if (resource === 'archive' && operation === 'list') {
					// Archiv-Liste abrufen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/archives`,
						method: 'GET',
						headers: {
							'Accept': 'application/json',
						},
						json: true,
					});
				} else if (resource === 'license' && operation === 'getInfo') {
					// Lizenzinformationen abrufen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/licenseInfo`,
						method: 'GET',
						headers: {
							'Accept': 'application/json',
						},
						json: true,
					});
				}
			} else {
				// Verbindung zum Archiv herstellen
				const archiveId = credentials.archiveId as string;
				const apiKey = credentials.apiKey as string;
				
				if (apiKey) {
					// Wenn API-Key vorhanden, dann POST-Anfrage
					await this.helpers.httpRequest({
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
					await this.helpers.httpRequest({
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
				
				sessionActive = true;
				
				// Status prüfen, um die Authentifizierung zu verifizieren
				await this.helpers.httpRequest({
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
				
				// Die eigentliche Operation ausführen
				if (resource === 'document') {
					if (operation === 'get') {
						// Dokument herunterladen
						const documentId = this.getNodeParameter('documentId', 0) as string;
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;
						
						// Für Dokument-Download müssen wir */* als Accept-Header verwenden
						const data = await this.helpers.httpRequest({
							url: `${credentials.serverUrl as string}/api/document/${documentId}`,
							method: 'GET',
							headers: {
								'Accept': '*/*',
							},
							encoding: null,
							resolveWithFullResponse: true,
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
						const contentDisposition = data.headers['content-disposition'] as string;
						let fileName = `document_${documentId}.pdf`;
						if (contentDisposition) {
							const match = contentDisposition.match(/filename="(.+)"/);
							if (match) {
								fileName = match[1];
							}
						}
						
						// Mime-Typ aus Content-Type-Header extrahieren oder fallback verwenden
						const contentType = data.headers['content-type'] as string || 'application/octet-stream';
						
						// Binäre Daten hinzufügen
						newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(
							Buffer.from(data.body as string, BINARY_ENCODING),
							fileName,
							contentType,
						);
						
						responseData = [newItem];
					} else if (operation === 'upload') {
						// Dokument hochladen
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;
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
						
						// Formdata für den Upload erstellen
						const formData: IDataObject = {
							file: {
								value: dataBuffer,
								options: {
									filename: binaryData.fileName || 'document.pdf',
									contentType: binaryData.mimeType,
								},
							},
						};
						
						// Zusätzliche Felder hinzufügen
						if (additionalFields.title) {
							formData.title = additionalFields.title;
						}
						if (additionalFields.description) {
							formData.description = additionalFields.description;
						}
						if (additionalFields.documentType) {
							formData.documentType = additionalFields.documentType;
						}
						
						// Dokument hochladen
						responseData = await this.helpers.httpRequest({
							url: `${credentials.serverUrl as string}/api/document`,
							method: 'POST',
							formData,
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
				} else if (resource === 'search' && operation === 'search') {
					// Suche ausführen
					const searchParameters = this.getNodeParameter('searchParameters', 0) as IDataObject;
					
					const requestBody: IDataObject = {};
					if (searchParameters.query) {
						requestBody.query = searchParameters.query;
					}
					if (searchParameters.limit) {
						requestBody.limit = searchParameters.limit;
					}
					
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/search`,
						method: 'POST',
						body: requestBody,
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
				} else if (resource === 'thumbnail' && operation === 'get') {
					// Thumbnail herunterladen
					const documentId = this.getNodeParameter('documentId', 0) as string;
					const pageNumber = this.getNodeParameter('pageNumber', 0) as number;
					const height = this.getNodeParameter('height', 0) as number;
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;
					
					// Für Thumbnail-Download müssen wir */* als Accept-Header verwenden
					const data = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/thumbnail/${documentId}/page/${pageNumber}/height/${height}`,
						method: 'GET',
						headers: {
							'Accept': '*/*',
						},
						encoding: null,
						resolveWithFullResponse: true,
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
					
					// Für Thumbnails verwenden wir einen standardmäßigen Dateinamen
					const fileName = `thumbnail_${documentId}_page${pageNumber}.jpg`;
					
					// Binäre Daten hinzufügen
					newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(
						Buffer.from(data.body as string, BINARY_ENCODING),
						fileName,
						'image/jpeg',
					);
					
					responseData = [newItem];
				}
			}
			
			// Wenn responseData ein Array ist, jedes Element verarbeiten
			if (Array.isArray(responseData)) {
				returnData.push(...responseData);
			} else if (responseData !== undefined) {
				returnData.push({ json: responseData });
			}
			
			return [returnData];
		} catch (error) {
			// Fehler werfen
			throw error;
		}
	}
} 