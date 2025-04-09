import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';

/**
 * Behandelt alle Classification-Operationen für ecoDMS
 */
export async function handleClassificationOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[] | IDataObject> {
	switch (operation) {
		case Operation.GetClassifyAttributes:
			return await handleGetClassifyAttributes.call(this, credentials);
		case Operation.GetClassifyAttributesDetail:
			return await handleGetClassifyAttributesDetail.call(this, credentials);
		case Operation.CreateNewClassify:
			return await handleCreateNewClassify.call(this, items, credentials);
		case Operation.ClassifyInboxDocument:
			return await handleClassifyInboxDocument.call(this, items, credentials);
		case Operation.ClassifyDocument:
			return await handleClassifyDocument.call(this, items, credentials);
		case Operation.RemoveDocumentLink:
			return await handleRemoveDocumentLink.call(this, credentials);
		case Operation.LinkToDocuments:
			return await handleLinkToDocuments.call(this, credentials);
		default:
			throw new NodeOperationError(this.getNode(), `Die Operation "${operation}" wird nicht unterstützt!`);
	}
}

/**
 * Verfügbare Klassifikationsattribute für ein Dokument abrufen
 */
async function handleGetClassifyAttributes(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject> {
	try {
		return await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/classifyAttributes`,
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
			`Fehler beim Abrufen der Klassifikationsattribute: ${error.message}`,
		);
	}
}

/**
 * Detaillierte Klassifikationsattribute für ein Dokument abrufen
 */
async function handleGetClassifyAttributesDetail(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject> {
	try {
		return await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/classifyAttributes/detailInformation`,
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
			`Fehler beim Abrufen der detaillierten Klassifikationsattribute: ${error.message}`,
		);
	}
}

/**
 * Eine neue Klassifikation für ein bestehendes Dokument erstellen
 */
async function handleCreateNewClassify(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<IDataObject> {
	try {
		const docId = this.getNodeParameter('docId', 0) as number;
		const fields = this.getNodeParameter('fields', 0) as string;
		
		let fieldsData: IDataObject;
		try {
			fieldsData = JSON.parse(fields);
		} catch (e) {
			throw new NodeOperationError(this.getNode(), 'Ungültiges JSON-Format für Klassifikationsfelder!');
		}
		
		return await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/createNewClassify/${docId}`,
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: fieldsData,
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Fehler beim Erstellen der neuen Klassifikation: ${error.message}`,
		);
	}
}

/**
 * Ein Dokument aus dem Inbox-Bereich klassifizieren
 */
async function handleClassifyInboxDocument(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<IDataObject> {
	try {
		const docId = this.getNodeParameter('docId', 0) as number;
		const fields = this.getNodeParameter('fields', 0) as string;
		
		let fieldsData: IDataObject;
		try {
			fieldsData = JSON.parse(fields);
		} catch (e) {
			throw new NodeOperationError(this.getNode(), 'Ungültiges JSON-Format für Klassifikationsfelder!');
		}
		
		return await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/classifyInboxDocument/${docId}`,
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: fieldsData,
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Fehler beim Klassifizieren des Inbox-Dokuments: ${error.message}`,
		);
	}
}

/**
 * Eine bestehende Dokumentklassifikation aktualisieren
 */
async function handleClassifyDocument(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<IDataObject> {
	try {
		const docId = this.getNodeParameter('docId', 0) as number;
		const clDocId = this.getNodeParameter('clDocId', 0) as number;
		const classifyAttributes = this.getNodeParameter('classifyAttributes', 0) as string;
		const editRoles = this.getNodeParameter('editRoles', 0, '') as string;
		const readRoles = this.getNodeParameter('readRoles', 0, '') as string;
		
		let classifyData: IDataObject;
		try {
			classifyData = JSON.parse(classifyAttributes);
		} catch (e) {
			throw new NodeOperationError(this.getNode(), 'Ungültiges JSON-Format für Klassifikationsattribute!');
		}
		
		const requestBody: IDataObject = {
			classifyAttributes: classifyData,
		};
		
		if (editRoles) {
			requestBody.editRoles = editRoles.split(',').map(role => role.trim());
		}
		
		if (readRoles) {
			requestBody.readRoles = readRoles.split(',').map(role => role.trim());
		}
		
		return await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/classifyDocument/${docId}/${clDocId}`,
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
			`Fehler beim Aktualisieren der Dokumentklassifikation: ${error.message}`,
		);
	}
}

/**
 * Verknüpfungen zwischen Dokumentklassifikationen entfernen
 */
async function handleRemoveDocumentLink(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject> {
	try {
		const clDocId = this.getNodeParameter('clDocId', 0) as number;
		
		return await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/removeDocumentLink/${clDocId}`,
			method: 'DELETE',
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
			`Fehler beim Entfernen der Dokumentverknüpfungen: ${error.message}`,
		);
	}
}

/**
 * Verknüpfungen zwischen Dokumentklassifikationen hinzufügen
 */
async function handleLinkToDocuments(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<IDataObject> {
	try {
		const clDocId = this.getNodeParameter('clDocId', 0) as number;
		
		// Hier würden wir Daten zu den zu verknüpfenden Dokumenten benötigen
		// Dies scheint in der Ressourcendatei zu fehlen und müsste ergänzt werden
		const linkedDocuments: number[] = [];
		
		return await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/linkToDocuments/${clDocId}`,
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: {
				linkedDocuments,
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
			`Fehler beim Hinzufügen der Dokumentverknüpfungen: ${error.message}`,
		);
	}
} 