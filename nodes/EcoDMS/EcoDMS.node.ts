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

export const Resource = {
	Archive: 'archive',
	Document: 'document',
	Classification: 'classification',
	DocumentType: 'documentType',
	Search: 'search',
	Thumbnail: 'thumbnail',
	License: 'license',
	Folder: 'folder',
	Version: 'version',
	Link: 'link',
	Workflow: 'workflow',
} as const;

export const Operation = {
	Get: 'get',
	List: 'list',
	Upload: 'upload',
	UploadWithPDF: 'uploadWithPdf',
	UploadToInbox: 'uploadToInbox',
	UploadFile: 'uploadFile',
	GetTemplatesForFile: 'getTemplatesForFile',
	GetClassificationWithTemplateRecognition: 'getClassificationWithTemplateRecognition',
	RemoveDocumentLink: 'removeDocumentLink',
	LinkToDocuments: 'linkToDocuments',
	CreateNewClassify: 'createNewClassify',
	ClassifyInboxDocument: 'classifyInboxDocument',
	ClassifyDocument: 'classifyDocument',
	CheckDuplicates: 'checkDuplicates',
	AddVersionWithPdf: 'addVersionWithPdf',
	AddVersion: 'addVersion',
	GetTypes: 'getTypes',
	GetTypeClassifications: 'getTypeClassifications',
	GetDocumentInfo: 'getDocumentInfo',
	GetDocumentWithClassification: 'getDocumentWithClassification',
	GetClassifyAttributes: 'getClassifyAttributes',
	GetClassifyAttributesDetail: 'getClassifyAttributesDetail',
	Search: 'search',
	AdvancedSearch: 'advancedSearch',
	AdvancedSearchExtv2: 'advancedSearchExtv2',
	GetInfo: 'getInfo',
	SetRoles: 'setRoles',
	EditFolder: 'editFolder',
	CreateFolder: 'createFolder',
	CreateSubfolder: 'createSubfolder',
	GetFolders: 'getFolders',
	Connect: 'connect',
	UploadAndClassify: 'uploadAndClassify',
	SearchAndDownload: 'searchAndDownload',
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
						name: 'Version',
						value: Resource.Version,
						description: 'Versionen verwalten',
					},
					{
						name: 'Verlinkung',
						value: Resource.Link,
						description: 'Dokumente verlinken',
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
						name: 'Dokument mit Klassifikation herunterladen',
						value: Operation.GetDocumentWithClassification,
						description: 'Ein Dokument mit einer bestimmten Klassifikations-ID herunterladen',
						action: 'Ein Dokument mit Klassifikation herunterladen',
					},
					{
						name: 'Dokumentinformationen abrufen',
						value: Operation.GetDocumentInfo,
						description: 'Informationen zu einem Dokument abrufen',
						action: 'Dokumentinformationen abrufen',
					},
					{
						name: 'Dokument hochladen',
						value: Operation.Upload,
						description: 'Ein Dokument hochladen',
						action: 'Ein Dokument hochladen',
					},
					{
						name: 'Dokument mit PDF hochladen',
						value: Operation.UploadWithPDF,
						description: 'Ein Dokument mit zugehörigem PDF hochladen',
						action: 'Ein Dokument mit PDF hochladen',
					},
					{
						name: 'PDF in Inbox hochladen',
						value: Operation.UploadToInbox,
						description: 'Eine PDF-Datei in den Inbox-Bereich hochladen',
						action: 'Eine PDF-Datei in den Inbox-Bereich hochladen',
					},
					{
						name: 'Datei hochladen',
						value: Operation.UploadFile,
						description: 'Eine Datei direkt in ecoDMS hochladen',
						action: 'Eine Datei direkt hochladen',
					},
					{
						name: 'Templates für Datei abrufen',
						value: Operation.GetTemplatesForFile,
						description: 'Templates und Klassifikationen für eine Datei abrufen',
						action: 'Templates für eine Datei abrufen',
					},
					{
						name: 'Duplizierungscheck durchführen',
						value: Operation.CheckDuplicates,
						description: 'Prüfen, ob ein Dokument bereits im System vorhanden ist',
						action: 'Duplizierungscheck durchführen',
					},
					{
						name: 'Version mit PDF hinzufügen',
						value: Operation.AddVersionWithPdf,
						description: 'Eine neue Version mit PDF zu einem Dokument hinzufügen',
						action: 'Version mit PDF hinzufügen',
					},
					{
						name: 'Version hinzufügen',
						value: Operation.AddVersion,
						description: 'Eine neue Version zu einem Dokument hinzufügen',
						action: 'Version hinzufügen',
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
					{
						name: 'Mit Archiv verbinden',
						value: Operation.Connect,
						description: 'Verbindung zu einem Archiv herstellen',
						action: 'Mit Archiv verbinden',
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
					{
						name: 'Erweiterte Suche',
						value: Operation.AdvancedSearch,
						description: 'Erweiterte Suche mit mehreren Filterkriterien',
						action: 'Erweiterte Suche durchführen',
					},
					{
						name: 'Erweiterte Suche v2',
						value: Operation.AdvancedSearchExtv2,
						description: 'Erweiterte Suche mit Filterkriterien, Sortierung und weiteren Optionen',
						action: 'Erweiterte Suche v2 durchführen',
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
						resource: [Resource.License],
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
			// Ordner-Operationen
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
						name: 'Berechtigungen festlegen',
						value: Operation.SetRoles,
						description: 'Berechtigungen für einen Ordner festlegen',
						action: 'Berechtigungen für einen Ordner festlegen',
					},
					{
						name: 'Ordner bearbeiten',
						value: Operation.EditFolder,
						description: 'Ordnerattribute aktualisieren',
						action: 'Ordnerattribute aktualisieren',
					},
					{
						name: 'Ordner erstellen',
						value: Operation.CreateFolder,
						description: 'Einen neuen Ordner auf oberster Ebene erstellen',
						action: 'Einen neuen Ordner erstellen',
					},
					{
						name: 'Unterordner erstellen',
						value: Operation.CreateSubfolder,
						description: 'Einen neuen Unterordner in einem bestehenden Ordner erstellen',
						action: 'Einen neuen Unterordner erstellen',
					},
					{
						name: 'Ordnerstruktur abrufen',
						value: Operation.GetFolders,
						description: 'Alle Ordner und Unterordner im ecoDMS-Archiv abrufen',
						action: 'Ordnerstruktur abrufen',
					},
				],
				default: Operation.SetRoles,
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
			// Parameter für Dokument mit PDF hochladen
			{
				displayName: 'Originaldatei (Binäre Eigenschaft)',
				name: 'fileBinaryPropertyName',
				type: 'string',
				default: 'data',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.UploadWithPDF],
					},
				},
				required: true,
				description: 'Name der binären Eigenschaft, die die Originaldatei enthält',
			},
			{
				displayName: 'PDF-Datei (Binäre Eigenschaft)',
				name: 'pdfBinaryPropertyName',
				type: 'string',
				default: 'pdf',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.UploadWithPDF],
					},
				},
				required: true,
				description: 'Name der binären Eigenschaft, die die PDF-Datei enthält',
			},
			{
				displayName: 'Versionskontrolle aktivieren',
				name: 'versionControlled',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.UploadWithPDF],
					},
				},
				description: 'Ob die Versionskontrolle für dieses Dokument aktiviert werden soll',
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
						operation: [Operation.UploadWithPDF],
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
			// Parameter für Dokument in Inbox hochladen
			{
				displayName: 'Binäre Eigenschaft',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.UploadToInbox],
					},
				},
				required: true,
				description: 'Name der binären Eigenschaft, die die PDF-Datei enthält (nur PDF erlaubt)',
			},
			{
				displayName: 'Zugriffsrechte',
				name: 'rights',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.UploadToInbox],
					},
				},
				description: 'Optionale Zugriffsrechte für das Dokument, durch Komma getrennt (z.B. "r_ecodms,r_myuser"). Leer lassen für Standardrechte.',
			},
			// Parameter für Datei hochladen
			{
				displayName: 'Binäre Eigenschaft',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.UploadFile],
					},
				},
				required: true,
				description: 'Name der binären Eigenschaft, die die hochzuladende Datei enthält',
			},
			{
				displayName: 'Versionskontrolle aktivieren',
				name: 'versionControlled',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.UploadFile],
					},
				},
				description: 'Ob die Versionskontrolle für dieses Dokument aktiviert werden soll',
			},
			// Parameter für Ordner-Berechtigungen
			{
				displayName: 'Ordner-ID',
				name: 'folderId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.SetRoles],
					},
				},
				default: '',
				description: 'ID des Ordners, für den Berechtigungen festgelegt werden sollen (z.B. "1.1")',
			},
			{
				displayName: 'Rollen',
				name: 'roles',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.SetRoles],
					},
				},
				description: 'Durch Komma getrennte Liste von Rollen, die Zugriff auf den Ordner haben sollen. Leer lassen, um allen Benutzern Zugriff zu gewähren.',
			},
			// Parameter für erweiterte Suche
			{
				displayName: 'Suchfilter',
				name: 'searchFilters',
				placeholder: 'Filter hinzufügen',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						resource: [Resource.Search],
						operation: [Operation.AdvancedSearch],
					},
				},
				options: [
					{
						name: 'filters',
						displayName: 'Filter',
						values: [
							{
								displayName: 'Attribut',
								name: 'classifyAttribut',
								type: 'string',
								default: '',
								description: 'Das zu durchsuchende Attribut (z.B. folderonly, bemerkung, etc.)',
							},
							{
								displayName: 'Suchoperator',
								name: 'searchOperator',
								type: 'options',
								options: [
									{
										name: 'Ist gleich (=)',
										value: '=',
									},
									{
										name: 'Ist nicht gleich (!=)',
										value: '!=',
									},
									{
										name: 'Enthält (ilike)',
										value: 'ilike',
									},
									{
										name: 'Enthält nicht (not ilike)',
										value: 'not ilike',
									},
									{
										name: 'Größer als (>)',
										value: '>',
									},
									{
										name: 'Kleiner als (<)',
										value: '<',
									},
									{
										name: 'Größer oder gleich (>=)',
										value: '>=',
									},
									{
										name: 'Kleiner oder gleich (<=)',
										value: '<=',
									},
								],
								default: '=',
								description: 'Der Operator für den Vergleich',
							},
							{
								displayName: 'Suchwert',
								name: 'searchValue',
								type: 'string',
								default: '',
								description: 'Der Wert, nach dem gesucht werden soll',
							},
						],
					},
				],
				description: 'Die Suchfilter für die erweiterte Suche. Mehrere Filter werden mit UND verknüpft.',
			},
			// Parameter für erweiterte Suche v2
			{
				displayName: 'Suchfilter',
				name: 'searchFilters',
				placeholder: 'Filter hinzufügen',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						resource: [Resource.Search],
						operation: [Operation.AdvancedSearchExtv2],
					},
				},
				options: [
					{
						name: 'filters',
						displayName: 'Filter',
						values: [
							{
								displayName: 'Attribut',
								name: 'classifyAttribut',
								type: 'string',
								default: '',
								description: 'Das zu durchsuchende Attribut (z.B. folderonly, bemerkung, etc.)',
							},
							{
								displayName: 'Suchoperator',
								name: 'searchOperator',
								type: 'options',
								options: [
									{
										name: 'Ist gleich (=)',
										value: '=',
									},
									{
										name: 'Ist nicht gleich (!=)',
										value: '!=',
									},
									{
										name: 'Enthält (ilike)',
										value: 'ilike',
									},
									{
										name: 'Enthält nicht (not ilike)',
										value: 'not ilike',
									},
									{
										name: 'Größer als (>)',
										value: '>',
									},
									{
										name: 'Kleiner als (<)',
										value: '<',
									},
									{
										name: 'Größer oder gleich (>=)',
										value: '>=',
									},
									{
										name: 'Kleiner oder gleich (<=)',
										value: '<=',
									},
								],
								default: '=',
								description: 'Der Operator für den Vergleich',
							},
							{
								displayName: 'Suchwert',
								name: 'searchValue',
								type: 'string',
								default: '',
								description: 'Der Wert, nach dem gesucht werden soll',
							},
						],
					},
				],
				description: 'Die Suchfilter für die erweiterte Suche. Mehrere Filter werden mit UND verknüpft.',
			},
			{
				displayName: 'Sortierung',
				name: 'sortOrder',
				placeholder: 'Sortierung hinzufügen',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						resource: [Resource.Search],
						operation: [Operation.AdvancedSearchExtv2],
					},
				},
				options: [
					{
						name: 'orders',
						displayName: 'Sortierkriterium',
						values: [
							{
								displayName: 'Attribut',
								name: 'classifyAttribut',
								type: 'string',
								default: '',
								description: 'Das Attribut, nach dem sortiert werden soll (z.B. ctimestamp, docid, etc.)',
							},
							{
								displayName: 'Richtung',
								name: 'sortDirection',
								type: 'options',
								options: [
									{
										name: 'Aufsteigend',
										value: 'asc',
									},
									{
										name: 'Absteigend',
										value: 'desc',
									},
								],
								default: 'asc',
								description: 'Die Sortierrichtung',
							},
						],
					},
				],
				description: 'Die Sortierung für die Suchergebnisse. Mehrere Sortierkriterien werden nacheinander angewendet.',
			},
			{
				displayName: 'Zusätzliche Optionen',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Option hinzufügen',
				default: {},
				displayOptions: {
					show: {
						resource: [Resource.Search],
						operation: [Operation.AdvancedSearchExtv2],
					},
				},
				options: [
					{
						displayName: 'Nur persönliche Dokumente',
						name: 'personalDocumentsOnly',
						type: 'boolean',
						default: false,
						description: 'Ob nur persönliche Dokumente des aktuellen Benutzers angezeigt werden sollen',
					},
					{
						displayName: 'Papierkorb-Dokumente anzeigen',
						name: 'trashedDocuments',
						type: 'boolean',
						default: false,
						description: 'Ob auch Dokumente im Papierkorb angezeigt werden sollen',
					},
					{
						displayName: 'Maximale Anzahl Dokumente',
						name: 'maxDocumentCount',
						type: 'number',
						default: 50,
						description: 'Maximale Anzahl der zurückzugebenden Dokumente',
					},
					{
						displayName: 'Rollen berücksichtigen',
						name: 'readRoles',
						type: 'boolean',
						default: true,
						description: 'Ob Benutzerrollen bei der Suche berücksichtigt werden sollen',
					},
				],
			},
			// Parameter für Templates für Datei abrufen
			{
				displayName: 'Binäre Eigenschaft',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.GetTemplatesForFile],
					},
				},
				required: true,
				description: 'Name der binären Eigenschaft, die die zu prüfende Datei enthält',
			},
			// Parameter für Klassifikation mit Template-Erkennung abrufen
			{
				displayName: 'Modus',
				name: 'mode',
				type: 'options',
				options: [
					{
						name: 'Für Datei',
						value: 'file',
					},
					{
						name: 'Für bestehendes Dokument',
						value: 'document',
					},
				],
				default: 'file',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.GetClassificationWithTemplateRecognition],
					},
				},
				description: 'Ob die Klassifikation für eine Datei oder ein bestehendes Dokument abgerufen werden soll',
			},
			{
				displayName: 'Binäre Eigenschaft',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.GetClassificationWithTemplateRecognition],
						mode: ['file'],
					},
				},
				required: true,
				description: 'Name der binären Eigenschaft, die die zu prüfende Datei enthält',
			},
			{
				displayName: 'Dokument-ID',
				name: 'docId',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.GetClassificationWithTemplateRecognition],
						mode: ['document'],
					},
				},
				required: true,
				description: 'ID des Dokuments, für das die Klassifikationen abgerufen werden sollen',
			},
			{
				displayName: 'Versions-ID',
				name: 'versionId',
				type: 'number',
				default: 1,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.GetClassificationWithTemplateRecognition],
						mode: ['document'],
					},
				},
				required: true,
				description: 'Versionsnummer des Dokuments, für das die Klassifikationen abgerufen werden sollen',
			},
			// Parameter für Ordner bearbeiten
			{
				displayName: 'Ordner-ID',
				name: 'oId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.EditFolder],
					},
				},
				default: '',
				description: 'ID des Ordners, der bearbeitet werden soll',
			},
			{
				displayName: 'Ordnername',
				name: 'foldername',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.EditFolder],
					},
				},
				default: '',
				description: 'Name des Ordners',
			},
			{
				displayName: 'Ist Hauptordner',
				name: 'mainFolder',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.EditFolder],
					},
				},
				default: false,
				description: 'Ob der Ordner ein Hauptordner ist',
			},
			{
				displayName: 'Aktiv',
				name: 'active',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.EditFolder],
					},
				},
				default: true,
				description: 'Ob der Ordner aktiv ist',
			},
			{
				displayName: 'Zusätzliche Felder',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Feld hinzufügen',
				default: {},
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.EditFolder],
					},
				},
				options: [
					{
						displayName: 'Externer Schlüssel',
						name: 'externalKey',
						type: 'string',
						default: '',
						description: 'Externer Schlüssel für den Ordner',
					},
					{
						displayName: 'Schlagwörter',
						name: 'buzzwords',
						type: 'string',
						default: '',
						description: 'Schlagwörter für den Ordner',
					},
					{
						displayName: 'Datensatz-String',
						name: 'dataString',
						type: 'string',
						default: '',
						description: 'Interner Datensatz-String für den Ordner (nur bei Bedarf anpassen)',
					},
				],
			},
			// Parameter für Dokumentverknüpfungen entfernen
			{
				displayName: 'Klassifikations-ID',
				name: 'clDocId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.RemoveDocumentLink],
					},
				},
				default: 0,
				description: 'ID der Dokumentklassifikation, von der Verknüpfungen entfernt werden sollen',
			},
			{
				displayName: 'Zu entfernende Verknüpfungen',
				name: 'linkIds',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.RemoveDocumentLink],
					},
				},
				default: '',
				description: 'Durch Komma getrennte Liste von Klassifikations-IDs, deren Verknüpfungen entfernt werden sollen (z.B. "4,5,6")',
			},
			// Parameter für Dokumente verknüpfen
			{
				displayName: 'Klassifikations-ID',
				name: 'clDocId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.LinkToDocuments],
					},
				},
				default: 0,
				description: 'ID der Dokumentklassifikation, zu der Verknüpfungen hinzugefügt werden sollen',
			},
			{
				displayName: 'Zu verknüpfende Dokumente',
				name: 'linkIds',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.LinkToDocuments],
					},
				},
				default: '',
				description: 'Durch Komma getrennte Liste von Klassifikations-IDs, die verknüpft werden sollen (z.B. "4,5,6")',
			},
			// Parameter für neue Klassifikation erstellen
			{
				displayName: 'Dokument-ID',
				name: 'docId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.CreateNewClassify],
					},
				},
				default: 0,
				description: 'ID des Dokuments, für das eine zusätzliche Klassifikation erstellt werden soll',
			},
			{
				displayName: 'Klassifikationsattribute',
				name: 'classifyAttributes',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.CreateNewClassify],
					},
				},
				default: {},
				options: [
					{
						name: 'attributes',
						displayName: 'Attribut',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name des Klassifikationsattributs (z.B. docart, folder, bemerkung, etc.)',
							},
							{
								displayName: 'Wert',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Wert des Klassifikationsattributs',
							},
						],
					},
				],
				description: 'Die Klassifikationsattribute für das Dokument',
			},
			{
				displayName: 'Bearbeitungsrollen',
				name: 'editRoles',
				type: 'string',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.CreateNewClassify],
					},
				},
				default: '',
				description: 'Durch Komma getrennte Liste von Rollen, die das Dokument bearbeiten dürfen. Leer lassen, um die Rolle des angemeldeten API-Benutzers zu verwenden.',
			},
			{
				displayName: 'Leserollen',
				name: 'readRoles',
				type: 'string',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.CreateNewClassify],
					},
				},
				default: '',
				description: 'Durch Komma getrennte Liste von Rollen, die das Dokument lesen dürfen.',
			},
			// Parameter für Ordner erstellen
			{
				displayName: 'Ordnername',
				name: 'foldername',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.CreateFolder],
					},
				},
				default: '',
				description: 'Name des neuen Ordners',
			},
			{
				displayName: 'Ist Hauptordner',
				name: 'mainFolder',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.CreateFolder],
					},
				},
				default: true,
				description: 'Ob der Ordner ein Hauptordner ist',
			},
			{
				displayName: 'Zusätzliche Felder',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Feld hinzufügen',
				default: {},
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.CreateFolder],
					},
				},
				options: [
					{
						displayName: 'Externer Schlüssel',
						name: 'externalKey',
						type: 'string',
						default: '',
						description: 'Externer Schlüssel für den Ordner',
					},
					{
						displayName: 'Schlagwörter',
						name: 'buzzwords',
						type: 'string',
						default: '',
						description: 'Schlagwörter für den Ordner',
					},
				],
			},
			// Parameter für Unterordner erstellen
			{
				displayName: 'Übergeordneter Ordner-ID',
				name: 'parentoid',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.CreateSubfolder],
					},
				},
				default: '',
				description: 'ID des übergeordneten Ordners, in dem der Unterordner erstellt werden soll',
			},
			{
				displayName: 'Ordnername',
				name: 'foldername',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.CreateSubfolder],
					},
				},
				default: '',
				description: 'Name des neuen Unterordners',
			},
			{
				displayName: 'Ist Hauptordner',
				name: 'mainFolder',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.CreateSubfolder],
					},
				},
				default: false,
				description: 'Ob der Unterordner ein Hauptordner ist (in der Regel false für Unterordner)',
			},
			{
				displayName: 'Zusätzliche Felder',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Feld hinzufügen',
				default: {},
				displayOptions: {
					show: {
						resource: [Resource.Folder],
						operation: [Operation.CreateSubfolder],
					},
				},
				options: [
					{
						displayName: 'Externer Schlüssel',
						name: 'externalKey',
						type: 'string',
						default: '',
						description: 'Externer Schlüssel für den Unterordner',
					},
					{
						displayName: 'Schlagwörter',
						name: 'buzzwords',
						type: 'string',
						default: '',
						description: 'Schlagwörter für den Unterordner',
					},
				],
			},
			// Parameter für Connect-Operation
			{
				displayName: 'Archiv-Name',
				name: 'archiveName',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Archive],
						operation: [Operation.Connect],
					},
				},
				default: '',
				description: 'Name oder ID des Archivs, zu dem eine Verbindung hergestellt werden soll',
			},
			{
				displayName: 'Zusätzliche Felder',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Feld hinzufügen',
				default: {},
				displayOptions: {
					show: {
						resource: [Resource.Archive],
						operation: [Operation.Connect],
					},
				},
				options: [
					{
						displayName: 'API-Key',
						name: 'apiKey',
						type: 'string',
						default: '',
						description: 'Optionaler API-Key für die Verbindung zum Archiv',
					},
				],
			},
			// Parameter für Inbox-Dokument Klassifizierung
			{
				displayName: 'Dokument-ID',
				name: 'docId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.ClassifyInboxDocument],
					},
				},
				default: 0,
				description: 'ID des Inbox-Dokuments, das klassifiziert werden soll',
			},
			{
				displayName: 'Klassifikations-ID',
				name: 'clDocId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.ClassifyInboxDocument],
					},
				},
				default: -1,
				description: 'ID der Klassifikation. -1 für erstmalige oder zusätzliche Klassifizierung, bestehende clDocId für Aktualisierung',
			},
			{
				displayName: 'Klassifikationsattribute',
				name: 'classifyAttributes',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.ClassifyInboxDocument],
					},
				},
				default: {},
				options: [
					{
						name: 'attributes',
						displayName: 'Attribut',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name des Klassifikationsattributs (z.B. docart, folder, bemerkung, etc.)',
							},
							{
								displayName: 'Wert',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Wert des Klassifikationsattributs',
							},
						],
					},
				],
				description: 'Die Klassifikationsattribute für das Dokument',
			},
			{
				displayName: 'Bearbeitungsrollen',
				name: 'editRoles',
				type: 'string',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.ClassifyInboxDocument],
					},
				},
				default: '',
				description: 'Durch Komma getrennte Liste von Rollen, die das Dokument bearbeiten dürfen',
			},
			{
				displayName: 'Leserollen',
				name: 'readRoles',
				type: 'string',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.ClassifyInboxDocument],
					},
				},
				default: '',
				description: 'Durch Komma getrennte Liste von Rollen, die das Dokument lesen dürfen',
			},
			{
				displayName: 'Zeitstempel (nur für Aktualisierungen)',
				name: 'ctimestamp',
				type: 'string',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.ClassifyInboxDocument],
					},
				},
				default: '',
				description: 'Zeitstempel der Klassifikation, erforderlich für Aktualisierungen. Leer lassen für neue Klassifikationen.',
			},
			// Parameter für Dokument-Klassifikation aktualisieren
			{
				displayName: 'Dokument-ID',
				name: 'docId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.ClassifyDocument],
					},
				},
				default: 0,
				description: 'ID des Dokuments, dessen Klassifikation aktualisiert werden soll',
			},
			{
				displayName: 'Klassifikations-ID',
				name: 'clDocId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.ClassifyDocument],
					},
				},
				description: 'Die ID der Dokumentklassifikation, die aktualisiert werden soll',
			},
			{
				displayName: 'Dokument-ID',
				name: 'docId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.ClassifyDocument],
					},
				},
				description: 'Die ID des Dokuments, dessen Klassifikation aktualisiert werden soll',
			},
			{
				displayName: 'Klassifikationsattribute',
				name: 'classifyAttributes',
				type: 'json',
				default: '{\n  "docart": "1",\n  "revision": "1.0",\n  "bemerkung": "Aktualisierte Klassifikation",\n  "folder": "1.4",\n  "status": "1"\n}',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.ClassifyDocument],
					},
				},
				description: 'Die Klassifikationsattribute im JSON-Format (z.B. docart, revision, folder, etc.)',
			},
			{
				displayName: 'Bearbeitungsrollen',
				name: 'editRoles',
				type: 'string',
				default: 'Elite',
				required: false,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.ClassifyDocument],
					},
				},
				description: 'Kommagetrennte Liste von Rollen, die das Dokument bearbeiten dürfen (z.B. "r_ecodms,Elite")',
			},
			{
				displayName: 'Leserollen',
				name: 'readRoles',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.ClassifyDocument],
					},
				},
				description: 'Kommagetrennte Liste von Rollen, die das Dokument lesen dürfen (z.B. "ecoSIMSUSER,Gast")',
			},
			{
				displayName: 'Felder',
				name: 'fields',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.CreateNewClassify, Operation.ClassifyInboxDocument, Operation.ClassifyDocument],
					},
				},
				description: 'Die Klassifikationsfelder im JSON-Format',
			},
			// Parameter für Duplikate prüfen
			{
				displayName: 'Binärdaten',
				name: 'binary',
				type: 'boolean',
				default: true,
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.CheckDuplicates],
					},
				},
				description: 'Die Daten der zu prüfenden Datei liegen als binäre Daten vor',
			},
			{
				displayName: 'Binäre Eigenschaft',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.CheckDuplicates],
						binary: [true],
					},
				},
				description: 'Name der binären Eigenschaft, die die Daten enthält',
			},
			{
				displayName: 'Übereinstimmungswert',
				name: 'maxMatchValue',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 80,
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.CheckDuplicates],
					},
				},
				description: 'Legt fest, wie stark Dokumente übereinstimmen müssen, um als Duplikat erkannt zu werden (1-100). Je niedriger der Wert, desto weniger Übereinstimmungen sind nötig.',
			},
			// Parameter für Version mit PDF hinzufügen
			{
				displayName: 'Dokument-ID',
				name: 'docId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.AddVersionWithPdf],
					},
				},
				default: 0,
				description: 'ID des Dokuments, zu dem eine neue Version hinzugefügt werden soll',
			},
			{
				displayName: 'Version fixieren',
				name: 'fixed',
				type: 'boolean',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.AddVersionWithPdf],
					},
				},
				default: false,
				description: 'Bei Aktivierung können nach dem Archivieren keine weiteren Versionen zu diesem Dokument hinzugefügt werden',
			},
			{
				displayName: 'Originaldatei',
				name: 'binaryProperty',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.AddVersionWithPdf],
					},
				},
				default: 'data',
				description: 'Name der binären Eigenschaft, die die Originaldatei enthält',
			},
			{
				displayName: 'PDF-Datei',
				name: 'pdfProperty',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.AddVersionWithPdf],
					},
				},
				default: 'pdf',
				description: 'Name der binären Eigenschaft, die die PDF-Datei enthält',
			},
			// Parameter für Version hinzufügen
			{
				displayName: 'Dokument-ID',
				name: 'docId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.AddVersion],
					},
				},
				default: 0,
				description: 'ID des Dokuments, zu dem eine neue Version hinzugefügt werden soll',
			},
			{
				displayName: 'Version fixieren',
				name: 'fixed',
				type: 'boolean',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.AddVersion],
					},
				},
				default: false,
				description: 'Bei Aktivierung können nach dem Archivieren keine weiteren Versionen zu diesem Dokument hinzugefügt werden',
			},
			{
				displayName: 'Binäre Eigenschaft',
				name: 'binaryProperty',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.AddVersion],
					},
				},
				default: 'data',
				description: 'Name der binären Eigenschaft, die die Datei enthält',
			},
			// Parameter für Dokumenttyp-Klassifikationen abrufen
			{
				displayName: 'Dokumenttyp-ID',
				name: 'docTypeId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.GetTypeClassifications],
					},
				},
				default: 0,
				description: 'ID des Dokumenttyps, für den die Klassifikationen abgerufen werden sollen (kann über die Operation "Dokumenttypen abrufen" ermittelt werden)',
			},
			// Parameter für Dokumentinformationen abrufen
			{
				displayName: 'Dokument-ID',
				name: 'docId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.GetDocumentInfo],
					},
				},
				default: 0,
				description: 'ID des Dokuments, für das Informationen abgerufen werden sollen',
			},
			// Parameter für Dokument mit Klassifikation herunterladen
			{
				displayName: 'Dokument-ID',
				name: 'documentId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.GetDocumentWithClassification],
					},
				},
				default: '',
				description: 'ID des Dokuments, das heruntergeladen werden soll',
			},
			{
				displayName: 'Klassifikations-ID',
				name: 'clDocId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.GetDocumentWithClassification],
					},
				},
				default: '',
				description: 'ID der Dokumentklassifikation, die heruntergeladen werden soll',
			},
			{
				displayName: 'Binäre Eigenschaft',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				displayOptions: {
					show: {
						resource: [Resource.Document],
						operation: [Operation.GetDocumentWithClassification],
					},
				},
				description: 'Name der binären Eigenschaft, in der das heruntergeladene Dokument gespeichert werden soll',
			},
			// Klassifikations-Operationen
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [Resource.Classification],
					},
				},
				options: [
					{
						name: 'Klassifikationsattribute abrufen',
						value: Operation.GetClassifyAttributes,
						description: 'Alle verfügbaren Klassifikationsattribute abrufen',
						action: 'Klassifikationsattribute abrufen',
					},
					{
						name: 'Detaillierte Klassifikationsattribute abrufen',
						value: Operation.GetClassifyAttributesDetail,
						description: 'Detaillierte Informationen zu Klassifikationsattributen abrufen',
						action: 'Detaillierte Klassifikationsattribute abrufen',
					},
					{
						name: 'Neue Klassifikation erstellen',
						value: Operation.CreateNewClassify,
						description: 'Zusätzliche Klassifikation für ein Dokument erstellen',
						action: 'Neue Klassifikation erstellen',
					},
					{
						name: 'Inbox-Dokument klassifizieren',
						value: Operation.ClassifyInboxDocument,
						description: 'Ein Inbox-Dokument klassifizieren oder eine bestehende Klassifikation aktualisieren',
						action: 'Inbox-Dokument klassifizieren',
					},
					{
						name: 'Dokument-Klassifikation aktualisieren',
						value: Operation.ClassifyDocument,
						description: 'Eine bestehende Dokumentklassifikation aktualisieren. Vorgehensweise:\n1. Ermittle docId und clDocId mit "Dokumentinformationen abrufen"\n2. Ermittle verfügbare Klassifikationsattribute mit "Klassifikationsattribute abrufen"\n3. Aktualisiere die gewünschten Attribute\n\nBeispielantwort: Klassifikations-ID, die aktualisiert wurde.',
						action: 'Dokument-Klassifikation aktualisieren',
					},
					{
						name: 'Dokumentverknüpfungen entfernen',
						value: Operation.RemoveDocumentLink,
						description: 'Verknüpfungen zwischen Dokumentklassifikationen entfernen',
						action: 'Dokumentverknüpfungen entfernen',
					},
					{
						name: 'Dokumente verknüpfen',
						value: Operation.LinkToDocuments,
						description: 'Verknüpfungen zwischen Dokumentklassifikationen hinzufügen',
						action: 'Dokumente verknüpfen',
					},
				],
				default: Operation.GetClassifyAttributes,
				noDataExpression: true,
				required: true,
			},
			// Dokumenttyp-Operationen
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [Resource.DocumentType],
					},
				},
				options: [
					{
						name: 'Dokumenttypen abrufen',
						value: Operation.GetTypes,
						description: 'Alle verfügbaren Dokumenttypen abrufen',
						action: 'Dokumenttypen abrufen',
					},
					{
						name: 'Dokumenttyp-Klassifikationen abrufen',
						value: Operation.GetTypeClassifications,
						description: 'Erforderliche und versteckte Klassifikationen für einen Dokumenttyp abrufen',
						action: 'Dokumenttyp-Klassifikationen abrufen',
					},
				],
				default: Operation.GetTypes,
				noDataExpression: true,
				required: true,
			},
			// Parameter für Dokumenttyp-Operationen
			{
				displayName: 'Dokumenttyp-ID',
				name: 'docTypeId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.DocumentType],
						operation: [Operation.GetTypeClassifications],
					},
				},
				description: 'Die ID des Dokumenttyps, für den die Klassifikationen abgerufen werden sollen',
			},
			// Parameter für Klassifikations-Operationen
			{
				displayName: 'Dokument-ID',
				name: 'docId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.CreateNewClassify],
					},
				},
				description: 'Die ID des Dokuments, für das eine neue Klassifikation erstellt werden soll',
			},
			{
				displayName: 'Dokument-ID',
				name: 'docId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.ClassifyInboxDocument],
					},
				},
				description: 'Die ID des Inbox-Dokuments, das klassifiziert werden soll',
			},
			{
				displayName: 'Klassifikations-ID',
				name: 'clDocId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.ClassifyDocument],
					},
				},
				description: 'Die ID der Dokumentklassifikation, die aktualisiert werden soll',
			},
			{
				displayName: 'Klassifikations-ID',
				name: 'clDocId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.RemoveDocumentLink, Operation.LinkToDocuments],
					},
				},
				description: 'Die ID der Dokumentklassifikation, für die Links entfernt oder hinzugefügt werden sollen',
			},
			{
				displayName: 'Link-IDs',
				name: 'linkIds',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.RemoveDocumentLink],
					},
				},
				description: 'Kommagetrennte Liste von Klassifikations-IDs, die entfernt werden sollen (z.B. "4,5,6")',
			},
			{
				displayName: 'Link-IDs',
				name: 'linkIds',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.LinkToDocuments],
					},
				},
				description: 'Kommagetrennte Liste von Klassifikations-IDs, die hinzugefügt werden sollen (z.B. "4,5,6")',
			},
			{
				displayName: 'Felder',
				name: 'fields',
				type: 'json',
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.CreateNewClassify, Operation.ClassifyInboxDocument, Operation.ClassifyDocument],
					},
				},
				description: 'Die Klassifikationsfelder im JSON-Format',
			},
			{
				displayName: 'Dokumenttyp auswählen',
				name: 'docartSelect',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'loadDocumentTypes',
				},
				default: '',
				required: false,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.ClassifyDocument],
					},
				},
				description: 'Wähle einen Dokumenttyp aus der Liste (Wird automatisch in die Klassifikationsattribute eingefügt)',
			},
			{
				displayName: 'Status',
				name: 'statusSelect',
				type: 'options',
				options: [
					{
						name: 'Klassifiziert',
						value: '1',
						description: 'Dokument ist klassifiziert',
					},
					{
						name: 'Wiedervorlage',
						value: '2',
						description: 'Dokument zur Wiedervorlage',
					},
					{
						name: 'In Bearbeitung',
						value: '3',
						description: 'Dokument wird bearbeitet',
					},
					{
						name: 'Storniert',
						value: '4',
						description: 'Dokument wurde storniert',
					},
					{
						name: 'Inbox',
						value: '5',
						description: 'Dokument befindet sich im Inbox-Bereich',
					},
				],
				default: '1',
				required: false,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.ClassifyDocument],
					},
				},
				description: 'Status des Dokuments',
			},
			{
				displayName: 'Klassifikationsattribute',
				name: 'classifyAttributes',
				type: 'json',
				default: '{\n  "docart": "1",\n  "revision": "1.0",\n  "bemerkung": "Aktualisierte Klassifikation",\n  "folder": "1.4",\n  "status": "1"\n}',
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.ClassifyDocument],
					},
				},
				description: 'Die Klassifikationsattribute im JSON-Format. Beispiel:\n```json\n{\n  "docart": "1",          // Dokumententyp-ID\n  "revision": "1.0",      // Revisionsnummer\n  "bemerkung": "Rechnung März 2023",  // Beschreibung\n  "folder": "1.4",        // Ordner-ID (Format: [Hauptordner].[Unterordner])\n  "cdate": "2023-03-15",  // Dokumentdatum (YYYY-MM-DD)\n  "status": "1",          // 1=Klassifiziert, 2=Wiedervorlage\n  "defdate": ""           // Wiedervorlagedatum (wenn status=2)\n}\n```',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
			// Operation für die vorhandenen Ressourcen
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
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
					{
						name: 'Mit Archiv verbinden',
						value: Operation.Connect,
						description: 'Verbindung zu einem Archiv herstellen',
						action: 'Mit Archiv verbinden',
					},
				],
				default: Operation.List,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
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
						name: 'Dokument mit Klassifikation herunterladen',
						value: Operation.GetDocumentWithClassification,
						description: 'Ein Dokument mit einer bestimmten Klassifikations-ID herunterladen',
						action: 'Ein Dokument mit Klassifikation herunterladen',
					},
					{
						name: 'Dokumentinformationen abrufen',
						value: Operation.GetDocumentInfo,
						description: 'Informationen zu einem Dokument abrufen',
						action: 'Dokumentinformationen abrufen',
					},
					{
						name: 'Dokument hochladen',
						value: Operation.Upload,
						description: 'Ein Dokument hochladen',
						action: 'Ein Dokument hochladen',
					},
					{
						name: 'Dokument mit PDF hochladen',
						value: Operation.UploadWithPDF,
						description: 'Ein Dokument mit zugehörigem PDF hochladen',
						action: 'Ein Dokument mit PDF hochladen',
					},
					{
						name: 'PDF in Inbox hochladen',
						value: Operation.UploadToInbox,
						description: 'Eine PDF-Datei in den Inbox-Bereich hochladen',
						action: 'Eine PDF-Datei in den Inbox-Bereich hochladen',
					},
					{
						name: 'Datei hochladen',
						value: Operation.UploadFile,
						description: 'Eine Datei direkt in ecoDMS hochladen',
						action: 'Eine Datei direkt hochladen',
					},
					{
						name: 'Templates für Datei abrufen',
						value: Operation.GetTemplatesForFile,
						description: 'Templates und Klassifikationen für eine Datei abrufen',
						action: 'Templates für eine Datei abrufen',
					},
					{
						name: 'Duplizierungscheck durchführen',
						value: Operation.CheckDuplicates,
						description: 'Prüfen, ob ein Dokument bereits im System vorhanden ist',
						action: 'Duplizierungscheck durchführen',
					},
					{
						name: 'Version mit PDF hinzufügen',
						value: Operation.AddVersionWithPdf,
						description: 'Eine neue Version mit PDF zu einem Dokument hinzufügen',
						action: 'Version mit PDF hinzufügen',
					},
					{
						name: 'Version hinzufügen',
						value: Operation.AddVersion,
						description: 'Eine neue Version zu einem Dokument hinzufügen',
						action: 'Version hinzufügen',
					},
				],
				default: Operation.Get,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
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
					{
						name: 'Erweiterte Suche',
						value: Operation.AdvancedSearch,
						description: 'Erweiterte Suche mit mehreren Filterkriterien',
						action: 'Erweiterte Suche durchführen',
					},
					{
						name: 'Erweiterte Suche v2',
						value: Operation.AdvancedSearchExtv2,
						description: 'Erweiterte Suche mit Filterkriterien, Sortierung und weiteren Optionen',
						action: 'Erweiterte Suche v2 durchführen',
					},
				],
				default: Operation.Search,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
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
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [Resource.License],
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
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [Resource.Folder],
					},
				},
				options: [
					{
						name: 'Berechtigungen festlegen',
						value: Operation.SetRoles,
						description: 'Berechtigungen für einen Ordner festlegen',
						action: 'Berechtigungen für einen Ordner festlegen',
					},
					{
						name: 'Ordner bearbeiten',
						value: Operation.EditFolder,
						description: 'Ordnerattribute aktualisieren',
						action: 'Ordnerattribute aktualisieren',
					},
					{
						name: 'Ordner erstellen',
						value: Operation.CreateFolder,
						description: 'Einen neuen Ordner auf oberster Ebene erstellen',
						action: 'Einen neuen Ordner erstellen',
					},
					{
						name: 'Unterordner erstellen',
						value: Operation.CreateSubfolder,
						description: 'Einen neuen Unterordner in einem bestehenden Ordner erstellen',
						action: 'Einen neuen Unterordner erstellen',
					},
					{
						name: 'Ordnerstruktur abrufen',
						value: Operation.GetFolders,
						description: 'Alle Ordner und Unterordner im ecoDMS-Archiv abrufen',
						action: 'Ordnerstruktur abrufen',
					},
				],
				default: Operation.SetRoles,
				required: true,
			},
			// Operation für die vorhandenen Ressourcen
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [Resource.Version],
					},
				},
				options: [
					{
						name: 'Version mit PDF hinzufügen',
						value: Operation.AddVersionWithPdf,
						description: 'Eine neue Version mit PDF zu einem Dokument hinzufügen',
						action: 'Version mit PDF hinzufügen',
					},
					{
						name: 'Version hinzufügen',
						value: Operation.AddVersion,
						description: 'Eine neue Version zu einem Dokument hinzufügen',
						action: 'Version hinzufügen',
					},
				],
				default: Operation.AddVersion,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [Resource.Link],
					},
				},
				options: [
					{
						name: 'Dokumente verknüpfen',
						value: Operation.LinkToDocuments,
						description: 'Verknüpfungen zwischen Dokumentklassifikationen hinzufügen',
						action: 'Dokumente verknüpfen',
					},
					{
						name: 'Klassifikations-ID',
						value: Operation.RemoveDocumentLink,
						description: 'Verknüpfungen zwischen Dokumentklassifikationen entfernen',
						action: 'Dokumentverknüpfungen entfernen',
					},
				],
				default: Operation.LinkToDocuments,
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: [Resource.Workflow],
					},
				},
				options: [
					{
						name: 'Dokument hochladen und klassifizieren',
						value: Operation.UploadAndClassify,
						description: 'Lädt ein Dokument hoch und klassifiziert es in einem Schritt',
						action: 'Dokument hochladen und klassifizieren',
					},
					{
						name: 'Suchen und herunterladen',
						value: Operation.SearchAndDownload,
						description: 'Sucht nach Dokumenten anhand von Kriterien und lädt sie herunter',
						action: 'Suchen und herunterladen',
					},
				],
				default: Operation.UploadAndClassify,
				required: true,
			},
			// Upload und Klassifizierung in einem Schritt
			{
				displayName: 'Binäre Daten',
				name: 'binaryData',
				type: 'boolean',
				default: true,
				required: true,
				displayOptions: {
					show: {
						resource: [Resource.Workflow],
						operation: [Operation.UploadAndClassify],
					},
				},
				description: 'Binäre Daten verwenden',
			},
			{
					displayName: 'Binäres Eingabefeld',
					name: 'binaryPropertyName',
					type: 'string',
					default: 'data',
					required: true,
					displayOptions: {
						show: {
							resource: [Resource.Workflow],
							operation: [Operation.UploadAndClassify],
							binaryData: [true],
						},
					},
					description: 'Name des binären Eingabefelds, das die Datei enthält',
				},
				{
					displayName: 'Dateiname',
					name: 'fileName',
					type: 'string',
					default: '',
					required: true,
					displayOptions: {
						show: {
							resource: [Resource.Workflow],
							operation: [Operation.UploadAndClassify],
						},
					},
					description: 'Name der hochzuladenden Datei',
				},
				{
					displayName: 'Dokumenttyp-ID',
					name: 'docTypeId',
					type: 'string',
					default: '',
					required: true,
					displayOptions: {
						show: {
							resource: [Resource.Workflow],
							operation: [Operation.UploadAndClassify],
						},
					},
					description: 'ID des Dokumenttyps',
				},
				{
					displayName: 'Klassifikationsattribute',
					name: 'classifyAttributes',
					type: 'json',
					default: '{\n  "revision": "1.0",\n  "bemerkung": "Automatisch klassifiziert",\n  "folder": "1",\n  "status": "1"\n}',
					required: true,
					displayOptions: {
						show: {
							resource: [Resource.Workflow],
							operation: [Operation.UploadAndClassify],
						},
					},
					description: 'Die Klassifikationsattribute im JSON-Format. Die docTypeId muss nicht angegeben werden, da sie bereits oben definiert wurde.',
					typeOptions: {
						alwaysOpenEditWindow: true,
					},
				},
			// Suchen und Herunterladen
			{
				displayName: 'Suchtyp',
				name: 'searchType',
				type: 'options',
				options: [
					{
						name: 'Einfache Suche',
						value: 'simple',
					},
					{
						name: 'Erweiterte Suche',
						value: 'advanced',
					},
				],
				default: 'simple',
				displayOptions: {
					show: {
						resource: [Resource.Workflow],
						operation: [Operation.SearchAndDownload],
					},
				},
				description: 'Art der Suche',
			},
			{
				displayName: 'Suchbegriff',
				name: 'searchTerm',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: [Resource.Workflow],
						operation: [Operation.SearchAndDownload],
						searchType: ['simple'],
					},
				},
				description: 'Nach diesem Begriff wird gesucht',
			},
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'json',
				default: '{\n  "filter": {\n    "operator": "and",\n    "filters": [\n      {\n        "field": "title",\n        "operator": "contains",\n        "value": "Rechnung"\n      },\n      {\n        "field": "cdate",\n        "operator": "gte",\n        "value": "2023-01-01"\n      }\n    ]\n  }\n}',
				displayOptions: {
					show: {
						resource: [Resource.Workflow],
						operation: [Operation.SearchAndDownload],
						searchType: ['advanced'],
					},
				},
				description: 'Der Filter für die erweiterte Suche im JSON-Format',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
			{
				displayName: 'Maximale Anzahl',
				name: 'maxResults',
				type: 'number',
				default: 10,
				displayOptions: {
					show: {
						resource: [Resource.Workflow],
						operation: [Operation.SearchAndDownload],
					},
				},
				description: 'Maximale Anzahl der herunterzuladenden Dokumente',
			},
			{
				displayName: 'Binäres Ausgabefeld',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				displayOptions: {
					show: {
						resource: [Resource.Workflow],
						operation: [Operation.SearchAndDownload],
					},
				},
				description: 'Name des binären Ausgabefeldes',
			},
			{
				displayName: 'Ordner auswählen',
				name: 'folderSelect',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'loadFolders',
				},
				default: '',
				required: false,
				displayOptions: {
					show: {
						resource: [Resource.Classification],
						operation: [Operation.ClassifyDocument],
					},
				},
				description: 'Wähle einen Ordner aus der Liste (Wird automatisch in die Klassifikationsattribute eingefügt)',
			},
		],
	};

	// Diese Methode wird aufgerufen, wenn der Node ausgeführt wird
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		let responseData;
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
					const documentId = this.getNodeParameter('documentId', 0) as string;
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;
					
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
				} else if (operation === 'uploadWithPdf') {
					// Dokument mit PDF hochladen
					const fileBinaryPropertyName = this.getNodeParameter('fileBinaryPropertyName', 0) as string;
					const pdfBinaryPropertyName = this.getNodeParameter('pdfBinaryPropertyName', 0) as string;
					const versionControlled = this.getNodeParameter('versionControlled', 0) as boolean;
					const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;
					
					// Prüfen, ob die binären Daten vorhanden sind
					if (items[0].binary === undefined) {
						throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden');
					}
					
					// Originaldatei prüfen
					const fileBinaryData = items[0].binary[fileBinaryPropertyName];
					if (fileBinaryData === undefined) {
						throw new NodeOperationError(
							this.getNode(),
							`Keine binären Daten in der Eigenschaft "${fileBinaryPropertyName}" gefunden`,
						);
					}
					
					// PDF-Datei prüfen
					const pdfBinaryData = items[0].binary[pdfBinaryPropertyName];
					if (pdfBinaryData === undefined) {
						throw new NodeOperationError(
							this.getNode(),
							`Keine binären Daten in der Eigenschaft "${pdfBinaryPropertyName}" gefunden`,
						);
					}
					
					// Binäre Daten laden
					const fileBuffer = await this.helpers.getBinaryDataBuffer(0, fileBinaryPropertyName);
					const pdfBuffer = await this.helpers.getBinaryDataBuffer(0, pdfBinaryPropertyName);
					
					// Multipart-Daten für den Upload erstellen
					const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
					const multipartData: Buffer[] = [];
					
					// Originaldatei hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${fileBinaryData.fileName || 'document.original'}"\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Type: ${fileBinaryData.mimeType}\r\n\r\n`, 'utf8'));
					multipartData.push(fileBuffer);
					multipartData.push(Buffer.from('\r\n', 'utf8'));
					
					// PDF-Datei hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="pdfFile"; filename="${pdfBinaryData.fileName || 'document.pdf'}"\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Type: ${pdfBinaryData.mimeType || 'application/pdf'}\r\n\r\n`, 'utf8'));
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
				} else if (operation === 'uploadToInbox') {
					// PDF in Inbox hochladen
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;
					const rightsString = this.getNodeParameter('rights', 0) as string;
					
					// Prüfen, ob die binären Daten vorhanden sind
					if (items[0].binary === undefined) {
						throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden');
					}
					
					// PDF-Datei prüfen
					const pdfBinaryData = items[0].binary[binaryPropertyName];
					if (pdfBinaryData === undefined) {
						throw new NodeOperationError(
							this.getNode(),
							`Keine binären Daten in der Eigenschaft "${binaryPropertyName}" gefunden`,
						);
					}
					
					// Mime-Typ prüfen (nur PDF erlaubt)
					if (pdfBinaryData.mimeType !== 'application/pdf') {
						throw new NodeOperationError(
							this.getNode(),
							`Nur PDF-Dateien sind erlaubt. Gefundener Mime-Typ: ${pdfBinaryData.mimeType}`,
						);
					}
					
					// Binäre Daten laden
					const pdfBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);
					
					// Multipart-Daten für den Upload erstellen
					const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
					const multipartData: Buffer[] = [];
					
					// PDF-Datei hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${pdfBinaryData.fileName || 'document.pdf'}"\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Type: application/pdf\r\n\r\n`, 'utf8'));
					multipartData.push(pdfBuffer);
					multipartData.push(Buffer.from('\r\n', 'utf8'));
					
					// Abschließender Boundary
					multipartData.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
					
					// URL mit optionalen Rechten erstellen
					let url = `${credentials.serverUrl as string}/api/uploadFileToInbox`;
					
					// Rechte hinzufügen, falls vorhanden
					if (rightsString) {
						const rights = rightsString.split(',').map(right => right.trim());
						if (rights.length > 0) {
							url += '?' + rights.map(right => `rights=${encodeURIComponent(right)}`).join('&');
						}
					}
					
					// Dokument hochladen
					responseData = await this.helpers.httpRequest({
						url,
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
				} else if (operation === 'uploadFile') {
					// Datei hochladen
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;
					const versionControlled = this.getNodeParameter('versionControlled', 0) as boolean;
					
					// Prüfen, ob die binären Daten vorhanden sind
					if (items[0].binary === undefined) {
						throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden');
					}
					
					// Binäre Daten prüfen
					const binaryData = items[0].binary[binaryPropertyName];
					if (binaryData === undefined) {
						throw new NodeOperationError(
							this.getNode(),
							`Keine binären Daten in der Eigenschaft "${binaryPropertyName}" gefunden`,
						);
					}
					
					// Binäre Daten laden
					const fileBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);
					
					// Multipart-Daten für den Upload erstellen
					const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
					const multipartData: Buffer[] = [];
					
					// Datei hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${binaryData.fileName || 'document'}"\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Type: ${binaryData.mimeType}\r\n\r\n`, 'utf8'));
					multipartData.push(fileBuffer);
					multipartData.push(Buffer.from('\r\n', 'utf8'));
					
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
				} else if (operation === 'getTemplatesForFile') {
					// Templates für Datei abrufen
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;
					
					// Prüfen, ob die binären Daten vorhanden sind
					if (items[0].binary === undefined) {
						throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden');
					}
					
					// Binäre Daten prüfen
					const binaryData = items[0].binary[binaryPropertyName];
					if (binaryData === undefined) {
						throw new NodeOperationError(
							this.getNode(),
							`Keine binären Daten in der Eigenschaft "${binaryPropertyName}" gefunden`,
						);
					}
					
					// Binäre Daten laden
					const fileBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);
					
					// Multipart-Daten für den Upload erstellen
					const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
					const multipartData: Buffer[] = [];
					
					// Datei hinzufügen
					multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="${binaryData.fileName || 'document'}"\r\n`, 'utf8'));
					multipartData.push(Buffer.from(`Content-Type: ${binaryData.mimeType}\r\n\r\n`, 'utf8'));
					multipartData.push(fileBuffer);
					multipartData.push(Buffer.from('\r\n', 'utf8'));
					
					// Abschließender Boundary
					multipartData.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
					
					// Templates abrufen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/getTemplateForFile`,
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
						// Für Datei
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;
						
						// Prüfen, ob die binären Daten vorhanden sind
						if (items[0].binary === undefined) {
							throw new NodeOperationError(this.getNode(), 'Keine binären Daten gefunden');
						}
						
						// Binäre Daten prüfen
						const binaryData = items[0].binary[binaryPropertyName];
						if (binaryData === undefined) {
							throw new NodeOperationError(
								this.getNode(),
								`Keine binären Daten in der Eigenschaft "${binaryPropertyName}" gefunden`,
							);
						}
						
						// Binäre Daten laden
						const fileBuffer = await this.helpers.getBinaryDataBuffer(0, binaryPropertyName);
						
						// Multipart-Daten für den Upload erstellen
						const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
						const multipartData: Buffer[] = [];
						
						// Datei hinzufügen
						multipartData.push(Buffer.from(`--${boundary}\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Disposition: form-data; name="multipartFile"; filename="${binaryData.fileName || 'document'}"\r\n`, 'utf8'));
						multipartData.push(Buffer.from(`Content-Type: ${binaryData.mimeType}\r\n\r\n`, 'utf8'));
						multipartData.push(fileBuffer);
						multipartData.push(Buffer.from('\r\n', 'utf8'));
						
						// Abschließender Boundary
						multipartData.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
						
						// Klassifikationen abrufen
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
					} else {
						// Für bestehendes Dokument
						const docId = this.getNodeParameter('docId', 0) as number;
						const versionId = this.getNodeParameter('versionId', 0) as number;
						
						// Klassifikationen abrufen
						responseData = await this.helpers.httpRequest({
							url: `${credentials.serverUrl as string}/api/getClassificationWithTemplateRecognition?docId=${docId}&versionId=${versionId}`,
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
				} else if (operation === 'removeDocumentLink') {
					// Dokumentverknüpfungen entfernen
					const clDocId = this.getNodeParameter('clDocId', 0) as number;
					const linkIdsString = this.getNodeParameter('linkIds', 0) as string;
					
					// String in Array von Nummern umwandeln
					const linkIds: number[] = linkIdsString.split(',')
						.map(id => id.trim())
						.filter(id => id !== '')
						.map(id => parseInt(id, 10));
					
					// Fehler werfen, wenn keine IDs angegeben wurden
					if (linkIds.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Es müssen mindestens eine zu entfernende Verknüpfungs-ID angegeben werden',
						);
					}
					
					// Verknüpfungen entfernen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/document/${clDocId}/removeDocumentLink`,
						method: 'POST',
						body: linkIds,
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
				} else if (operation === 'linkToDocuments') {
					// Dokumente verknüpfen
					const clDocId = this.getNodeParameter('clDocId', 0) as number;
					const linkIdsString = this.getNodeParameter('linkIds', 0) as string;
					
					// String in Array von Nummern umwandeln
					const linkIds: number[] = linkIdsString.split(',')
						.map(id => id.trim())
						.filter(id => id !== '')
						.map(id => parseInt(id, 10));
					
					// Fehler werfen, wenn keine IDs angegeben wurden
					if (linkIds.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Es müssen mindestens eine zu verknüpfende Dokument-ID angegeben werden',
						);
					}
					
					// Verknüpfungen hinzufügen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/document/${clDocId}/linkToDocuments`,
						method: 'POST',
						body: linkIds,
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
				} else if (operation === 'createNewClassify') {
					// Neue Klassifikation erstellen
					const docId = this.getNodeParameter('docId', 0) as number;
					const classifyAttributesData = this.getNodeParameter('classifyAttributes', 0) as IDataObject;
					const editRolesString = this.getNodeParameter('editRoles', 0) as string;
					const readRolesString = this.getNodeParameter('readRoles', 0) as string;
					
					// Klassifikationsattribute verarbeiten
					const classifyAttributes: IDataObject = {};
					if (classifyAttributesData.attributes && Array.isArray(classifyAttributesData.attributes)) {
						(classifyAttributesData.attributes as IDataObject[]).forEach((attribute) => {
							const name = attribute.name as string;
							const value = attribute.value as string;
							if (name) {
								classifyAttributes[name] = value || '';
							}
						});
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
					
					// Anfrageobjekt erstellen
					const requestBody: IDataObject = {
						docId,
						classifyAttributes,
						editRoles,
						readRoles,
					};
					
					// Klassifikation erstellen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/createNewClassify`,
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
				} else if (operation === 'classifyInboxDocument') {
					// Inbox-Dokument klassifizieren
					const docId = this.getNodeParameter('docId', 0) as number;
					const clDocId = this.getNodeParameter('clDocId', 0) as number;
					const classifyAttributesData = this.getNodeParameter('classifyAttributes', 0) as IDataObject;
					const editRolesString = this.getNodeParameter('editRoles', 0) as string;
					const readRolesString = this.getNodeParameter('readRoles', 0) as string;
					const ctimestamp = this.getNodeParameter('ctimestamp', 0) as string;
					
					// Klassifikationsattribute verarbeiten
					const classifyAttributes: IDataObject = {};
					if (classifyAttributesData.attributes && Array.isArray(classifyAttributesData.attributes)) {
						(classifyAttributesData.attributes as IDataObject[]).forEach((attribute) => {
							const name = attribute.name as string;
							const value = attribute.value as string;
							if (name) {
								classifyAttributes[name] = value || '';
							}
						});
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
					
					// Anfrageobjekt erstellen
					const requestBody: IDataObject = {
						docId,
						clDocId,
						classifyAttributes,
						editRoles,
						readRoles,
					};
					
					// Zeitstempel hinzufügen, falls vorhanden (erforderlich für Aktualisierungen)
					if (ctimestamp && clDocId !== -1) {
						classifyAttributes.ctimestamp = ctimestamp;
					}
					
					// Inbox-Dokument klassifizieren
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/classifyInboxDocument`,
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
				} else if (operation === 'checkDuplicates') {
					// Duplikate prüfen
					const binaryProperty = this.getNodeParameter('binaryPropertyName', 0) as string;
					const maxMatchValue = this.getNodeParameter('maxMatchValue', 0) as number;
					
					// Binäre Daten laden
					const items = this.getInputData();
					const item = items[0];
					
					if (item.binary === undefined) {
						throw new Error('Es wurden keine binären Daten gefunden.');
					}
					
					const binaryData = item.binary[binaryProperty];
					
					if (binaryData === undefined) {
						throw new Error(`Es wurden keine binären Daten in der Eigenschaft "${binaryProperty}" gefunden.`);
					}
					
					// Prüfen, ob der Dateityp unterstützt wird
					const fileExtension = binaryData.mimeType.split('/')[1].toLowerCase();
					const supportedTypes = ['pdf', 'tif', 'tiff', 'png', 'jpeg', 'jpg', 'bmp'];
					
					if (!supportedTypes.includes(fileExtension)) {
						throw new Error(`Der Dateityp "${fileExtension}" wird nicht unterstützt. Unterstützte Typen: PDF, TIF, TIFF, PNG, JPEG, JPG, BMP`);
					}
					
					// Binäre Daten als Buffer konvertieren
					const buffer = Buffer.from(binaryData.data, 'base64');
					
					// Duplikate prüfen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/document/checkDuplicates`,
						method: 'POST',
						body: {
							hash: buffer.toString('base64'),
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
					
					// Antwort in JSON umwandeln, falls als String zurückgegeben
					if (typeof responseData === 'string') {
						try {
							responseData = JSON.parse(responseData);
						} catch (error) {
							// Keine JSON-Antwort, belassen wie es ist
						}
					}
				} else if (operation === 'addVersionWithPdf') {
					// Version mit PDF hinzufügen
					const docId = this.getNodeParameter('docId', 0) as number;
					const fixed = this.getNodeParameter('fixed', 0) as boolean;
					const binaryProperty = this.getNodeParameter('binaryProperty', 0) as string;
					const pdfProperty = this.getNodeParameter('pdfProperty', 0) as string;
					
					// Binäre Daten laden
					const items = this.getInputData();
					const item = items[0];
					
					if (item.binary === undefined) {
						throw new Error('Es wurden keine binären Daten gefunden.');
					}
					
					// Originaldatei laden
					const binaryData = item.binary[binaryProperty];
					if (binaryData === undefined) {
						throw new Error(`Es wurden keine binären Daten in der Eigenschaft "${binaryProperty}" gefunden.`);
					}
					
					// PDF-Datei laden
					const pdfData = item.binary[pdfProperty];
					if (pdfData === undefined) {
						throw new Error(`Es wurden keine binären Daten in der Eigenschaft "${pdfProperty}" gefunden.`);
					}
					
					// Binäre Daten als Buffer konvertieren
					const fileBuffer = Buffer.from(binaryData.data, 'base64');
					const pdfBuffer = Buffer.from(pdfData.data, 'base64');
					
					// Multipart-Anfrage vorbereiten
					const boundary = `----WebKitFormBoundary${Math.random().toString(16).substr(2)}`;
					
					// Multipart-Body manuell erstellen
					const multipartBody = Buffer.concat([
						// Originaldatei-Teil
						Buffer.from(`--${boundary}\r\n`),
						Buffer.from(`Content-Disposition: form-data; name="file"; filename="${binaryData.fileName || 'document.dat'}"\r\n`),
						Buffer.from(`Content-Type: ${binaryData.mimeType}\r\n\r\n`),
						fileBuffer,
						Buffer.from('\r\n'),
						
						// PDF-Datei-Teil
						Buffer.from(`--${boundary}\r\n`),
						Buffer.from(`Content-Disposition: form-data; name="pdfFile"; filename="${pdfData.fileName || 'document.pdf'}"\r\n`),
						Buffer.from(`Content-Type: ${pdfData.mimeType}\r\n\r\n`),
						pdfBuffer,
						Buffer.from('\r\n'),
						
						// Abschluss-Boundary
						Buffer.from(`--${boundary}--\r\n`),
					]);
					
					// Version mit PDF hinzufügen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/addVersionWithPdfToDocument/${docId}/${fixed}`,
						method: 'POST',
						body: multipartBody,
						headers: {
							'Accept': 'application/json',
							'Content-Type': `multipart/form-data; boundary=${boundary}`,
						},
						json: false,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
					
					// Antwort in JSON umwandeln, falls als String zurückgegeben
					if (typeof responseData === 'string') {
						try {
							responseData = JSON.parse(responseData);
						} catch (error) {
							// Keine JSON-Antwort, belassen wie es ist
						}
					}
				} else if (operation === 'addVersion') {
					// Version hinzufügen
					const docId = this.getNodeParameter('docId', 0) as number;
					const fixed = this.getNodeParameter('fixed', 0) as boolean;
					const binaryProperty = this.getNodeParameter('binaryProperty', 0) as string;
					
					// Binäre Daten laden
					const items = this.getInputData();
					const item = items[0];
					
					if (item.binary === undefined) {
						throw new Error('Es wurden keine binären Daten gefunden.');
					}
					
					// Datei laden
					const binaryData = item.binary[binaryProperty];
					if (binaryData === undefined) {
						throw new Error(`Es wurden keine binären Daten in der Eigenschaft "${binaryProperty}" gefunden.`);
					}
					
					// Binäre Daten als Buffer konvertieren
					const fileBuffer = Buffer.from(binaryData.data, 'base64');
					
					// Version hinzufügen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/addVersionToDocument/${docId}/${fixed}`,
						method: 'POST',
						body: fileBuffer,
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/octet-stream',
						},
						json: false,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
					
					// Antwort in JSON umwandeln, falls als String zurückgegeben
					if (typeof responseData === 'string') {
						try {
							responseData = JSON.parse(responseData);
						} catch (error) {
							// Keine JSON-Antwort, belassen wie es ist
						}
					}
				} else if (operation === 'getTypes') {
					// Dokumenttypen abrufen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/types`,
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
				} else if (operation === 'getTypeClassifications') {
					// Dokumenttyp-Klassifikationen abrufen
					const docTypeId = this.getNodeParameter('docTypeId', 0) as number;
					
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/typeClassifications/${docTypeId}`,
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
				} else if (operation === 'getDocumentInfo') {
					// Dokumentinformationen abrufen
					const docId = this.getNodeParameter('docId', 0) as number;
					
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/documentInfo/${docId}`,
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
				} else if (operation === 'getClassifyAttributes') {
					// Klassifikationsattribute abrufen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/classifyAttributes`,
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
				} else if (operation === 'getClassifyAttributesDetail') {
					// Detaillierte Klassifikationsattribute abrufen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/classifyAttributes/detailInformation`,
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
				} else if (operation === 'getDocumentWithClassification') {
					// Dokument mit Klassifikation herunterladen
					const documentId = this.getNodeParameter('documentId', 0) as string;
					const clDocId = this.getNodeParameter('clDocId', 0) as string;
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0) as string;
					
					// Für Dokument-Download müssen wir */* als Accept-Header verwenden
					const response = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/document/${documentId}/${clDocId}`,
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
					let fileName = `document_${documentId}_classification_${clDocId}.pdf`;
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
			} else if (resource === 'search' && operation === 'advancedSearch') {
				// Erweiterte Suche ausführen
				const searchFiltersData = this.getNodeParameter('searchFilters', 0) as IDataObject;
				
				let searchFilters: IDataObject[] = [];
				
				// Suchfilter verarbeiten, wenn sie vorhanden sind
				if (searchFiltersData.filters && Array.isArray(searchFiltersData.filters)) {
					searchFilters = searchFiltersData.filters as IDataObject[];
				}
				
				// Fehler werfen, wenn keine Filter angegeben wurden
				if (searchFilters.length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						'Es muss mindestens ein Suchfilter angegeben werden',
					);
				}
				
				// Erweiterte Suche durchführen
				responseData = await this.helpers.httpRequest({
					url: `${credentials.serverUrl as string}/api/searchDocuments`,
					method: 'POST',
					body: searchFilters,
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
			} else if (resource === 'search' && operation === 'advancedSearchExtv2') {
				// Erweiterte Suche v2 ausführen
				const searchFiltersData = this.getNodeParameter('searchFilters', 0) as IDataObject;
				const sortOrderData = this.getNodeParameter('sortOrder', 0) as IDataObject;
				const additionalOptions = this.getNodeParameter('additionalOptions', 0) as IDataObject;
				
				// Suchfilter verarbeiten
				let filter: IDataObject[] = [];
				if (searchFiltersData.filters && Array.isArray(searchFiltersData.filters)) {
					filter = searchFiltersData.filters as IDataObject[];
				}
				
				// Sortierung verarbeiten
				let sortOrder: IDataObject[] = [];
				if (sortOrderData.orders && Array.isArray(sortOrderData.orders)) {
					sortOrder = sortOrderData.orders as IDataObject[];
				}
				
				// Anfrageobjekt erstellen
				const requestBody: IDataObject = {
					filter,
					sortOrder,
				};
				
				// Zusätzliche Optionen hinzufügen, falls vorhanden
				if (additionalOptions.personalDocumentsOnly !== undefined) {
					requestBody.personalDocumentsOnly = additionalOptions.personalDocumentsOnly;
				}
				
				if (additionalOptions.trashedDocuments !== undefined) {
					requestBody.trashedDocuments = additionalOptions.trashedDocuments;
				}
				
				if (additionalOptions.maxDocumentCount !== undefined) {
					requestBody.maxDocumentCount = additionalOptions.maxDocumentCount;
				}
				
				if (additionalOptions.readRoles !== undefined) {
					requestBody.readRoles = additionalOptions.readRoles;
				}
				
				// Erweiterte Suche v2 durchführen
				responseData = await this.helpers.httpRequest({
					url: `${credentials.serverUrl as string}/api/searchDocumentsExtv2`,
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
				const response = await this.helpers.httpRequest({
					url: `${credentials.serverUrl as string}/api/thumbnail/${documentId}/page/${pageNumber}/height/${height}`,
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
				
				// Für Thumbnails verwenden wir einen standardmäßigen Dateinamen
				const fileName = `thumbnail_${documentId}_page${pageNumber}.jpg`;
				
				// Binäre Daten hinzufügen
				newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(
					Buffer.from(response.body as Buffer),
					fileName,
					'image/jpeg',
				);
				
				responseData = [newItem];
			} else if (resource === 'folder' && operation === 'setRoles') {
				// Ordnerberechtigungen festlegen
				const folderId = this.getNodeParameter('folderId', 0) as string;
				const rolesString = this.getNodeParameter('roles', 0) as string;
				
				// Rollen als Array verarbeiten
				let roles: string[] = [];
				if (rolesString) {
					roles = rolesString.split(',').map(role => role.trim());
				}
				
				// Berechtigungen festlegen
				responseData = await this.helpers.httpRequest({
					url: `${credentials.serverUrl as string}/api/setFolderRoles/${folderId}`,
					method: 'POST',
					body: roles,
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
			} else if (resource === 'folder' && operation === 'editFolder') {
				// Ordner bearbeiten
				const oId = this.getNodeParameter('oId', 0) as string;
				const foldername = this.getNodeParameter('foldername', 0) as string;
				const mainFolder = this.getNodeParameter('mainFolder', 0) as boolean;
				const active = this.getNodeParameter('active', 0) as boolean;
				const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;
				
				// Anfrageobjekt erstellen
				const requestBody: IDataObject = {
					oId,
					foldername,
					mainFolder,
					active,
				};
				
				// Zusätzliche Felder hinzufügen, falls vorhanden
				if (additionalFields.externalKey !== undefined) {
					requestBody.externalKey = additionalFields.externalKey;
				} else {
					requestBody.externalKey = '';
				}
				
				if (additionalFields.buzzwords !== undefined) {
					requestBody.buzzwords = additionalFields.buzzwords;
				} else {
					requestBody.buzzwords = '';
				}
				
				if (additionalFields.dataString !== undefined) {
					requestBody.dataString = additionalFields.dataString;
				} else {
					// Wenn kein dataString angegeben wurde, erstellen wir einen Standard-String
					// Format: [oId][foldername]﻿M﻿﻿[mainFolder als 0/1]﻿[oId]﻿U﻿ 
					const mainFolderValue = mainFolder ? '1' : '0';
					requestBody.dataString = `${oId}${foldername}﻿M﻿﻿${mainFolderValue}${oId}﻿U﻿ `;
				}
				
				// Ordner aktualisieren
				responseData = await this.helpers.httpRequest({
					url: `${credentials.serverUrl as string}/api/editFolder`,
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
			} else if (resource === 'folder' && operation === 'createFolder') {
				// Ordner erstellen
				const foldername = this.getNodeParameter('foldername', 0) as string;
				const mainFolder = this.getNodeParameter('mainFolder', 0) as boolean;
				const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;
				
				// Anfrageobjekt erstellen
				const requestBody: IDataObject = {
					foldername,
					mainFolder,
				};
				
				// Zusätzliche Felder hinzufügen, falls vorhanden
				if (additionalFields.externalKey !== undefined) {
					requestBody.externalKey = additionalFields.externalKey;
				} else {
					requestBody.externalKey = '';
				}
				
				if (additionalFields.buzzwords !== undefined) {
					requestBody.buzzwords = additionalFields.buzzwords;
				} else {
					requestBody.buzzwords = '';
				}
				
				// Ordner erstellen
				responseData = await this.helpers.httpRequest({
					url: `${credentials.serverUrl as string}/api/createFolder`,
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
			} else if (resource === 'folder' && operation === 'createSubfolder') {
				// Unterordner erstellen
				const parentoid = this.getNodeParameter('parentoid', 0) as string;
				const foldername = this.getNodeParameter('foldername', 0) as string;
				const mainFolder = this.getNodeParameter('mainFolder', 0) as boolean;
				const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;
				
				// Anfrageobjekt erstellen
				const requestBody: IDataObject = {
					foldername,
					mainFolder,
				};
				
				// Zusätzliche Felder hinzufügen, falls vorhanden
				if (additionalFields.externalKey !== undefined) {
					requestBody.externalKey = additionalFields.externalKey;
				} else {
					requestBody.externalKey = '';
				}
				
				if (additionalFields.buzzwords !== undefined) {
					requestBody.buzzwords = additionalFields.buzzwords;
				} else {
					requestBody.buzzwords = '';
				}
				
				// Unterordner erstellen
				responseData = await this.helpers.httpRequest({
					url: `${credentials.serverUrl as string}/api/createFolder/parent/${parentoid}`,
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
			} else if (resource === 'folder' && operation === 'getFolders') {
				// Ordner und Unterordner abrufen
				responseData = await this.helpers.httpRequest({
					url: `${credentials.serverUrl as string}/api/folders`,
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
			} else if (resource === 'documentType') {
				if (operation === 'getTypes') {
					// Dokumenttypen abrufen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/types`,
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
				} else if (operation === 'getTypeClassifications') {
					// Dokumenttyp-Klassifikationen abrufen
					const docTypeId = this.getNodeParameter('docTypeId', 0) as number;
					
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/typeClassifications/${docTypeId}`,
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
			} else if (resource === 'classification') {
				if (operation === 'getClassifyAttributes') {
					// Klassifikationsattribute abrufen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/classifyAttributes`,
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
				} else if (operation === 'getClassifyAttributesDetail') {
					// Detaillierte Klassifikationsattribute abrufen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/classifyAttributes/detailInformation`,
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
				} else if (operation === 'createNewClassify') {
					// Neue Klassifikation erstellen
					const docId = this.getNodeParameter('docId', 0) as number;
					const fields = this.getNodeParameter('fields', 0) as IDataObject;
					
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/document/${docId}/classify`,
						method: 'POST',
						body: fields,
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
				} else if (operation === 'classifyInboxDocument') {
					// Inbox-Dokument klassifizieren
					const docId = this.getNodeParameter('docId', 0) as number;
					const fields = this.getNodeParameter('fields', 0) as IDataObject;
					
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/inbox/${docId}/classify`,
						method: 'POST',
						body: fields,
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
				} else if (operation === 'classifyDocument') {
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
				} else if (operation === 'removeDocumentLink') {
					// Dokumentverknüpfungen entfernen
					const clDocId = this.getNodeParameter('clDocId', 0) as number;
					const linkIdsParam = this.getNodeParameter('linkIds', 0) as string;
					
					// Prüfen, ob mindestens eine ID angegeben wurde
					if (!linkIdsParam || linkIdsParam.trim() === '') {
						throw new NodeOperationError(
							this.getNode(),
							'Es muss mindestens eine Klassifikations-ID zum Entfernen angegeben werden',
						);
					}
					
					// String in Array von Zahlen umwandeln
					const linkIdsArray = linkIdsParam.split(',').map(id => parseInt(id.trim(), 10));
					
					// Fehler werfen, wenn ungültige IDs vorhanden sind
					if (linkIdsArray.some(id => isNaN(id))) {
						throw new NodeOperationError(
							this.getNode(),
							'Ungültige Klassifikations-IDs. Bitte geben Sie gültige Zahlen an, durch Kommas getrennt',
						);
					}
					
					// API-Aufruf durchführen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/document/${clDocId}/removeDocumentLink`,
						method: 'POST',
						body: linkIdsArray,
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
				} else if (operation === 'linkToDocuments') {
					// Dokumente verknüpfen
					const clDocId = this.getNodeParameter('clDocId', 0) as number;
					const linkIdsParam = this.getNodeParameter('linkIds', 0) as string;
					
					// Prüfen, ob mindestens eine ID angegeben wurde
					if (!linkIdsParam || linkIdsParam.trim() === '') {
						throw new NodeOperationError(
							this.getNode(),
							'Es muss mindestens eine Klassifikations-ID zum Verknüpfen angegeben werden',
						);
					}
					
					// String in Array von Zahlen umwandeln
					const linkIdsArray = linkIdsParam.split(',').map(id => parseInt(id.trim(), 10));
					
					// Fehler werfen, wenn ungültige IDs vorhanden sind
					if (linkIdsArray.some(id => isNaN(id))) {
						throw new NodeOperationError(
							this.getNode(),
							'Ungültige Klassifikations-IDs. Bitte geben Sie gültige Zahlen an, durch Kommas getrennt',
						);
					}
					
					// API-Aufruf durchführen
					responseData = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/document/${clDocId}/linkToDocuments`,
						method: 'POST',
						body: linkIdsArray,
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
			}
		}
		
		// Wenn responseData ein Array ist, jedes Element verarbeiten
		if (Array.isArray(responseData)) {
			for (const item of responseData) {
				if (typeof item === 'object') {
					returnData.push({ json: item });
				} else {
					returnData.push({ json: { data: item } });
				}
			}
		} else if (responseData !== undefined) {
			// Sicherstellen, dass responseData ein Objekt ist
			if (typeof responseData === 'object') {
				returnData.push({ json: responseData });
			} else {
				// Primitive Werte (strings, numbers, etc.) in ein Objekt verpacken
				returnData.push({ json: { data: responseData } });
			}
		}
		
		// Sicherstellen, dass wir mindestens ein Element zurückgeben
		if (returnData.length === 0) {
			returnData.push({ json: { success: true } });
		}
		
		return [returnData];
	}

	// Diese Methode lädt Dokumenttypen für das Auswahlmenü
	async loadDocumentTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const returnData: INodePropertyOptions[] = [];
		const credentials = await this.getCredentials('ecoDmsApi');
		
		try {
			// API-Aufruf, um Dokumenttypen abzurufen
			const response = await this.helpers.httpRequest({
				url: `${credentials.serverUrl as string}/api/getDocTypes`,
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
			
			// Daten für die Auswahlliste aufbereiten
			if (response && Array.isArray(response)) {
				for (const docType of response) {
					if (docType.id !== undefined && docType.name !== undefined) {
						returnData.push({
							name: docType.name,
							value: docType.id.toString(),
							description: docType.description || '',
						});
					}
				}
			}
		} catch (error) {
			console.error('Fehler beim Laden der Dokumenttypen:', error);
		}
		
		return returnData;
	}
	
	// Diese Methode lädt Ordner für das Auswahlmenü
	async loadFolders(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const returnData: INodePropertyOptions[] = [];
		const credentials = await this.getCredentials('ecoDmsApi');
		
		try {
			// API-Aufruf, um Ordner abzurufen
			const response = await this.helpers.httpRequest({
				url: `${credentials.serverUrl as string}/api/getFolders`,
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
			
			// Rekursive Funktion zum Erstellen einer Baumstruktur
			const processFolders = (folders: any[], parentPath = '') => {
				if (!Array.isArray(folders)) return;
				
				for (const folder of folders) {
					if (folder.id !== undefined && folder.name !== undefined) {
						const folderPath = parentPath ? `${parentPath}.${folder.id}` : folder.id;
						const displayName = parentPath ? `${parentPath} > ${folder.name}` : folder.name;
						
						returnData.push({
							name: displayName,
							value: folderPath,
							description: folder.description || '',
						});
						
						// Unterordner verarbeiten, falls vorhanden
						if (folder.subfolders && Array.isArray(folder.subfolders)) {
							processFolders(folder.subfolders, displayName);
						}
					}
				}
			};
			
			// Ordner verarbeiten
			if (response && Array.isArray(response)) {
				processFolders(response);
			}
		} catch (error) {
			console.error('Fehler beim Laden der Ordner:', error);
		}
		
		return returnData;
	}

	// Die bestehende loadOptions-Methode beibehalten oder aktualisieren
	async loadOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const returnData: INodePropertyOptions[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('ecoDmsApi');

		if (resource === Resource.Classification && operation === Operation.ClassifyDocument) {
			if (this.getNodeParameter('name', 0) === 'docartSelect') {
				// Dokumenttypen für Auswahlliste laden
				try {
					const response = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/documentTypes`,
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

					// Dokumenttypen als Options bereitstellen
					if (response && Array.isArray(response)) {
						for (const docType of response) {
							if (docType.id !== undefined && docType.name !== undefined) {
								returnData.push({
									name: docType.name,
									value: docType.id.toString(),
									description: `Dokumenttyp: ${docType.name} (ID: ${docType.id})`,
								});
							}
						}
					}
				} catch (error) {
					console.error('Fehler beim Laden der Dokumenttypen:', error);
					returnData.push({
						name: 'Fehler beim Laden der Dokumenttypen',
						value: '',
						description: 'Bitte Serververbindung prüfen',
					});
				}
			}
		}

		return returnData;
	}
} 