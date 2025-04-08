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
			description: 'Einfache Suche nach Dokumenten',
			action: 'Einfache Suche durchführen',
		},
		{
			name: 'Erweiterte Suche',
			value: Operation.AdvancedSearch,
			description: 'Erweiterte Suche mit mehreren Kriterien',
			action: 'Erweiterte Suche durchführen',
		},
		{
			name: 'Erweiterte Suche V2',
			value: Operation.AdvancedSearchExtv2,
			description: 'Erweiterte Suche mit komplexen Kriterien und Sortierung',
			action: 'Erweiterte Suche V2 durchführen',
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
				operation: [Operation.Search],
			},
		},
		options: [
			{
				name: 'filters',
				displayName: 'Filter',
				values: [
					// Operator für einfache Suche - Textattribute
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
								resource: [Resource.Search],
								operation: [Operation.Search],
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
								resource: [Resource.Search],
								operation: [Operation.Search],
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
								resource: [Resource.Search],
								operation: [Operation.Search],
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
						default: ' ',
						displayOptions: {
							show: {
								resource: [Resource.Search],
								operation: [Operation.Search],
							},
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
								resource: [Resource.Search],
								operation: [Operation.Search],
								classifyAttribut: ['docart'],
							},
						},
						default: 'auto',
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
								resource: [Resource.Search],
								operation: [Operation.Search],
								classifyAttribut: ['folder'],
							},
						},
						default: 'auto',
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
								resource: [Resource.Search],
								operation: [Operation.Search],
								classifyAttribut: ['status'],
							},
						},
						default: 'auto',
						description: 'Der Status, nach dem gesucht werden soll',
					},
				],
			},
		],
		description: 'Filter für die Suche. Mehrere Filter werden mit UND verknüpft.',
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
							{ name: 'Ordner', value: 'folder' },
							{ name: 'Nur in diesem Ordner', value: 'folderonly' },
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
							{ name: 'Größer als (>)', value: '>' },
							{ name: 'Größer oder gleich (>=)', value: '>=' },
							{ name: 'Kleiner als (<)', value: '<' },
							{ name: 'Kleiner oder gleich (<=)', value: '<=' },
						],
						displayOptions: {
							show: {
								resource: [Resource.Search],
								operation: [Operation.AdvancedSearch],
								classifyAttribut: ['bemerkung', 'changeid', 'docid', 'revision', 'ctimestamp'],
							},
						},
						default: '=',
						required: true,
						description: 'Der Vergleichsoperator für die Suche',
					},
					// Operator für erweiterte Suche - Dropdown/Festwerte
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
								resource: [Resource.Search],
								operation: [Operation.AdvancedSearch],
								classifyAttribut: ['docart', 'folder', 'folderonly', 'status', 'mainfolder', 'mainfolderonly'],
							},
						},
						default: '=',
						required: true,
						description: 'Der Vergleichsoperator für die Suche',
					},
					// Operator für erweiterte Suche - Datumsfelder
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
								resource: [Resource.Search],
								operation: [Operation.AdvancedSearch],
								classifyAttribut: ['defdate', 'cdate'],
							},
						},
						default: '=',
						required: true,
						description: 'Der Vergleichsoperator für die Suche',
					},
					// Operator für erweiterte Suche - Volltext
					{
						displayName: 'Operator',
						name: 'searchOperator',
						type: 'options',
						options: [
							{ name: 'Gleich (=)', value: '=' },
						],
						displayOptions: {
							show: {
								resource: [Resource.Search],
								operation: [Operation.AdvancedSearch],
								classifyAttribut: ['fulltext', 'fulltext-ext'],
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
						default: ' ',
						displayOptions: {
							show: {
								resource: [Resource.Search],
								operation: [Operation.AdvancedSearch],
							},
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
								resource: [Resource.Search],
								operation: [Operation.AdvancedSearch],
								classifyAttribut: ['docart'],
							},
						},
						default: 'auto',
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
								resource: [Resource.Search],
								operation: [Operation.AdvancedSearch],
								classifyAttribut: ['folder'],
							},
						},
						default: 'auto',
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
								resource: [Resource.Search],
								operation: [Operation.AdvancedSearch],
								classifyAttribut: ['status'],
							},
						},
						default: 'auto',
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
				description: 'Nur Dokumente anzeigen, die direkt dem Benutzer zugewiesen sind',
			},
			{
				displayName: 'Gelöschte Dokumente',
				name: 'trashedDocuments',
				type: 'boolean',
				default: false,
				description: 'Nur gelöschte Dokumente anzeigen',
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
				description: 'Maximale Anzahl der zurückgegebenen Dokumente (max. 1000)',
			},
			{
				displayName: 'Berechtigungen anzeigen',
				name: 'readRoles',
				type: 'boolean',
				default: true,
				description: 'Ob Lese- und Schreibberechtigungen für die Dokumente zurückgegeben werden sollen',
			},
		],
	},
	
	// Erweiterte Suche V2
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
						type: 'options',
						options: [
							{ name: 'Bemerkung', value: 'bemerkung' },
							{ name: 'Datum', value: 'cdate' },
							{ name: 'Dokumentart', value: 'docart' },
							{ name: 'Ordner', value: 'folder' },
							{ name: 'Nur in diesem Ordner', value: 'folderonly' },
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
								resource: [Resource.Search],
								operation: [Operation.AdvancedSearchExtv2],
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
								resource: [Resource.Search],
								operation: [Operation.AdvancedSearchExtv2],
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
								resource: [Resource.Search],
								operation: [Operation.AdvancedSearchExtv2],
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
						default: ' ',
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
								resource: [Resource.Search],
								operation: [Operation.AdvancedSearchExtv2],
								classifyAttribut: ['docart'],
							},
						},
						default: 'auto',
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
								resource: [Resource.Search],
								operation: [Operation.AdvancedSearchExtv2],
								classifyAttribut: ['folder'],
							},
						},
						default: 'auto',
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
								resource: [Resource.Search],
								operation: [Operation.AdvancedSearchExtv2],
								classifyAttribut: ['status'],
							},
						},
						default: 'auto',
						description: 'Der Status, nach dem gesucht werden soll',
					},
				],
			},
		],
		description: 'Filter für die Suche. Mehrere Filter werden mit UND verknüpft.',
	},
	
	// Sortierung für erweiterte Suche V2
	{
		displayName: 'Sortierung',
		name: 'sortOrder',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		placeholder: 'Sortierung hinzufügen',
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
				displayName: 'Sortierregel',
				values: [
					{
						displayName: 'Attribut',
						name: 'classifyAttribut',
						type: 'options',
						options: [
							{ name: 'Bemerkung', value: 'bemerkung' },
							{ name: 'Datum', value: 'cdate' },
							{ name: 'Dokumentart', value: 'docart' },
							{ name: 'Revision', value: 'revision' },
							{ name: 'Status', value: 'status' },
							{ name: 'Zeitstempel', value: 'ctimestamp' },
						],
						default: 'ctimestamp',
						description: 'Das Attribut, nach dem sortiert werden soll',
					},
					{
						displayName: 'Richtung',
						name: 'sortDirection',
						type: 'options',
						options: [
							{ name: 'Aufsteigend', value: 'asc' },
							{ name: 'Absteigend', value: 'desc' },
						],
						default: 'desc',
						description: 'Die Sortierrichtung',
					},
				],
			},
		],
		description: 'Sortierung der Ergebnisse. Standard ist absteigend nach Dokument-ID, wenn nicht angegeben.',
	},
	
	// Zusätzliche Parameter für erweiterte Suche V2
	{
		displayName: 'Zusätzliche Optionen',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Optionen hinzufügen',
		default: {},
		displayOptions: {
			show: {
				resource: [Resource.Search],
				operation: [Operation.AdvancedSearchExtv2],
			},
		},
		options: [
			{
				displayName: 'Nur eigene Dokumente',
				name: 'personalDocumentsOnly',
				type: 'boolean',
				default: false,
				description: 'Nur Dokumente anzeigen, die direkt dem Benutzer zugewiesen sind',
			},
			{
				displayName: 'Gelöschte Dokumente',
				name: 'trashedDocuments',
				type: 'boolean',
				default: false,
				description: 'Nur gelöschte Dokumente anzeigen',
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
				description: 'Maximale Anzahl der zurückgegebenen Dokumente (max. 1000)',
			},
			{
				displayName: 'Berechtigungen anzeigen',
				name: 'readRoles',
				type: 'boolean',
				default: true,
				description: 'Ob Lese- und Schreibberechtigungen für die Dokumente zurückgegeben werden sollen',
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
								resource: [Resource.Search],
								operation: [Operation.SearchAndDownload],
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
								resource: [Resource.Search],
								operation: [Operation.SearchAndDownload],
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
								resource: [Resource.Search],
								operation: [Operation.SearchAndDownload],
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
						default: ' ',
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
								resource: [Resource.Search],
								operation: [Operation.SearchAndDownload],
								classifyAttribut: ['docart'],
							},
						},
						default: 'auto',
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
								resource: [Resource.Search],
								operation: [Operation.SearchAndDownload],
								classifyAttribut: ['folder'],
							},
						},
						default: 'auto',
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
								resource: [Resource.Search],
								operation: [Operation.SearchAndDownload],
								classifyAttribut: ['status'],
							},
						},
						default: 'auto',
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
		displayOptions: {
			show: {
				resource: [Resource.Search],
				operation: [Operation.SearchAndDownload],
			},
		},
		description: 'Maximale Anzahl der herunterzuladenden Dokumente (aus Leistungsgründen limitiert)',
	},
]; 