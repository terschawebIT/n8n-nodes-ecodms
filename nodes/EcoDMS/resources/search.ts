import { INodeProperties } from 'n8n-workflow';
import { Resource, Operation } from '../utils/constants';

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
			description: 'Erweiterte Suche mit komplexen Kriterien (Version 2)',
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
		displayName: 'Suchbegriff',
		name: 'searchTerm',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Search],
				operation: [Operation.Search],
			},
		},
		description: 'Begriff, nach dem gesucht werden soll',
	},
	
	// Erweiterte Suche
	{
		displayName: 'Suchparameter',
		name: 'searchParameters',
		type: 'json',
		default: '{\n  "classification": {\n    "docart": "1"\n  },\n  "fulltext": "Rechnung"\n}',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Search],
				operation: [Operation.AdvancedSearch, Operation.AdvancedSearchExtv2],
			},
		},
		description: 'Suchparameter im JSON-Format. Muss "classification" und/oder "fulltext" enthalten.',
	},
	{
		displayName: 'Ergebnislimit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 100,
		required: false,
		displayOptions: {
			show: {
				resource: [Resource.Search],
				operation: [Operation.AdvancedSearch, Operation.AdvancedSearchExtv2, Operation.Search],
			},
		},
		description: 'Maximale Anzahl der zurückgegebenen Ergebnisse',
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
				resource: [Resource.Search],
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
				resource: [Resource.Search],
				operation: [Operation.SearchAndDownload],
			},
		},
		description: 'Name der binären Eigenschaft, in der die heruntergeladenen Dokumente gespeichert werden',
	},
]; 