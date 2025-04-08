import { ILoadOptionsFunctions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { Resource, Operation } from '../utils/constants';
import { getFolders, getDocumentTypes, getStatusValues } from '../utils/helpers';

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
					// Operator für erweiterte Suche - Textattribute
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
						],
						default: 'bemerkung',
						description: 'Das Attribut, nach dem gesucht werden soll',
					},
					{
						displayName: 'Operator',
						name: 'searchOperator',
						type: 'options',
						options: [
							{ name: 'Gleich (=)', value: '=' },
							{ name: 'Nicht gleich (!=)', value: '!=' },
						],
						displayOptions: {
							show: {
								classifyAttribut: ['docart', 'folder', 'folderonly', 'mainfolder', 'mainfolderonly', 'status'],
							},
						},
						default: '=',
						required: true,
						description: 'Der Vergleichsoperator für die Suche',
					},
					{
						displayName: 'Wert',
						name: 'searchValue',
						type: 'string',
						default: 'Suchbegriff eingeben',
						displayOptions: {
							hide: {
								classifyAttribut: ['docart', 'folder', 'folderonly', 'mainfolder', 'mainfolderonly', 'status'],
							},
						},
						description: 'Der Wert, nach dem gesucht werden soll',
					},
					{
						displayName: 'Wert',
						name: 'searchValue',
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
						displayName: 'Wert',
						name: 'searchValue',
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
						displayName: 'Wert',
						name: 'searchValue',
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
				description: 'Wenn aktiviert, werden nur Dokumente zurückgegeben, die dem Benutzer direkt zugewiesen sind (über eine Benutzerrolle oder eine Rolle, der der Benutzer zugewiesen ist)',
			},
			{
				displayName: 'Gelöschte Dokumente',
				name: 'trashedDocuments',
				type: 'boolean',
				default: false,
				description: 'Wenn aktiviert, werden nur gelöschte Dokumente in der Suche berücksichtigt, sonst nur nicht gelöschte Dokumente',
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
				description: 'Bestimmt, ob editRoles und readRoles im Ergebnis zurückgegeben werden. Wenn deaktiviert, werden leere Listen für die Rollen zurückgegeben',
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
						],
						default: 'bemerkung',
						description: 'Das Attribut, nach dem gesucht werden soll',
					},
					{
						displayName: 'Operator',
						name: 'searchOperator',
						type: 'options',
						options: [
							{ name: 'Gleich (=)', value: '=' },
							{ name: 'Nicht gleich (!=)', value: '!=' },
							{ name: 'Enthält (like)', value: 'like' },
							{ name: 'Enthält nicht (!like)', value: '!like' },
							{ name: 'Enthält (Groß/Klein ignorieren, ilike)', value: 'ilike' },
							{ name: 'Enthält nicht (Groß/Klein ignorieren, !ilike)', value: '!ilike' },
						],
						displayOptions: {
							show: {
								classifyAttribut: ['bemerkung', 'changeid'],
							},
						},
						default: '=',
						required: true,
						description: 'Der Vergleichsoperator für die Suche',
					},
					{
						displayName: 'Operator',
						name: 'searchOperator',
						type: 'options',
						options: [
							{ name: 'Gleich (=)', value: '=' },
							{ name: 'Nicht gleich (!=)', value: '!=' },
						],
						displayOptions: {
							show: {
								classifyAttribut: ['docart', 'folder', 'status'],
							},
						},
						default: '=',
						required: true,
						description: 'Der Vergleichsoperator für die Suche',
					},
					{
						displayName: 'Operator',
						name: 'searchOperator',
						type: 'options',
						options: [
							{ name: 'Gleich (=)', value: '=' },
							{ name: 'Nicht gleich (!=)', value: '!=' },
							{ name: 'Größer als (>)', value: '>' },
							{ name: 'Größer oder gleich (>=)', value: '>=' },
							{ name: 'Kleiner als (<)', value: '<' },
							{ name: 'Kleiner oder gleich (<=)', value: '<=' },
						],
						displayOptions: {
							show: {
								classifyAttribut: ['cdate', 'defdate', 'ctimestamp'],
							},
						},
						default: '=',
						required: true,
						description: 'Der Vergleichsoperator für die Suche',
					},
					{
						displayName: 'Wert',
						name: 'searchValue',
						type: 'string',
						default: 'Suchbegriff eingeben',
						displayOptions: {
							hide: {
								classifyAttribut: ['docart', 'folder', 'status'],
							},
						},
						description: 'Der Wert, nach dem gesucht werden soll',
					},
					{
						displayName: 'Wert',
						name: 'searchValue',
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
						displayName: 'Wert',
						name: 'searchValue',
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
						displayName: 'Wert',
						name: 'searchValue',
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
		description: 'Name der binären Eigenschaft, in der die heruntergeladenen Dokumente gespeichert werden',
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