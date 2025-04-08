import {
	BINARY_ENCODING,
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IRequestOptions,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

import { Resource, Operation } from './utils/constants';
import { documentOperations, documentFields } from './resources/document';
import { classificationOperations, classificationFields } from './resources/classification';
import { archiveOperations, archiveFields } from './resources/archive';
import { searchOperations, searchFields } from './resources/search';
import { folderOperations, folderFields } from './resources/folder';
import { licenseOperations, licenseFields } from './resources/license';
import { workflowOperations, workflowFields } from './resources/workflow';
import { getFolders, getDocumentTypes, getStatusValues } from './utils/helpers';
import { handleDocumentOperations } from './handlers/documentHandler';
import { handleSearchOperations } from './handlers/searchHandler';
import { handleClassificationOperations } from './handlers/classificationHandler';
import { handleArchiveOperations } from './handlers/archiveHandler';
import { handleFolderOperations } from './handlers/folderHandler';
import { handleLicenseOperations } from './handlers/licenseHandler';
import { handleWorkflowOperations } from './handlers/workflowHandler';

export { Resource, Operation };

export class EcoDMS implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ecoDMS',
		name: 'ecoDMS',
		icon: 'file:ecoDms.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'ecoDMS-Integration für n8n',
		defaults: {
			name: 'ecoDMS',
		},
		inputs: [{type: NodeConnectionType.Main}],
		outputs: [{type: NodeConnectionType.Main}],
		credentials: [
			{
				name: 'ecoDmsApi',
				required: true,
			},
		],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Archiv',
						value: Resource.Archive,
						description: 'Archiv verwalten',
					},
					{
						name: 'Dokument',
						value: Resource.Document,
						description: 'Dokumente verwalten',
					},
					{
						name: 'Klassifikation',
						value: Resource.Classification,
						description: 'Dokumente klassifizieren',
					},
					{
						name: 'Suche',
						value: Resource.Search,
						description: 'Nach Dokumenten suchen',
					},
					{
						name: 'Ordner',
						value: Resource.Folder,
						description: 'Ordner verwalten',
					},
					{
						name: 'Lizenz',
						value: Resource.License,
						description: 'Lizenzinformationen abrufen',
					},
					{
						name: 'Workflow',
						value: Resource.Workflow,
						description: 'Kombinierte Operationen für vereinfachte Workflows',
					},
				],
				default: Resource.Document,
				required: true,
			},
			
			// Operations für die verschiedenen Ressourcentypen
			documentOperations,
			classificationOperations,
			archiveOperations,
			searchOperations,
			folderOperations,
			licenseOperations,
			workflowOperations,
			
			// Parameter für die Ressourcentypen
			...documentFields,
			...classificationFields,
			...archiveFields,
			...searchFields,
			...folderFields,
			...licenseFields,
			...workflowFields,
		],
	};

	// Methoden für dynamische Optionen in Dropdown-Menüs
	methods = {
		loadOptions: {
			// Methoden für dynamische Optionen in Dropdown-Menüs
			async getFolders(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await getFolders.call(this);
			},
			
			async getDocumentTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await getDocumentTypes.call(this);
			},
			
			async getStatusValues(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await getStatusValues.call(this);
			}
		}
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let responseData: any;
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Prüfe und hole Anmeldedaten
		const credentials = await this.getCredentials('ecoDmsApi');
		if (!credentials.serverUrl) {
			throw new NodeOperationError(this.getNode(), 'Server-URL ist nicht konfiguriert. Bitte in den Anmeldedaten angeben.');
		}

		// An die entsprechenden Resource-Handler delegieren
		try {
			switch (resource) {
				case Resource.Archive:
					responseData = await handleArchiveOperations.call(this, items, operation, credentials);
					break;
				case Resource.Document:
					responseData = await handleDocumentOperations.call(this, items, operation, credentials);
					break;
				case Resource.Classification:
					responseData = await handleClassificationOperations.call(this, items, operation, credentials);
					break;
				case Resource.Search:
					responseData = await handleSearchOperations.call(this, items, operation, credentials);
					break;
				case Resource.Folder:
					responseData = await handleFolderOperations.call(this, items, operation, credentials);
					break;
				case Resource.License:
					responseData = await handleLicenseOperations.call(this, items, operation, credentials);
					break;
				case Resource.Workflow:
					responseData = await handleWorkflowOperations.call(this, items, operation, credentials);
					break;
				default:
					throw new NodeOperationError(this.getNode(), `Die Ressource "${resource}" wird nicht unterstützt!`);
			}
		} catch (error) {
			if (error.constructor.name === 'NodeOperationError') {
				throw error;
			}
			throw new NodeOperationError(this.getNode(), `Fehler bei der Verarbeitung: ${error.message}`);
		}

		// Antwortdaten verarbeiten und zurückgeben
		return this.processResponseData(responseData);
	}

	// Helper-Methode, um die Antwortdaten zu verarbeiten
	private processResponseData(responseData: any): INodeExecutionData[][] {
		const returnData: INodeExecutionData[] = [];
		
		if (Array.isArray(responseData)) {
			// Direkt zurückgeben, wenn es sich um ein Array von Nodes handelt
			if (responseData.length > 0 && responseData[0].binary !== undefined) {
				return [responseData];
			}
			
			// Ansonsten jedes Element konvertieren und hinzufügen
			for (const item of responseData) {
				if (item.json !== undefined) {
					returnData.push(item as INodeExecutionData);
				} else {
					returnData.push({ json: item });
				}
			}
		} else if (responseData !== undefined) {
			// Einzelobjekt in Array umwandeln
			returnData.push({ json: responseData });
		}

		return [returnData];
	}
} 