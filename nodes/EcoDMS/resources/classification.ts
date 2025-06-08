import type { INodeProperties } from 'n8n-workflow';
import { Operation, Resource } from '../utils/constants';

export const classificationOperations: INodeProperties = {
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
			description: 'Verfügbare Klassifikationsattribute für ein Dokument abrufen',
			action: 'Klassifikationsattribute abrufen',
		},
		{
			name: 'Detaillierte Klassifikationsattribute abrufen',
			value: Operation.GetClassifyAttributesDetail,
			description: 'Detaillierte Klassifikationsattribute für ein Dokument abrufen',
			action: 'Detaillierte Klassifikationsattribute abrufen',
		},
		{
			name: 'Attribut-Details abrufen',
			value: Operation.GetAttributeDetails,
			description: 'Detaillierte Informationen zu einem spezifischen Klassifikationsattribut abrufen',
			action: 'Attribut-Details abrufen',
		},
		{
			name: 'Neue Klassifikation erstellen',
			value: Operation.CreateNewClassify,
			description: 'Eine neue Klassifikation für ein bestehendes Dokument erstellen',
			action: 'Neue Klassifikation erstellen',
		},
		{
			name: 'Inbox-Dokument klassifizieren',
			value: Operation.ClassifyInboxDocument,
			description: 'Ein Dokument aus dem Inbox-Bereich klassifizieren',
			action: 'Inbox-Dokument klassifizieren',
		},
		{
			name: 'Dokument-Klassifikation aktualisieren',
			value: Operation.ClassifyDocument,
			description:
				'Eine bestehende Dokumentklassifikation aktualisieren. Vorgehensweise:\n1. Ermittle docId und clDocId mit "Dokumentinformationen abrufen"\n2. Ermittle verfügbare Klassifikationsattribute mit "Klassifikationsattribute abrufen"\n3. Aktualisiere die gewünschten Attribute\n\nBeispielantwort: Klassifikations-ID, die aktualisiert wurde.',
			action: 'Dokument-Klassifikation aktualisieren',
		},
		{
			name: 'Benutzerfreundlich klassifizieren',
			value: 'classifyUserFriendly',
			description:
				'Benutzerfreundliche Dokumentklassifizierung mit strukturierten Feldern und Dropdown-Menüs',
			action: 'Benutzerfreundlich klassifizieren',
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
};

export const classificationFields: INodeProperties[] = [
	// ===== BENUTZERFREUNDLICHE KLASSIFIZIERUNG =====
	// Dokument-ID für benutzerfreundliche Klassifizierung
	{
		displayName: 'Dokument-ID',
		name: 'docId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Classification],
				operation: ['classifyUserFriendly'],
			},
		},
		description: 'Die ID des Dokuments, das klassifiziert werden soll',
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
				resource: [Resource.Classification],
				operation: ['classifyUserFriendly'],
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
				resource: [Resource.Classification],
				operation: ['classifyUserFriendly'],
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
				resource: [Resource.Classification],
				operation: ['classifyUserFriendly'],
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
				resource: [Resource.Classification],
				operation: ['classifyUserFriendly'],
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
				resource: [Resource.Classification],
				operation: ['classifyUserFriendly'],
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
				displayName: 'Datum',
				name: 'documentDate',
				type: 'dateTime',
				default: '',
				description: 'Datum des Dokuments',
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
								typeOptions: {
									loadOptionsMethod: 'getCustomFieldType',
								},
								default: 'string',
								description:
									'Typ des Custom Fields (wird automatisch erkannt basierend auf dem gewählten Feld)',
							},
							{
								displayName: 'Wert',
								name: 'fieldValue',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										fieldType: ['string', 'number', 'dateTime'],
									},
								},
								description: 'Wert für das Custom Field',
							},
							{
								displayName: 'Boolean Wert',
								name: 'fieldValue',
								type: 'boolean',
								default: false,
								displayOptions: {
									show: {
										fieldType: ['boolean'],
									},
								},
								description: 'Boolean Wert für das Custom Field',
							},
							{
								displayName: 'Auswahl',
								name: 'fieldValue',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getComboBoxOptions',
								},
								default: '',
								displayOptions: {
									show: {
										fieldType: ['options'],
									},
								},
								description: 'Wählen Sie eine Option aus der Liste',
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
		description: 'Optionale Zusatzfelder für die Klassifizierung',
	},

	// ===== BESTEHENDE KLASSIFIZIERUNGS-OPERATIONEN =====
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
		default:
			'{\n  "docart": "1",\n  "revision": "1.0",\n  "bemerkung": "Aktualisierte Klassifikation",\n  "folder": "1.4",\n  "status": "1"\n}',
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
		description:
			'Kommagetrennte Liste von Rollen, die das Dokument bearbeiten dürfen (z.B. "r_ecodms,Elite")',
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
		description:
			'Kommagetrennte Liste von Rollen, die das Dokument lesen dürfen (z.B. "ecoSIMSUSER,Gast")',
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
		description:
			'Die ID der Dokumentklassifikation, für die Links entfernt oder hinzugefügt werden sollen',
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
				operation: [Operation.CreateNewClassify, Operation.ClassifyInboxDocument],
			},
		},
		description: 'Die Klassifikationsfelder im JSON-Format',
	},

	// ===== ATTRIBUT-DETAILS ABRUFEN =====
	{
		displayName: 'Dokument-ID',
		name: 'docId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Classification],
				operation: [Operation.GetAttributeDetails],
			},
		},
		description: 'Die ID des Dokuments, für das Attribut-Details abgerufen werden sollen',
	},
	{
		displayName: 'Attribut auswählen',
		name: 'attributeName',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Classification],
				operation: [Operation.GetAttributeDetails],
			},
		},
		modes: [
			{
				displayName: 'Aus Liste wählen',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchClassificationAttributes',
					searchable: true,
				},
			},
			{
				displayName: 'Name eingeben',
				name: 'name',
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[a-zA-Z_][a-zA-Z0-9_]*$',
							errorMessage:
								'Bitte einen gültigen Attributnamen eingeben (z.B. docart, dyn_0_1619856272598)',
						},
					},
				],
			},
		],
		description: 'Wählen Sie das Attribut aus der Liste oder geben Sie den Namen manuell ein',
	},
];
