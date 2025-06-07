import type { INodeProperties } from 'n8n-workflow';
import { Operation, Resource } from '../utils/constants';

export const documentOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	displayOptions: {
		show: {
			resource: [Resource.Document],
		},
	},
	options: [
		{
			name: 'Dokument herunterladen',
			value: Operation.Get,
			description: 'Ein Dokument herunterladen',
			action: 'Ein Dokument herunterladen',
		},
		{
			name: 'Dokument mit Klassifikation herunterladen',
			value: Operation.GetDocumentWithClassification,
			description: 'Ein Dokument mit einer bestimmten Klassifikations-ID herunterladen',
			action: 'Ein Dokument mit Klassifikation herunterladen',
		},
		{
			name: 'Dokumentversion herunterladen',
			value: Operation.GetDocumentVersion,
			description: 'Eine bestimmte Version eines Dokuments herunterladen',
			action: 'Eine Dokumentversion herunterladen',
		},
		{
			name: 'Dokumentinformationen abrufen',
			value: Operation.GetDocumentInfo,
			description: 'Informationen zu einem Dokument abrufen',
			action: 'Dokumentinformationen abrufen',
		},
		{
			name: 'Dokument hochladen',
			value: Operation.Upload,
			description: 'Ein Dokument hochladen',
			action: 'Ein Dokument hochladen',
		},
		{
			name: 'Dokument mit PDF hochladen',
			value: Operation.UploadWithPDF,
			description: 'Ein Dokument mit zugehörigem PDF hochladen',
			action: 'Ein Dokument mit PDF hochladen',
		},
		{
			name: 'PDF in Inbox hochladen',
			value: Operation.UploadToInbox,
			description: 'Eine PDF-Datei in den Inbox-Bereich hochladen',
			action: 'Eine PDF-Datei in den Inbox-Bereich hochladen',
		},
		{
			name: 'Datei hochladen',
			value: Operation.UploadFile,
			description: 'Eine Datei direkt in ecoDMS hochladen',
			action: 'Eine Datei direkt hochladen',
		},
		{
			name: 'Templates für Datei abrufen',
			value: Operation.GetTemplatesForFile,
			description: 'Templates und Klassifikationen für eine Datei abrufen',
			action: 'Templates für eine Datei abrufen',
		},
		{
			name: 'Duplizierungscheck durchführen',
			value: Operation.CheckDuplicates,
			description: 'Prüfen, ob ein Dokument bereits im System vorhanden ist',
			action: 'Duplizierungscheck durchführen',
		},
		{
			name: 'Version mit PDF hinzufügen',
			value: Operation.AddVersionWithPdf,
			description: 'Neue Dokumentversion mit PDF-Datei hinzufügen',
			action: 'Version mit PDF hinzufügen',
		},
		{
			name: 'Version hinzufügen',
			value: Operation.AddVersion,
			description: 'Neue Dokumentversion hinzufügen',
			action: 'Version hinzufügen',
		},
		{
			name: 'Klassifikation mit Template-Erkennung abrufen',
			value: Operation.GetClassificationWithTemplateRecognition,
			description: 'Klassifikation mit automatischer Template-Erkennung abrufen',
			action: 'Klassifikation mit Template-Erkennung abrufen',
		},
	],
	default: Operation.Get,
	noDataExpression: true,
	required: true,
};

