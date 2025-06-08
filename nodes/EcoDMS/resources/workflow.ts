import type { INodeProperties } from 'n8n-workflow';
import { Operation, Resource } from '../utils/constants';

export const workflowOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	displayOptions: {
		show: {
			resource: [Resource.Workflow],
		},
	},
	options: [
		{
			name: 'Hochladen und Klassifizieren',
			value: Operation.UploadAndClassify,
			description: 'Dokument hochladen und sofort klassifizieren',
			action: 'Dokument hochladen und klassifizieren',
		},
		{
			name: 'Benutzerfreundlich hochladen und klassifizieren',
			value: 'uploadAndClassifyUserFriendly',
			description:
				'Dokument hochladen und mit strukturierten Feldern klassifizieren - VIEL EINFACHER!',
			action: 'Benutzerfreundlich hochladen und klassifizieren',
		},
		{
			name: 'Suchen und Herunterladen',
			value: Operation.SearchAndDownload,
			description: 'Nach Dokumenten suchen und als Binärdaten herunterladen',
			action: 'Suchen und Herunterladen',
		},
	],
	default: Operation.UploadAndClassify,
	noDataExpression: true,
	required: true,
};

export const workflowFields: INodeProperties[] = [
	// Hochladen und Klassifizieren
	{
		displayName: 'Binäre Eigenschaft',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Workflow],
				operation: [Operation.UploadAndClassify],
			},
		},
		description: 'Name der binären Eigenschaft, die die hochzuladende Datei enthält',
	},
	{
		displayName: 'Klassifikationsattribute',
		name: 'classifyAttributes',
		type: 'json',
		default:
			'{\n  "docart": "1",\n  "revision": "1.0",\n  "bemerkung": "Automatisch klassifiziert",\n  "folder": "1.4",\n  "status": "1"\n}',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Workflow],
				operation: [Operation.UploadAndClassify],
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
				resource: [Resource.Workflow],
				operation: [Operation.UploadAndClassify],
			},
		},
		description: 'Kommagetrennte Liste von Rollen, die das Dokument bearbeiten dürfen',
	},
	{
		displayName: 'Leserollen',
		name: 'readRoles',
		type: 'string',
		default: '',
		required: false,
		displayOptions: {
			show: {
				resource: [Resource.Workflow],
				operation: [Operation.UploadAndClassify],
			},
		},
		description: 'Kommagetrennte Liste von Rollen, die das Dokument lesen dürfen',
	},

	// ===== BENUTZERFREUNDLICH HOCHLADEN UND KLASSIFIZIEREN =====
	{
		displayName: 'Binäre Eigenschaft',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Workflow],
				operation: ['uploadAndClassifyUserFriendly'],
			},
		},
		description: 'Name der binären Eigenschaft, die die hochzuladende Datei enthält',
	},

	// === PFLICHTFELDER (Top-Level) ===
	{
		displayName: 'Dokumententyp',
		name: 'documentType',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Workflow],
				operation: ['uploadAndClassifyUserFriendly'],
			},
		},
		modes: [
			{
				displayName: 'Aus Liste wählen',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchDocumentTypes',
					searchable: true,
				},
			},
			{
				displayName: 'ID eingeben',
				name: 'id',
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[0-9]+$',
							errorMessage: 'Bitte eine gültige Dokumententyp-ID eingeben',
						},
					},
				],
			},
		],
		description: 'Wählen Sie den Dokumententyp aus der Liste oder geben Sie die ID ein',
	},
	{
		displayName: 'Ablageordner',
		name: 'folder',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Workflow],
				operation: ['uploadAndClassifyUserFriendly'],
			},
		},
		modes: [
			{
				displayName: 'Aus Liste wählen',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchFolders',
					searchable: true,
				},
			},
			{
				displayName: 'ID eingeben',
				name: 'id',
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[0-9.]+$',
							errorMessage: 'Bitte eine gültige Ordner-ID eingeben (z.B. 1.4)',
						},
					},
				],
			},
		],
		description: 'Wählen Sie den Ablageordner aus der Liste oder geben Sie die ID ein',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Workflow],
				operation: ['uploadAndClassifyUserFriendly'],
			},
		},
		modes: [
			{
				displayName: 'Aus Liste wählen',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchStatusValues',
					searchable: true,
				},
			},
			{
				displayName: 'ID eingeben',
				name: 'id',
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[0-9]+$',
							errorMessage: 'Bitte eine gültige Status-ID eingeben',
						},
					},
				],
			},
		],
		description: 'Wählen Sie den Dokumentstatus aus der Liste oder geben Sie die ID ein',
	},
	{
		displayName: 'Titel/Bemerkung',
		name: 'documentTitle',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Workflow],
				operation: ['uploadAndClassifyUserFriendly'],
			},
		},
		description: 'Titel oder Bemerkung für das Dokument',
	},

	// === ZUSÄTZLICHE FELDER (Optional) ===
	{
		displayName: 'Zusätzliche Felder',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Zusätzliche Felder hinzufügen',
		default: {},
		displayOptions: {
			show: {
				resource: [Resource.Workflow],
				operation: ['uploadAndClassifyUserFriendly'],
			},
		},
		options: [
			{
				displayName: 'Revision',
				name: 'revision',
				type: 'string',
				default: '1.0',
				description: 'Versionsnummer des Dokuments',
			},
			{
				displayName: 'Schlagwörter',
				name: 'keywords',
				type: 'string',
				default: '',
				description: 'Kommagetrennte Liste von Schlagwörtern',
			},
			{
				displayName: 'Autor',
				name: 'author',
				type: 'string',
				default: '',
				description: 'Autor des Dokuments',
			},
			{
				displayName: 'Datum',
				name: 'documentDate',
				type: 'dateTime',
				default: '',
				description: 'Datum des Dokuments',
			},
			{
				displayName: 'Bearbeitungsrollen',
				name: 'editRoles',
				type: 'string',
				default: 'Elite',
				description: 'Kommagetrennte Liste von Rollen mit Bearbeitungsrechten',
			},
			{
				displayName: 'Leserollen',
				name: 'readRoles',
				type: 'string',
				default: '',
				description: 'Kommagetrennte Liste von Rollen mit Leserechten',
			},
			{
				displayName: 'Benutzer zuweisen',
				name: 'assignedUsers',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						displayName: 'Benutzer',
						name: 'user',
						values: [
							{
								displayName: 'Benutzer',
								name: 'userId',
								type: 'resourceLocator',
								default: { mode: 'list', value: '' },
								required: true,
								modes: [
									{
										displayName: 'Aus Liste wählen',
										name: 'list',
										type: 'list',
										typeOptions: {
											searchListMethod: 'searchUsers',
											searchable: true,
										},
									},
									{
										displayName: 'ID eingeben',
										name: 'id',
										type: 'string',
										validation: [
											{
												type: 'regex',
												properties: {
													regex: '^[0-9]+$',
													errorMessage: 'Bitte eine gültige Benutzer-ID eingeben',
												},
											},
										],
									},
								],
								description: 'Wählen Sie einen Benutzer aus der Liste oder geben Sie die ID ein',
							},
							{
								displayName: 'Berechtigung',
								name: 'permission',
								type: 'options',
								options: [
									{ name: 'Lesen', value: 'read' },
									{ name: 'Bearbeiten', value: 'edit' },
									{ name: 'Vollzugriff', value: 'full' },
								],
								default: 'read',
								description: 'Berechtigung für den Benutzer',
							},
						],
					},
				],
				description: 'Benutzer mit spezifischen Berechtigungen zuweisen',
			},
			{
				displayName: 'Gruppen zuweisen',
				name: 'assignedGroups',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						displayName: 'Gruppe',
						name: 'group',
						values: [
							{
								displayName: 'Gruppe',
								name: 'groupId',
								type: 'resourceLocator',
								default: { mode: 'list', value: '' },
								required: true,
								modes: [
									{
										displayName: 'Aus Liste wählen',
										name: 'list',
										type: 'list',
										typeOptions: {
											searchListMethod: 'searchGroups',
											searchable: true,
										},
									},
									{
										displayName: 'ID eingeben',
										name: 'id',
										type: 'string',
										validation: [
											{
												type: 'regex',
												properties: {
													regex: '^[0-9]+$',
													errorMessage: 'Bitte eine gültige Gruppen-ID eingeben',
												},
											},
										],
									},
								],
								description: 'Wählen Sie eine Gruppe aus der Liste oder geben Sie die ID ein',
							},
							{
								displayName: 'Berechtigung',
								name: 'permission',
								type: 'options',
								options: [
									{ name: 'Lesen', value: 'read' },
									{ name: 'Bearbeiten', value: 'edit' },
									{ name: 'Vollzugriff', value: 'full' },
								],
								default: 'read',
								description: 'Berechtigung für die Gruppe',
							},
						],
					},
				],
				description: 'Gruppen mit spezifischen Berechtigungen zuweisen',
			},
			{
				displayName: 'Dynamische Custom Fields',
				name: 'dynamicCustomFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						displayName: 'Custom Field',
						name: 'customField',
						values: [
							{
								displayName: 'Feldname',
								name: 'fieldName',
								type: 'resourceLocator',
								default: { mode: 'list', value: '' },
								required: true,
								modes: [
									{
										displayName: 'Aus Liste wählen',
										name: 'list',
										type: 'list',
										typeOptions: {
											searchListMethod: 'searchCustomFields',
											searchable: true,
										},
									},
									{
										displayName: 'Feldname eingeben',
										name: 'manual',
										type: 'string',
										placeholder: 'z.B. dyn_0_1619856272598',
										validation: [
											{
												type: 'regex',
												properties: {
													regex: '^dyn_.*$',
													errorMessage: 'Custom Field Namen müssen mit "dyn_" beginnen',
												},
											},
										],
									},
								],
								description:
									'Wählen Sie ein Custom Field aus der Liste oder geben Sie den Namen manuell ein',
							},
							{
								displayName: 'Feldtyp',
								name: 'fieldType',
								type: 'options',
								options: [
									{ name: 'Text', value: 'text' },
									{ name: 'Zahl', value: 'number' },
									{ name: 'Datum', value: 'date' },
									{ name: 'Boolean', value: 'boolean' },
									{ name: 'Dropdown', value: 'dropdown' },
								],
								default: 'text',
								description: 'Typ des Custom Fields',
							},
							{
								displayName: 'Wert',
								name: 'fieldValue',
								type: 'string',
								default: '',
								description: 'Wert für das Custom Field (Format je nach Feldtyp)',
							},
						],
					},
				],
				description: 'Dynamisch geladene Custom Fields basierend auf der ecoDMS-Instanz',
			},
			{
				displayName: 'Manuelle Custom Fields',
				name: 'manualCustomFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						displayName: 'Feld',
						name: 'customField',
						values: [
							{
								displayName: 'Feldname',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name des benutzerdefinierten Feldes (z.B. dyn_0_1619856272598)',
							},
							{
								displayName: 'Wert',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Wert für das benutzerdefinierte Feld',
							},
						],
					},
				],
				description: 'Manuell eingegebene Custom Fields für spezielle Anforderungen',
			},
		],
		description: 'Optionale Zusatzfelder für Upload und Klassifizierung',
	},

	// Suchen und Herunterladen
	{
		displayName: 'Suchbegriff',
		name: 'searchTerm',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Workflow],
				operation: [Operation.SearchAndDownload],
			},
		},
		description: 'Begriff, nach dem gesucht werden soll',
	},
	{
		displayName: 'Binäre Eigenschaft',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Workflow],
				operation: [Operation.SearchAndDownload],
			},
		},
		description:
			'Name der binären Eigenschaft, in der die heruntergeladenen Dokumente gespeichert werden',
	},
	{
		displayName: 'Ergebnislimit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 10,
		required: false,
		displayOptions: {
			show: {
				resource: [Resource.Workflow],
				operation: [Operation.SearchAndDownload],
			},
		},
		description: 'Maximale Anzahl der zurückgegebenen und heruntergeladenen Dokumente',
	},
];
