import type { INodeProperties } from 'n8n-workflow';
import { Operation, Resource } from '../utils/constants';

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
		{
			name: 'Dokumenttyp-Klassifikationen abrufen',
			value: Operation.GetTypeClassifications,
			description:
				'Erforderliche und versteckte Klassifikationsattribute für einen Dokumenttyp abrufen',
			action: 'Dokumenttyp-Klassifikationen abrufen',
		},
	],
	default: Operation.GetTypes,
	noDataExpression: true,
	required: true,
};

export const documentTypeFields: INodeProperties[] = [
	// Parameter für Dokumenttypen abrufen
	// Hier keine speziellen Parameter nötig - der Endpunkt benötigt keine zusätzlichen Parameter

	// Parameter für Dokumenttyp-Klassifikationen abrufen
	{
		displayName: 'Dokumenttyp-ID',
		name: 'typeId',
		type: 'string',
		displayOptions: {
			show: {
				resource: [Resource.DocumentType],
				operation: [Operation.GetTypeClassifications],
			},
		},
		default: '',
		required: true,
		description:
			'Eindeutige ID des Dokumenttyps, für den die Klassifikationen abgerufen werden sollen',
	},
];
