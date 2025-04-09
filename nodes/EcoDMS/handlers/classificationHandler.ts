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
		
		// Überprüfe, ob editRoles und readRoles direkt im Input-Item vorhanden sind
		let editRolesFromInput: string[] | undefined;
		let readRolesFromInput: string[] | undefined;
		
		// Versuche, die Daten aus dem ersten Item zu extrahieren
		if (items.length > 0 && items[0].json) {
			const jsonData = items[0].json as IDataObject;
			if (jsonData.editRoles && Array.isArray(jsonData.editRoles)) {
				editRolesFromInput = jsonData.editRoles as string[];
			}
			if (jsonData.readRoles && Array.isArray(jsonData.readRoles)) {
				readRolesFromInput = jsonData.readRoles as string[];
			}
		}
		
		// Fallback zu den Parametern, falls im Input nicht vorhanden
		const editRoles = editRolesFromInput ? 
			editRolesFromInput.join(',') : 
			this.getNodeParameter('editRoles', 0, '') as string;
		
		const readRoles = readRolesFromInput ? 
			readRolesFromInput.join(',') : 
			this.getNodeParameter('readRoles', 0, '') as string;
		
		let classifyData: IDataObject;
		try {
			classifyData = JSON.parse(classifyAttributes);
		} catch (e) {
			throw new NodeOperationError(this.getNode(), 'Ungültiges JSON-Format für Klassifikationsattribute!');
		}
		
		const requestBody: IDataObject = {
			docId,
			clDocId,
			classifyAttributes: classifyData,
		};
		
		if (editRolesFromInput || editRoles) {
			requestBody.editRoles = editRolesFromInput || 
				(editRoles ? editRoles.split(',').map(role => role.trim()) : []);
		} else {
			// Immer editRoles senden, auch wenn leer
			requestBody.editRoles = [];
		}
		
		// Immer readRoles senden, auch wenn leer
		requestBody.readRoles = readRolesFromInput || 
			(readRoles ? readRoles.split(',').map(role => role.trim()) : []);
		
		// Debug-Logging
		console.log('Request URL:', `${credentials.serverUrl as string}/api/classifyDocument`);
		console.log('Request Body:', JSON.stringify(requestBody, null, 2));
		
		// Baue die Server-URL ohne Trailing-Slash
		let serverUrl = credentials.serverUrl as string;
		if (serverUrl.endsWith('/')) {
			serverUrl = serverUrl.slice(0, -1);
		}
		
		try {
			return await this.helpers.httpRequest({
				url: `${serverUrl}/api/classifyDocument`,
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
			if (error.response && error.response.status === 404) {
				console.log('Erster Versuch mit /api/classifyDocument fehlgeschlagen, versuche alternativen Pfad...');
				// Alternative 1: Mit Pfad-Parameter statt Body
				try {
					return await this.helpers.httpRequest({
						url: `${serverUrl}/api/classifyDocument/${docId}/${clDocId}`,
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body: {
							classifyAttributes: classifyData,
							...(editRoles ? { editRoles: requestBody.editRoles } : {}),
							...(readRoles ? { readRoles: requestBody.readRoles } : {}),
						},
						json: true,
						auth: {
							username: credentials.username as string,
							password: credentials.password as string,
						},
					});
				} catch (innerError) {
					// Alternative 2: Mit /v2/ API-Version
					try {
						return await this.helpers.httpRequest({
							url: `${serverUrl}/api/v2/classifyDocument`,
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
					} catch (finalError) {
						// Wenn alles fehlschlägt, wirf den ursprünglichen Fehler
						console.log('Alle API-Pfad-Versuche fehlgeschlagen:', finalError.message);
						throw error;
					}
				}
			}
			throw error;
		}
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