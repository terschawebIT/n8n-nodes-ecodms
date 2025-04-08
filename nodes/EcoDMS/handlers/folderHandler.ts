import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';

/**
 * Behandelt alle Folder-Operationen für ecoDMS
 */
export async function handleFolderOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[] | IDataObject> {
	switch (operation) {
		case Operation.EditFolder:
			return await handleEditFolder.call(this, credentials);
		case Operation.CreateFolder:
			return await handleCreateFolder.call(this, credentials);
		case Operation.CreateSubfolder:
			return await handleCreateSubfolder.call(this, credentials);
		case Operation.GetFolders:
			return await handleGetFolders.call(this, credentials);
		default:
			throw new NodeOperationError(this.getNode(), `Die Operation "${operation}" wird nicht unterstützt!`);
	}
}

/**
 * Einen bestehenden Ordner bearbeiten
 */
async function handleEditFolder(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject> {
	try {
		const folderId = this.getNodeParameter('folderId', 0) as string;
		const folderName = this.getNodeParameter('folderName', 0) as string;
		const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as IDataObject;
		
		const requestBody: IDataObject = {
			folderName,
		};
		
		// Zusätzliche Felder hinzufügen, wenn vorhanden
		if (additionalFields.externalKey) {
			requestBody.externalKey = additionalFields.externalKey;
		}
		
		if (additionalFields.buzzwords) {
			requestBody.buzzwords = additionalFields.buzzwords;
		}
		
		if (additionalFields.dataString) {
			requestBody.dataString = additionalFields.dataString;
		}
		
		return await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/editFolder/${folderId}`,
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: requestBody,
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Fehler beim Bearbeiten des Ordners: ${error.message}`,
		);
	}
}

/**
 * Einen neuen Ordner erstellen
 */
async function handleCreateFolder(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject> {
	try {
		const foldername = this.getNodeParameter('foldername', 0) as string;
		const description = this.getNodeParameter('description', 0, '') as string;
		
		const requestBody: IDataObject = {
			folderName: foldername,
		};
		
		if (description) {
			requestBody.description = description;
		}
		
		return await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/createFolder`,
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: requestBody,
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Fehler beim Erstellen des Ordners: ${error.message}`,
		);
	}
}

/**
 * Einen neuen Unterordner erstellen
 */
async function handleCreateSubfolder(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject> {
	try {
		const parentFolderId = this.getNodeParameter('parentFolderId', 0) as string;
		const foldername = this.getNodeParameter('foldername', 0) as string;
		const description = this.getNodeParameter('description', 0, '') as string;
		
		const requestBody: IDataObject = {
			folderName: foldername,
		};
		
		if (description) {
			requestBody.description = description;
		}
		
		return await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/createSubfolder/${parentFolderId}`,
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: requestBody,
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Fehler beim Erstellen des Unterordners: ${error.message}`,
		);
	}
}

/**
 * Alle verfügbaren Ordner abrufen
 */
async function handleGetFolders(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject> {
	try {
		return await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/getFolders`,
			method: 'GET',
			headers: {
				'Accept': 'application/json',
			},
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Fehler beim Abrufen der Ordner: ${error.message}`,
		);
	}
} 