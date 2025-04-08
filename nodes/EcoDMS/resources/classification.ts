import { INodeProperties } from 'n8n-workflow';
import { Resource, Operation } from '../utils/constants';

export const classificationOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	displayOptions: {
		show: {
			resource: [Resource.Classification],
		},
	},
	options: [
		{
			name: 'Klassifikationsattribute abrufen',
			value: Operation.GetClassifyAttributes,
			description: 'Verfügbare Klassifikationsattribute für ein Dokument abrufen',
			action: 'Klassifikationsattribute abrufen',
		},
		{
			name: 'Detaillierte Klassifikationsattribute abrufen',
			value: Operation.GetClassifyAttributesDetail,
			description: 'Detaillierte Klassifikationsattribute für ein Dokument abrufen',
			action: 'Detaillierte Klassifikationsattribute abrufen',
		},
		{
			name: 'Neue Klassifikation erstellen',
			value: Operation.CreateNewClassify,
			description: 'Eine neue Klassifikation für ein bestehendes Dokument erstellen',
			action: 'Neue Klassifikation erstellen',
		},
		{
			name: 'Inbox-Dokument klassifizieren',
			value: Operation.ClassifyInboxDocument,
			description: 'Ein Dokument aus dem Inbox-Bereich klassifizieren',
			action: 'Inbox-Dokument klassifizieren',
		},
		{
			name: 'Dokument-Klassifikation aktualisieren',
			value: Operation.ClassifyDocument,
			description: 'Eine bestehende Dokumentklassifikation aktualisieren. Vorgehensweise:\n1. Ermittle docId und clDocId mit "Dokumentinformationen abrufen"\n2. Ermittle verfügbare Klassifikationsattribute mit "Klassifikationsattribute abrufen"\n3. Aktualisiere die gewünschten Attribute\n\nBeispielantwort: Klassifikations-ID, die aktualisiert wurde.',
			action: 'Dokument-Klassifikation aktualisieren',
		},
		{
			name: 'Dokumentverknüpfungen entfernen',
			value: Operation.RemoveDocumentLink,
			description: 'Verknüpfungen zwischen Dokumentklassifikationen entfernen',
			action: 'Dokumentverknüpfungen entfernen',
		},
		{
			name: 'Dokumente verknüpfen',
			value: Operation.LinkToDocuments,
			description: 'Verknüpfungen zwischen Dokumentklassifikationen hinzufügen',
			action: 'Dokumente verknüpfen',
		},
	],
	default: Operation.GetClassifyAttributes,
	noDataExpression: true,
	required: true,
};

export const classificationFields: INodeProperties[] = [
	// Parameter für Klassifikations-Operationen
	{
		displayName: 'Dokument-ID',
		name: 'docId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Classification],
				operation: [Operation.CreateNewClassify],
			},
		},
		description: 'Die ID des Dokuments, für das eine neue Klassifikation erstellt werden soll',
	},
	{
		displayName: 'Dokument-ID',
		name: 'docId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Classification],
				operation: [Operation.ClassifyInboxDocument],
			},
		},
		description: 'Die ID des Inbox-Dokuments, das klassifiziert werden soll',
	},
	{
		displayName: 'Klassifikations-ID',
		name: 'clDocId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Classification],
				operation: [Operation.ClassifyDocument],
			},
		},
		description: 'Die ID der Dokumentklassifikation, die aktualisiert werden soll',
	},
	{
		displayName: 'Dokument-ID',
		name: 'docId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Classification],
				operation: [Operation.ClassifyDocument],
			},
		},
		description: 'Die ID des Dokuments, dessen Klassifikation aktualisiert werden soll',
	},
	{
		displayName: 'Klassifikationsattribute',
		name: 'classifyAttributes',
		type: 'json',
		default: '{\n  "docart": "1",\n  "revision": "1.0",\n  "bemerkung": "Aktualisierte Klassifikation",\n  "folder": "1.4",\n  "status": "1"\n}',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Classification],
				operation: [Operation.ClassifyDocument],
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
				resource: [Resource.Classification],
				operation: [Operation.ClassifyDocument],
			},
		},
		description: 'Kommagetrennte Liste von Rollen, die das Dokument bearbeiten dürfen (z.B. "r_ecodms,Elite")',
	},
	{
		displayName: 'Leserollen',
		name: 'readRoles',
		type: 'string',
		default: '',
		required: false,
		displayOptions: {
			show: {
				resource: [Resource.Classification],
				operation: [Operation.ClassifyDocument],
			},
		},
		description: 'Kommagetrennte Liste von Rollen, die das Dokument lesen dürfen (z.B. "ecoSIMSUSER,Gast")',
	},
	{
		displayName: 'Klassifikations-ID',
		name: 'clDocId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Classification],
				operation: [Operation.RemoveDocumentLink, Operation.LinkToDocuments],
			},
		},
		description: 'Die ID der Dokumentklassifikation, für die Links entfernt oder hinzugefügt werden sollen',
	},
	{
		displayName: 'Felder',
		name: 'fields',
		type: 'json',
		default: '{}',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Classification],
				operation: [Operation.CreateNewClassify, Operation.ClassifyInboxDocument, Operation.ClassifyDocument],
			},
		},
		description: 'Die Klassifikationsfelder im JSON-Format',
	},
]; 