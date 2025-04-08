import { INodeProperties } from 'n8n-workflow';
import { Resource, Operation } from '../utils/constants';

export const licenseOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	displayOptions: {
		show: {
			resource: [Resource.License],
		},
	},
	options: [
		{
			name: 'Lizenzinformationen abrufen',
			value: Operation.GetInfo,
			description: 'Informationen über die aktuelle Lizenz abrufen',
			action: 'Lizenzinformationen abrufen',
		},
	],
	default: Operation.GetInfo,
	noDataExpression: true,
	required: true,
};

// Keine weiteren Parameter für die License-Ressource erforderlich
export const licenseFields: INodeProperties[] = []; 