export const documentFields: INodeProperties[] = [
	// Parameter für Dokument herunterladen
	{
		displayName: 'Dokument-ID',
		name: 'docId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.Get],
			},
		},
		description: 'ID des Dokuments, das heruntergeladen werden soll',
	},
	{
		displayName: 'Binäre Eigenschaft',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.Get],
			},
		},
		description:
			'Name der binären Eigenschaft, in der die heruntergeladenen Daten gespeichert werden sollen',
	},

	// Parameter für Dokument hochladen
	{
		displayName: 'Binäre Eigenschaft',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.Upload],
			},
		},
		description: 'Name der binären Eigenschaft, die hochgeladen werden soll',
	},
	{
		displayName: 'Versionierung aktivieren',
		name: 'versionControlled',
		type: 'boolean',
		default: false,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.Upload],
			},
		},
		description:
			'Ob das Dokument versioniert werden soll. Bei true können später weitere Versionen hinzugefügt werden.',
	},

	// Parameter für PDF-Dateien hochladen
	{
		displayName: 'PDF-Eigenschaft',
		name: 'pdfProperty',
		type: 'string',
		default: 'pdf',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.UploadWithPDF],
			},
		},
		description: 'Name der binären Eigenschaft, die die PDF-Datei enthält',
	},

	// Parameter für Templates für Datei abrufen
	{
		displayName: 'Binäre Eigenschaft',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.GetTemplatesForFile],
			},
		},
		description: 'Name der binären Eigenschaft, die die zu prüfende Datei enthält',
	},

	// Parameter für Klassifikation mit Template-Erkennung abrufen
	{
		displayName: 'Modus',
		name: 'mode',
		type: 'options',
		options: [
			{
				name: 'Für Datei',
				value: 'file',
			},
			{
				name: 'Für bestehendes Dokument',
				value: 'document',
			},
		],
		default: 'file',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.GetClassificationWithTemplateRecognition],
			},
		},
		description:
			'Ob die Klassifikation für eine Datei oder ein bestehendes Dokument abgerufen werden soll',
	},
	{
		displayName: 'Binäre Eigenschaft',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.GetClassificationWithTemplateRecognition],
				mode: ['file'],
			},
		},
		required: true,
		description: 'Name der binären Eigenschaft, die die zu prüfende Datei enthält',
	},
	{
		displayName: 'Dokument-ID',
		name: 'docId',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.GetClassificationWithTemplateRecognition],
				mode: ['document'],
			},
		},
		required: true,
		description: 'ID des Dokuments, für das die Klassifikationen abgerufen werden sollen',
	},
	{
		displayName: 'Versions-ID',
		name: 'versionId',
		type: 'number',
		default: 1,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.GetClassificationWithTemplateRecognition],
				mode: ['document'],
			},
		},
		required: true,
		description: 'Versionsnummer des Dokuments, für das die Klassifikationen abgerufen werden sollen',
	},

	// Parameter für Duplikate prüfen
	{
		displayName: 'Binärdaten',
		name: 'binary',
		type: 'boolean',
		default: true,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.CheckDuplicates],
			},
		},
		description: 'Die Daten der zu prüfenden Datei liegen als binäre Daten vor',
	},
	{
		displayName: 'Binäre Eigenschaft',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.CheckDuplicates],
				binary: [true],
			},
		},
		description: 'Name der binären Eigenschaft, die die Daten enthält',
	},
	{
		displayName: 'Übereinstimmungswert',
		name: 'maxMatchValue',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 80,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.CheckDuplicates],
			},
		},
		description:
			'Legt fest, wie stark Dokumente übereinstimmen müssen, um als Duplikat erkannt zu werden (1-100). Je niedriger der Wert, desto weniger Übereinstimmungen sind nötig.',
	},

	// Parameter für Version mit PDF hinzufügen
	{
		displayName: 'Dokument-ID',
		name: 'docId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.AddVersionWithPdf],
			},
		},
		default: 0,
		description: 'ID des Dokuments, zu dem eine neue Version hinzugefügt werden soll',
	},
	{
		displayName: 'Version fixieren',
		name: 'fixed',
		type: 'boolean',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.AddVersionWithPdf],
			},
		},
		default: false,
		description:
			'Bei Aktivierung können nach dem Archivieren keine weiteren Versionen zu diesem Dokument hinzugefügt werden',
	},
	{
		displayName: 'Originaldatei',
		name: 'binaryProperty',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.AddVersionWithPdf],
			},
		},
		default: 'data',
		description: 'Name der binären Eigenschaft, die die Originaldatei enthält',
	},
	{
		displayName: 'PDF-Datei',
		name: 'pdfProperty',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.AddVersionWithPdf],
			},
		},
		default: 'pdf',
		description: 'Name der binären Eigenschaft, die die PDF-Datei enthält',
	},

	// Parameter für Version hinzufügen
	{
		displayName: 'Dokument-ID',
		name: 'docId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.AddVersion],
			},
		},
		default: 0,
		description: 'ID des Dokuments, zu dem eine neue Version hinzugefügt werden soll',
	},
	{
		displayName: 'Version fixieren',
		name: 'fixed',
		type: 'boolean',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.AddVersion],
			},
		},
		default: false,
		description:
			'Bei Aktivierung können nach dem Archivieren keine weiteren Versionen zu diesem Dokument hinzugefügt werden',
	},
	{
		displayName: 'Binäre Eigenschaft',
		name: 'binaryProperty',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.AddVersion],
			},
		},
		default: 'data',
		description: 'Name der binären Eigenschaft, die die Datei enthält',
	},

	// Parameter für Dokumentinformationen abrufen
	{
		displayName: 'Dokument-ID',
		name: 'docId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.GetDocumentInfo],
			},
		},
		default: 0,
		description: 'ID des Dokuments, für das Informationen abgerufen werden sollen',
	},

	// Parameter für Dokument mit Klassifikation herunterladen
	{
		displayName: 'Dokument-ID',
		name: 'docId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.GetDocumentWithClassification],
			},
		},
		description: 'ID des Dokuments, das heruntergeladen werden soll',
	},
	{
		displayName: 'Klassifikations-ID',
		name: 'clDocId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.GetDocumentWithClassification],
			},
		},
		description: 'ID der Klassifikation des Dokuments',
	},
	{
		displayName: 'Binäre Eigenschaft',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.GetDocumentWithClassification],
			},
		},
		description:
			'Name der binären Eigenschaft, in der die heruntergeladenen Daten gespeichert werden sollen',
	},

	// Parameter für Dokumentversion herunterladen
	{
		displayName: 'Dokument-ID',
		name: 'docId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.GetDocumentVersion],
			},
		},
		description: 'ID des Dokuments, dessen Version heruntergeladen werden soll',
	},
	{
		displayName: 'Version',
		name: 'version',
		type: 'number',
		default: 1,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.GetDocumentVersion],
			},
		},
		description: 'Versionsnummer des Dokuments, die heruntergeladen werden soll',
	},
	{
		displayName: 'Mit Klassifikation',
		name: 'useClassification',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.GetDocumentVersion],
			},
		},
		description: 'Ob zusätzlich eine Klassifikations-ID verwendet werden soll',
	},
	{
		displayName: 'Klassifikations-ID',
		name: 'clDocId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.GetDocumentVersion],
				useClassification: [true],
			},
		},
		description: 'ID der Klassifikation des Dokuments',
	},
	{
		displayName: 'Binäre Eigenschaft',
		name: 'binaryProperty',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				resource: [Resource.Document],
				operation: [Operation.GetDocumentVersion],
			},
		},
		description:
			'Name der binären Eigenschaft, in der die heruntergeladenen Daten gespeichert werden sollen',
	},
];
