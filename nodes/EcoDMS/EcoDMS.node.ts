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
	Folder: 'folder',
	Search: 'search',
} as const;

export const Operation = {
	Create: 'create',
	Read: 'read',
	Update: 'update',
	Delete: 'delete',
	List: 'list',
	Download: 'download',
	Upload: 'upload',
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
		usableAsTool: true,
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
						name: 'Ordner',
						value: Resource.Folder,
					},
					{
						name: 'Suche',
						value: Resource.Search,
					},
				],
				default: 'document',
				noDataExpression: true,
				required: true,
			},
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
						name: 'Erstellen',
						value: Operation.Create,
						description: 'Erstelle ein Dokument',
						action: 'Erstelle ein Dokument',
					},
					{
						name: 'Abrufen',
						value: Operation.Read,
						description: 'Dokument abrufen',
						action: 'Dokument abrufen',
					},
					{
						name: 'Herunterladen',
						value: Operation.Download,
						description: 'Dokument herunterladen',
						action: 'Dokument herunterladen',
					},
					{
						name: 'Hochladen',
						value: Operation.Upload,
						description: 'Dokument hochladen',
						action: 'Dokument hochladen',
					},
				],
				default: 'read',
				noDataExpression: true,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [Resource.Folder],
					},
				},
				options: [
					{
						name: 'Erstellen',
						value: Operation.Create,
						description: 'Erstelle einen Ordner',
						action: 'Erstelle einen Ordner',
					},
					{
						name: 'Abrufen',
						value: Operation.Read,
						description: 'Ordner abrufen',
						action: 'Ordner abrufen',
					},
					{
						name: 'Auflisten',
						value: Operation.List,
						description: 'Ordner auflisten',
						action: 'Ordner auflisten',
					},
				],
				default: 'read',
				noDataExpression: true,
				required: true,
			},
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
						name: 'Suchen',
						value: Operation.List,
						description: 'Dokumente suchen',
						action: 'Dokumente suchen',
					},
				],
				default: 'list',
				noDataExpression: true,
				required: true,
			},
			// Dokument-ID für Lesen/Download
			{
				displayName: 'Dokument-ID',
				name: 'documentId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.Read, Operation.Download],
					},
				},
				default: '',
				description: 'ID des Dokuments',
			},
			// Ordner-ID für Lesen/Auflisten
			{
				displayName: 'Ordner-ID',
				name: 'folderId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.Read, Operation.List],
					},
				},
				default: '',
				description: 'ID des Ordners',
			},
			// Datei für Upload
			{
				displayName: 'Binäre Eigenschaft',
				name: 'binaryPropertyName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.Upload],
					},
				},
				default: 'data',
				description: 'Name der binären Eigenschaft, die die hochzuladende Datei enthält',
			},
			// Suchparameter
			{
				displayName: 'Suchparameter',
				name: 'searchParameters',
				type: 'collection',
				placeholder: 'Parameter hinzufügen',
				default: {},
				displayOptions: {
					show: {
						resource: [Resource.Search],
						operation: [Operation.List],
					},
				},
				options: [
					{
						displayName: 'Suchbegriff',
						name: 'query',
						type: 'string',
						default: '',
						description: 'Suchbegriff für die Volltextsuche',
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

		// Authentifizierungsdaten abrufen
		const credentials = await this.getCredentials('ecoDmsApi');
		const serverUrl = credentials.serverUrl as string;

		// Session erstellen (bei jedem Aufruf erforderlich)
		const sessionData = await this.helpers.httpRequest({
			url: `${serverUrl}/api/session`,
			method: 'POST',
			body: {
				username: credentials.username,
				password: credentials.password,
				mandant: credentials.mandant,
			},
			json: true,
		});

		const sessionId = sessionData.sessionId;
		if (!sessionId) {
			throw new NodeOperationError(this.getNode(), 'Konnte keine Session erstellen');
		}

		// Ressource und Operation abrufen
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		try {
			if (resource === 'document') {
				if (operation === 'read') {
					// Dokument-Metadaten abrufen
					const documentId = this.getNodeParameter('documentId', 0) as string;

					responseData = await this.helpers.httpRequest({
						url: `${serverUrl}/api/documents/${documentId}`,
						method: 'GET',
						headers: {
							'X-Session-ID': sessionId,
						},
						json: true,
					});
				} else if (operation === 'download') {
					// Dokument herunterladen
					const documentId = this.getNodeParameter('documentId', 0) as string;

					const data = await this.helpers.httpRequest({
						url: `${serverUrl}/api/documents/${documentId}/content`,
						method: 'GET',
						headers: {
							'X-Session-ID': sessionId,
						},
						encoding: null,
						resolveWithFullResponse: true,
					});

					const newItem: INodeExecutionData = {
						json: items[0].json,
						binary: {},
					};

					if (items[0].binary !== undefined) {
						// Wenn es bereits binäre Daten gibt, diese kopieren
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
					const contentType = data.headers['content-type'] as string || 'application/pdf';

					// Binäre Daten hinzufügen
					newItem.binary!.data = await this.helpers.prepareBinaryData(
						Buffer.from(data.body as string, BINARY_ENCODING),
						fileName,
						contentType,
					);

					responseData = [newItem];
				} else if (operation === 'upload') {
					// Funktionalität für Dokument-Upload implementieren
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;

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

					// Hier würde der eigentliche Upload-Code für ecoDMS stehen
					// Dies ist nur ein Platzhalter und muss durch den tatsächlichen API-Aufruf ersetzt werden
					responseData = await this.helpers.httpRequest({
						url: `${serverUrl}/api/documents`,
						method: 'POST',
						headers: {
							'X-Session-ID': sessionId,
							'Content-Type': 'multipart/form-data',
						},
						formData: {
							file: {
								value: dataBuffer,
								options: {
									filename: binaryData.fileName || 'document.pdf',
									contentType: binaryData.mimeType,
								},
							},
						},
						json: true,
					});
				}
			} else if (resource === 'folder') {
				if (operation === 'read') {
					// Ordner-Details abrufen
					const folderId = this.getNodeParameter('folderId', 0) as string;

					responseData = await this.helpers.httpRequest({
						url: `${serverUrl}/api/folders/${folderId}`,
						method: 'GET',
						headers: {
							'X-Session-ID': sessionId,
						},
						json: true,
					});
				} else if (operation === 'list') {
					// Ordnerinhalt auflisten
					const folderId = this.getNodeParameter('folderId', 0) as string;

					responseData = await this.helpers.httpRequest({
						url: `${serverUrl}/api/folders/${folderId}/content`,
						method: 'GET',
						headers: {
							'X-Session-ID': sessionId,
						},
						json: true,
					});
				}
			} else if (resource === 'search') {
				if (operation === 'list') {
					// Suche nach Dokumenten
					const searchParameters = this.getNodeParameter('searchParameters', 0) as IDataObject;
					
					const requestBody: IDataObject = {};
					if (searchParameters.query) {
						requestBody.query = searchParameters.query;
					}
					if (searchParameters.limit) {
						requestBody.limit = searchParameters.limit;
					}

					responseData = await this.helpers.httpRequest({
						url: `${serverUrl}/api/search`,
						method: 'POST',
						headers: {
							'X-Session-ID': sessionId,
							'Content-Type': 'application/json',
						},
						body: requestBody,
						json: true,
					});
				}
			}

			// Session beenden
			await this.helpers.httpRequest({
				url: `${serverUrl}/api/session/${sessionId}`,
				method: 'DELETE',
				json: true,
			});

			// Wenn responseData ein Array ist, jedes Element verarbeiten
			if (Array.isArray(responseData)) {
				returnData.push(...responseData);
			} else if (responseData !== undefined) {
				returnData.push({ json: responseData });
			}

			return [returnData];
		} catch (error) {
			// Session trotz Fehler beenden
			if (sessionId) {
				try {
					await this.helpers.httpRequest({
						url: `${serverUrl}/api/session/${sessionId}`,
						method: 'DELETE',
						json: true,
					});
				} catch (e) {
					// Fehler beim Beenden der Session ignorieren
				}
			}

			// Fehler werfen
			throw error;
		}
	}
} 