import { INodeProperties } from 'n8n-workflow';
import { Resource, Operation } from '../utils/constants';

export const archiveOperations: INodeProperties = {
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
			name: 'Verbindung herstellen',
			value: Operation.Connect,
			description: 'Verbindung zum Archiv herstellen',
			action: 'Verbindung zum Archiv herstellen',
		},
	],
	default: Operation.Connect,
	noDataExpression: true,
	required: true,
};

export const archiveFields: INodeProperties[] = [
	// Parameter für Archiv-Verbindung
	{
		displayName: 'Archiv-ID',
		name: 'archiveId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Archive],
				operation: [Operation.Connect],
			},
		},
		description: 'ID des Archivs, zu dem eine Verbindung hergestellt werden soll',
	},
	{
		displayName: 'API-Schlüssel',
		name: 'apiKey',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		required: false,
		displayOptions: {
			show: {
				resource: [Resource.Archive],
				operation: [Operation.Connect],
			},
		},
		description: 'Optional: API-Schlüssel für die Verbindung zum Archiv',
	},
]; 