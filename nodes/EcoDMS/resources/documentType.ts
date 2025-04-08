import { INodeProperties } from 'n8n-workflow';
import { Resource, Operation } from '../utils/constants';

export const documentTypeOperations: INodeProperties = {
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
			description: 'Liste aller Dokumenttypen abrufen',
			action: 'Liste aller Dokumenttypen abrufen',
		},
	],
	default: Operation.GetTypes,
	noDataExpression: true,
	required: true,
};

export const documentTypeFields: INodeProperties[] = [
	// Parameter für Dokumenttypen abrufen
	// Hier keine speziellen Parameter nötig - der Endpunkt benötigt keine zusätzlichen Parameter
]; 