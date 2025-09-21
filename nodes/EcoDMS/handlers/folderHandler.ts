import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';
import { createNodeError } from '../utils/errorHandler';
import { getBaseUrl } from '../utils/helpers';

interface FolderResponse extends IDataObject {
	success?: boolean;
	message?: string;
	data?: IDataObject;
}

/**
 * Behandelt alle Folder-Operationen für ecoDMS
 */
export async function handleFolderOperations(
	this: IExecuteFunctions,
	_items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	let result: FolderResponse | INodeExecutionData[];

	switch (operation) {
		case Operation.GetFolders:
			result = await handleGetFolders.call(this, credentials);
			break;
		case Operation.CreateFolder:
			result = await handleCreateFolder.call(this, credentials);
			break;
		case Operation.CreateSubfolder:
			result = await handleCreateSubfolder.call(this, credentials);
			break;
		case Operation.EditFolder:
			result = await handleEditFolder.call(this, credentials);
			break;
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Die Operation "${operation}" wird nicht unterstützt!`,
			);
	}

	// Stelle sicher, dass wir immer ein Array von INodeExecutionData zurückgeben
	return Array.isArray(result) ? result : [{ json: result }];
}

/**
 * Einen bestehenden Ordner bearbeiten
 */
async function handleEditFolder(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<FolderResponse> {
	const folderId = this.getNodeParameter('folderId', 0) as string;
	const folderName = this.getNodeParameter('folderName', 0) as string;
	const url = await getBaseUrl.call(this, 'editFolder');

	try {
		const response = await this.helpers.httpRequest({
			url,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: {
				oId: folderId,
				foldername: folderName,
			},
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});

		return {
			success: true,
			data: response,
		};
	} catch (error: unknown) {
		throw createNodeError(this.getNode(), 'Fehler beim Bearbeiten des Ordners', error);
	}
}

/**
 * Einen neuen Ordner erstellen
 */
async function handleCreateFolder(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<FolderResponse> {
	const folderName = this.getNodeParameter('foldername', 0) as string;
	const url = await getBaseUrl.call(this, 'createFolder');

	try {
		const response = await this.helpers.httpRequest({
			url,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: {
				mainFolder: true,
				foldername: folderName,
			},
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});

		return {
			success: true,
			data: response,
		};
	} catch (error: unknown) {
		throw createNodeError(this.getNode(), 'Fehler beim Erstellen des Ordners', error);
	}
}

/**
 * Einen neuen Unterordner erstellen
 */
async function handleCreateSubfolder(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<FolderResponse> {
	const parentFolderSelection = this.getNodeParameter('parentFolderSelection', 0) as string;
	let parentFolderId: string;

	// Je nach Auswahl des Benutzers die richtige Ordner-ID ermitteln
	if (parentFolderSelection === 'manual') {
		parentFolderId = this.getNodeParameter('parentFolderId', 0) as string;
	} else {
		parentFolderId = this.getNodeParameter('parentFolderDropdown', 0) as string;
	}

	const folderName = this.getNodeParameter('foldername', 0) as string;
	const url = await getBaseUrl.call(this, `createFolder/parent/${parentFolderId}`);

	try {
		const response = await this.helpers.httpRequest({
			url,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: {
				mainFolder: false,
				foldername: folderName,
			},
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});

		return {
			success: true,
			data: response,
		};
	} catch (error: unknown) {
		throw createNodeError(this.getNode(), 'Fehler beim Erstellen des Unterordners', error);
	}
}

/**
 * Alle verfügbaren Ordner abrufen
 */
async function handleGetFolders(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<FolderResponse> {
	const url = await getBaseUrl.call(this, 'folders');

	try {
		const response = await this.helpers.httpRequest({
			url,
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});

		return {
			success: true,
			data: response,
		};
	} catch (error: unknown) {
		throw createNodeError(this.getNode(), 'Fehler beim Abrufen der Ordner', error);
	}
}
