import { INodeProperties } from 'n8n-workflow';
import { Resource, Operation } from '../utils/constants';

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
		default: '{\n  "docart": "1",\n  "revision": "1.0",\n  "bemerkung": "Automatisch klassifiziert",\n  "folder": "1.4",\n  "status": "1"\n}',
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
		description: 'Name der binären Eigenschaft, in der die heruntergeladenen Dokumente gespeichert werden',
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