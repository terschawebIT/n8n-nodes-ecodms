import {
	type IExecuteFunctions,
	type ILoadOptionsFunctions,
	type INodeExecutionData,
	type INodeListSearchResult,
	type INodePropertyOptions,
	type INodeType,
	type INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { handleArchiveOperations } from './handlers/archiveHandler';
import { handleClassificationOperations } from './handlers/classificationHandler';
import { handleDocumentOperations } from './handlers/documentHandler';
import { handleDocumentTypeOperations } from './handlers/documentTypeHandler';
import { handleFolderOperations } from './handlers/folderHandler';
import { handleLicenseOperations } from './handlers/licenseHandler';
import { handleSearchOperations } from './handlers/searchHandler';
import { archiveFields, archiveOperations } from './resources/archive';
import { classificationFields, classificationOperations } from './resources/classification';
import { documentFields, documentOperations } from './resources/document';
import { documentTypeFields, documentTypeOperations } from './resources/documentType';
import { folderFields, folderOperations } from './resources/folder';
import { licenseFields, licenseOperations } from './resources/license';
import { searchFields, searchOperations } from './resources/search';
import { Resource } from './utils/constants';
import { createNodeError } from './utils/errorHandler';
import {
	getClassificationAttributes,
	getComboBoxOptions,
	getCustomFieldType,
	getCustomFields,
	getDocumentTypes,
	getFolders,
	getGroups,
	getStatusValues,
	getTypeClassifications,
	getUsers,
	searchClassificationAttributes,
} from './utils/helpers';

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
		inputs: [{ type: NodeConnectionType.Main }],
		outputs: [{ type: NodeConnectionType.Main }],
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
						name: 'Dokumenttyp',
						value: Resource.DocumentType,
						description: 'Dokumenttypen verwalten',
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
				],
				default: Resource.Document,
				required: true,
			},

			// Operations für die verschiedenen Ressourcentypen
			documentOperations,
			classificationOperations,
			documentTypeOperations,
			archiveOperations,
			searchOperations,
			folderOperations,
			licenseOperations,

			// Parameter für die Ressourcentypen
			...documentFields,
			...classificationFields,
			...documentTypeFields,
			...archiveFields,
			...searchFields,
			...folderFields,
			...licenseFields,
		],
	};

	// Methoden für dynamische Optionen in Dropdown-Menüs
	methods = {
		loadOptions: {
			async getFolders(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await getFolders.call(this);
			},

			async getDocumentTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await getDocumentTypes.call(this);
			},

			async getStatusValues(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await getStatusValues.call(this);
			},

			async getClassificationAttributes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await getClassificationAttributes.call(this);
			},

			async getTypeClassifications(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await getTypeClassifications.call(this);
			},

			async getCustomFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await getCustomFields.call(this);
			},

			async getCustomFieldType(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await getCustomFieldType.call(this);
			},

			async getComboBoxOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await getComboBoxOptions.call(this);
			},

			async getUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await getUsers.call(this);
			},

			async getGroups(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await getGroups.call(this);
			},
		},

		listSearch: {
			async searchDocumentTypes(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const options = await getDocumentTypes.call(this);
				const filteredOptions = filter
					? options.filter((option) => option.name.toLowerCase().includes(filter.toLowerCase()))
					: options;

				return {
					results: filteredOptions.map((option) => ({
						name: option.name,
						value: option.value,
						url: '',
					})),
				};
			},

			async searchFolders(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const options = await getFolders.call(this);
				const filteredOptions = filter
					? options.filter((option) => option.name.toLowerCase().includes(filter.toLowerCase()))
					: options;

				return {
					results: filteredOptions.map((option) => ({
						name: option.name,
						value: option.value,
						url: '',
					})),
				};
			},

			async searchStatusValues(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const options = await getStatusValues.call(this);
				const filteredOptions = filter
					? options.filter((option) => option.name.toLowerCase().includes(filter.toLowerCase()))
					: options;

				return {
					results: filteredOptions.map((option) => ({
						name: option.name,
						value: option.value,
						url: '',
					})),
				};
			},

			async searchUsers(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				const options = await getUsers.call(this);
				const filteredOptions = filter
					? options.filter((option) => option.name.toLowerCase().includes(filter.toLowerCase()))
					: options;

				return {
					results: filteredOptions.map((option) => ({
						name: option.name,
						value: option.value,
						url: '',
					})),
				};
			},

			async searchGroups(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const options = await getGroups.call(this);
				const filteredOptions = filter
					? options.filter((option) => option.name.toLowerCase().includes(filter.toLowerCase()))
					: options;

				return {
					results: filteredOptions.map((option) => ({
						name: option.name,
						value: option.value,
						url: '',
					})),
				};
			},

			async searchCustomFields(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const options = await getCustomFields.call(this);
				const filteredOptions = filter
					? options.filter((option) => option.name.toLowerCase().includes(filter.toLowerCase()))
					: options;

				return {
					results: filteredOptions.map((option) => ({
						name: option.name,
						value: option.value,
						url: '',
					})),
				};
			},

			async searchClassificationAttributes(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const options = await searchClassificationAttributes.call(this);
				const filteredOptions = filter
					? options.filter((option) => option.name.toLowerCase().includes(filter.toLowerCase()))
					: options;

				return {
					results: filteredOptions.map((option) => ({
						name: option.name,
						value: option.value,
						url: '',
					})),
				};
			},


		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let responseData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Prüfe und hole Anmeldedaten
		const credentials = await this.getCredentials('ecoDmsApi');
		if (!credentials.serverUrl) {
			throw new NodeOperationError(
				this.getNode(),
				'Server-URL ist nicht konfiguriert. Bitte in den Anmeldedaten angeben.',
			);
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
				case Resource.DocumentType:
					responseData = await handleDocumentTypeOperations.call(this, items, operation, credentials);
					break;
				default:
					throw new NodeOperationError(
						this.getNode(),
						`Die Ressource "${resource}" wird nicht unterstützt!`,
					);
			}
		} catch (error: unknown) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			throw createNodeError(this.getNode(), 'Fehler bei der Verarbeitung', error);
		}

		return [responseData];
	}
}
