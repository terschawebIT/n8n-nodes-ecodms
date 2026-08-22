import type { INodeProperties } from 'n8n-workflow';
import { Operation, Resource } from '../utils/constants';

export const searchOperations: INodeProperties = {
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
			name: 'Einfache Suche',
			value: Operation.Search,
			description: 'Volltextsuche nach Dokumenten',
			action: 'Volltextsuche durchführen',
		},
		{
			name: 'Erweiterte Suche',
			value: Operation.AdvancedSearch,
			description: 'Erweiterte Suche mit mehreren Kriterien',
			action: 'Erweiterte Suche durchführen',
		},
		{
			name: 'Suchen und Herunterladen',
			value: Operation.SearchAndDownload,
			description: 'Suche nach Dokumenten und lade sie herunter',
			action: 'Suchen und Herunterladen durchführen',
		},
	],
	default: Operation.Search,
	noDataExpression: true,
	required: true,
};

export const searchFields: INodeProperties[] = [
	// Einfache Suche
	{
		displayName: 'Suchtext',
		name: 'searchText',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Search],
				operation: [Operation.Search],
			},
		},
		description: 'Text, nach dem in allen Dokumenten gesucht werden soll (Volltextsuche)',
	},
	{
		displayName: 'Maximale Anzahl Dokumente',
		name: 'maxDocuments',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 100,
		required: false,
		displayOptions: {
			show: {
				resource: [Resource.Search],
				operation: [Operation.Search],
			},
		},
		description: 'Maximale Anzahl der zurückgegebenen Dokumente (maximal 100)',
	},

	// Erweiterte Suche
	{
		displayName: 'Suchfilter',
		name: 'searchFilters',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		placeholder: 'Filter hinzufügen',
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
					// Attribut-Auswahl für erweiterte Suche
					{
						displayName: 'Attribut',
						name: 'classifyAttribut',
						type: 'options',
						options: [
							{ name: 'Bemerkung', value: 'bemerkung' },
							{ name: 'Datum', value: 'cdate' },
							{ name: 'Dokumentart', value: 'docart' },
							{ name: 'Ordner (inkl. Unterordner)', value: 'folder' },
							{ name: 'Nur in diesem Ordner', value: 'folderonly' },
							{ name: 'Hauptordner (inkl. Unterordner)', value: 'mainfolder' },
							{ name: 'Nur in diesem Hauptordner', value: 'mainfolderonly' },
							{ name: 'Status', value: 'status' },
							{ name: 'Bearbeiter', value: 'changeid' },
							{ name: 'Wiedervorlage-Datum', value: 'defdate' },
							{ name: 'Zeitstempel', value: 'ctimestamp' },
							{ name: '--- Benutzerdefiniertes Feld ---', value: 'custom' },
						],
						default: 'bemerkung',
						description: 'Das Attribut, nach dem gesucht werden soll',
					},
					// Custom Field Dropdown (nur wenn "Benutzerdefiniertes Feld" gewählt)
					{
						displayName: 'Custom Field',
						name: 'customFieldName',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getCustomFields',
						},
						default: '',
						displayOptions: {
							show: {
								classifyAttribut: ['custom'],
							},
						},
						description: 'Das benutzerdefinierte Feld (dyn_*), nach dem gesucht werden soll',
					},
					// Operator (ein Feld für alle Attributtypen)
					{
						displayName: 'Operator',
						name: 'searchOperator',
						type: 'options',
						options: [
							{ name: 'Gleich (=)', value: '=' },
							{ name: 'Nicht gleich (!=)', value: '!=' },
							{ name: 'Enthält (ilike)', value: 'ilike' },
							{ name: 'Enthält nicht (not ilike)', value: 'not ilike' },
							{ name: 'Größer als (>)', value: '>' },
							{ name: 'Größer oder gleich (>=)', value: '>=' },
							{ name: 'Kleiner als (<)', value: '<' },
							{ name: 'Kleiner oder gleich (<=)', value: '<=' },
						],
						default: '=',
						required: true,
						description:
							'Der Vergleichsoperator. Für Text: =, !=, ilike, not ilike. Für Datum/Zahlen: =, !=, >, >=, <, <=. Für Auswahl: =, !=',
					},
					// Suchtext für Textfelder und Custom Fields
					{
						displayName: 'Suchtext',
						name: 'searchValueText',
						type: 'string',
						default: '',
						placeholder: 'Suchbegriff eingeben',
						displayOptions: {
							show: {
								classifyAttribut: ['bemerkung', 'changeid', 'custom'],
							},
						},
						description: 'Der Text, nach dem gesucht werden soll',
					},
					// Datum-Eingabe für Datum-Felder
					{
						displayName: 'Datum',
						name: 'searchValueDate',
						type: 'dateTime',
						default: '',
						displayOptions: {
							show: {
								classifyAttribut: ['cdate', 'defdate', 'ctimestamp'],
							},
						},
						description: 'Das Datum, nach dem gesucht werden soll (Format: YYYY-MM-DD)',
					},
					// Dropdown für Dokumententyp
					{
						displayName: 'Dokumententyp',
						name: 'searchValueDocumentType',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getDocumentTypes',
						},
						displayOptions: {
							show: {
								classifyAttribut: ['docart'],
							},
						},
						default: '',
						description: 'Die Dokumentart, nach der gesucht werden soll',
					},
					// Dropdown für Ordner
					{
						displayName: 'Ordner',
						name: 'searchValueFolder',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getFolders',
						},
						displayOptions: {
							show: {
								classifyAttribut: ['folder', 'folderonly', 'mainfolder', 'mainfolderonly'],
							},
						},
						default: '',
						description: 'Der Ordner, nach dem gesucht werden soll',
					},
					// Dropdown für Status
					{
						displayName: 'Status',
						name: 'searchValueStatus',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getStatusValues',
						},
						displayOptions: {
							show: {
								classifyAttribut: ['status'],
							},
						},
						default: '',
						description: 'Der Status, nach dem gesucht werden soll',
					},
				],
			},
		],
		description: 'Filter für die Suche. Mehrere Filter werden mit UND verknüpft.',
	},

	// Zusätzliche Parameter für erweiterte Suche
	{
		displayName: 'Zusätzliche Optionen',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Optionen hinzufügen',
		default: {},
		displayOptions: {
			show: {
				resource: [Resource.Search],
				operation: [Operation.AdvancedSearch],
			},
		},
		options: [
			{
				displayName: 'Nur eigene Dokumente',
				name: 'personalDocumentsOnly',
				type: 'boolean',
				default: false,
				description:
					'Wenn aktiviert, werden nur Dokumente zurückgegeben, die dem Benutzer direkt zugewiesen sind (über eine Benutzerrolle oder eine Rolle, der der Benutzer zugewiesen ist)',
			},
			{
				displayName: 'Gelöschte Dokumente',
				name: 'trashedDocuments',
				type: 'boolean',
				default: false,
				description:
					'Wenn aktiviert, werden nur gelöschte Dokumente in der Suche berücksichtigt, sonst nur nicht gelöschte Dokumente',
			},
			{
				displayName: 'Maximale Anzahl Dokumente',
				name: 'maxDocumentCount',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 1000,
				},
				default: 100,
				description: 'Maximale Anzahl der zurückgegebenen Dokumente (Maximalwert: 1000)',
			},
			{
				displayName: 'Berechtigungen anzeigen',
				name: 'readRoles',
				type: 'boolean',
				default: true,
				description:
					'Bestimmt, ob editRoles und readRoles im Ergebnis zurückgegeben werden. Wenn deaktiviert, werden leere Listen für die Rollen zurückgegeben',
			},
		],
	},

	// Suchen und Herunterladen
	{
		displayName: 'Suchfilter',
		name: 'searchFilters',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		placeholder: 'Filter hinzufügen',
		default: {},
		displayOptions: {
			show: {
				resource: [Resource.Search],
				operation: [Operation.SearchAndDownload],
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
						type: 'options',
						options: [
							{ name: 'Bemerkung', value: 'bemerkung' },
							{ name: 'Datum', value: 'cdate' },
							{ name: 'Dokumentart', value: 'docart' },
							{ name: 'Ordner', value: 'folder' },
							{ name: 'Nur in diesem Ordner', value: 'folderonly' },
							{ name: 'Hauptordner (inkl. Unterordner)', value: 'mainfolder' },
							{ name: 'Nur in diesem Hauptordner', value: 'mainfolderonly' },
							{ name: 'Status', value: 'status' },
							{ name: 'Bearbeiter', value: 'changeid' },
							{ name: 'Wiedervorlage-Datum', value: 'defdate' },
							{ name: 'Zeitstempel', value: 'ctimestamp' },
							{ name: '--- Benutzerdefiniertes Feld ---', value: 'custom' },
						],
						default: 'bemerkung',
						description: 'Das Attribut, nach dem gesucht werden soll',
					},
					{
						displayName: 'Custom Field',
						name: 'customFieldName',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getCustomFields',
						},
						default: '',
						displayOptions: {
							show: {
								classifyAttribut: ['custom'],
							},
						},
						description: 'Das benutzerdefinierte Feld (dyn_*), nach dem gesucht werden soll',
					},
					{
						displayName: 'Operator',
						name: 'searchOperator',
						type: 'options',
						options: [
							{ name: 'Gleich (=)', value: '=' },
							{ name: 'Nicht gleich (!=)', value: '!=' },
							{ name: 'Enthält (ilike)', value: 'ilike' },
							{ name: 'Enthält nicht (not ilike)', value: 'not ilike' },
							{ name: 'Größer als (>)', value: '>' },
							{ name: 'Größer oder gleich (>=)', value: '>=' },
							{ name: 'Kleiner als (<)', value: '<' },
							{ name: 'Kleiner oder gleich (<=)', value: '<=' },
						],
						default: '=',
						required: true,
						description:
							'Der Vergleichsoperator. Für Text: =, !=, ilike, not ilike. Für Datum/Zahlen: =, !=, >, >=, <, <=. Für Auswahl: =, !=',
					},
					{
						displayName: 'Wert',
						name: 'searchValue',
						type: 'string',
						default: '',
						placeholder: 'Suchbegriff eingeben',
						displayOptions: {
							hide: {
								classifyAttribut: ['docart', 'folder', 'status'],
							},
						},
						description: 'Der Wert, nach dem gesucht werden soll',
					},
					{
						displayName: 'Dokumententyp',
						name: 'searchValueDocumentType',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getDocumentTypes',
						},
						displayOptions: {
							show: {
								classifyAttribut: ['docart'],
							},
						},
						default: '',
						description: 'Die Dokumentart, nach der gesucht werden soll',
					},
					{
						displayName: 'Ordner',
						name: 'searchValueFolder',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getFolders',
						},
						displayOptions: {
							show: {
								classifyAttribut: ['folder', 'folderonly', 'mainfolder', 'mainfolderonly'],
							},
						},
						default: '',
						description: 'Der Ordner, nach dem gesucht werden soll',
					},
					{
						displayName: 'Status',
						name: 'searchValueStatus',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getStatusValues',
						},
						displayOptions: {
							show: {
								classifyAttribut: ['status'],
							},
						},
						default: '',
						description: 'Der Status, nach dem gesucht werden soll',
					},
				],
			},
		],
		description: 'Filter für die Suche und das Herunterladen von Dokumenten',
	},

	{
		displayName: 'Binäre Eigenschaft',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Search],
				operation: [Operation.SearchAndDownload],
			},
		},
		description:
			'Name der binären Eigenschaft, in der die heruntergeladenen Dokumente gespeichert werden',
	},

	{
		displayName: 'Maximale Anzahl Dokumente',
		name: 'maxDocuments',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 10,
		required: false,
		displayOptions: {
			show: {
				resource: [Resource.Search],
				operation: [Operation.SearchAndDownload],
			},
		},
		description: 'Maximale Anzahl der heruntergeladenen Dokumente (aus Leistungsgründen maximal 100)',
	},
];
