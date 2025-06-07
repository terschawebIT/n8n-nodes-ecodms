import type { INodeProperties } from 'n8n-workflow';
import { Operation, Resource } from '../utils/constants';

export const folderOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	displayOptions: {
		show: {
			resource: [Resource.Folder],
		},
	},
	options: [
		{
			name: 'Ordner bearbeiten',
			value: Operation.EditFolder,
			description: 'Einen bestehenden Ordner bearbeiten',
			action: 'Einen Ordner bearbeiten',
		},
		{
			name: 'Ordner erstellen',
			value: Operation.CreateFolder,
			description: 'Einen neuen Ordner erstellen',
			action: 'Einen Ordner erstellen',
		},
		{
			name: 'Unterordner erstellen',
			value: Operation.CreateSubfolder,
			description: 'Einen neuen Unterordner erstellen',
			action: 'Einen Unterordner erstellen',
		},
		{
			name: 'Ordner abrufen',
			value: Operation.GetFolders,
			description: 'Alle verfügbaren Ordner abrufen',
			action: 'Ordner abrufen',
		},
	],
	default: Operation.GetFolders,
	noDataExpression: true,
	required: true,
};

export const folderFields: INodeProperties[] = [
	// Ordner bearbeiten
	{
		displayName: 'Ordner-ID',
		name: 'folderId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Folder],
				operation: [Operation.EditFolder],
			},
		},
		description: 'ID des Ordners, der bearbeitet werden soll',
	},
	{
		displayName: 'Ordnername',
		name: 'folderName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Folder],
				operation: [Operation.EditFolder],
			},
		},
		description: 'Neuer Name des Ordners',
	},
	{
		displayName: 'Zusätzliche Felder',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Feld hinzufügen',
		default: {},
		displayOptions: {
			show: {
				resource: [Resource.Folder],
				operation: [Operation.EditFolder],
			},
		},
		options: [
			{
				displayName: 'Externer Schlüssel',
				name: 'externalKey',
				type: 'string',
				default: '',
				description: 'Externer Schlüssel für den Ordner',
			},
			{
				displayName: 'Schlagwörter',
				name: 'buzzwords',
				type: 'string',
				default: '',
				description: 'Schlagwörter für den Ordner',
			},
			{
				displayName: 'Datensatz-String',
				name: 'dataString',
				type: 'string',
				default: '',
				description: 'Interner Datensatz-String für den Ordner (nur bei Bedarf anpassen)',
			},
		],
	},

	// Ordner erstellen
	{
		displayName: 'Ordnername',
		name: 'foldername',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Folder],
				operation: [Operation.CreateFolder],
			},
		},
		default: '',
		description: 'Name des neuen Ordners',
	},
	{
		displayName: 'Ordnerbeschreibung',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: [Resource.Folder],
				operation: [Operation.CreateFolder],
			},
		},
		default: '',
		description: 'Beschreibung des neuen Ordners',
	},

	// Unterordner erstellen
	{
		displayName: 'Übergeordneter Ordner auswählen',
		name: 'parentFolderSelection',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Folder],
				operation: [Operation.CreateSubfolder],
			},
		},
		options: [
			{
				name: 'ID manuell eingeben',
				value: 'manual',
				description: 'Ordner-ID direkt eingeben',
			},
			{
				name: 'Aus Liste auswählen',
				value: 'dropdown',
				description: 'Ordner aus einer Liste auswählen',
			},
		],
		default: 'dropdown',
		description: 'Wählen Sie, wie Sie den übergeordneten Ordner auswählen möchten',
	},
	{
		displayName: 'Übergeordneter Ordner-ID',
		name: 'parentFolderId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Folder],
				operation: [Operation.CreateSubfolder],
				parentFolderSelection: ['manual'],
			},
		},
		default: '',
		description: 'ID des übergeordneten Ordners, in dem der Unterordner erstellt werden soll',
	},
	{
		displayName: 'Übergeordneter Ordner',
		name: 'parentFolderDropdown',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getFolders',
		},
		displayOptions: {
			show: {
				resource: [Resource.Folder],
				operation: [Operation.CreateSubfolder],
				parentFolderSelection: ['dropdown'],
			},
		},
		default: '',
		description: 'Übergeordneter Ordner aus der Liste auswählen',
	},
	{
		displayName: 'Ordnername',
		name: 'foldername',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Folder],
				operation: [Operation.CreateSubfolder],
			},
		},
		default: '',
		description: 'Name des neuen Unterordners',
	},
	{
		displayName: 'Ordnerbeschreibung',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: [Resource.Folder],
				operation: [Operation.CreateSubfolder],
			},
		},
		default: '',
		description: 'Beschreibung des neuen Unterordners',
	},
];
