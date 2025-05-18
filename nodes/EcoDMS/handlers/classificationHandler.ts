import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';

interface ClassificationResponse extends IDataObject {
	success?: boolean;
	message?: string;
	data?: IDataObject;
}

/**
 * Behandelt alle Klassifikations-Operationen für ecoDMS
 */
export async function handleClassificationOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	let result: ClassificationResponse;

	switch (operation) {
		case Operation.GetClassifyAttributes:
			result = await handleGetClassifyAttributes.call(this, credentials);
			break;
		case Operation.GetClassifyAttributesDetail:
			result = await handleGetClassifyAttributesDetail.call(this, credentials);
			break;
		case Operation.CreateNewClassify:
			result = await handleCreateNewClassify.call(this, items, credentials);
			break;
		case Operation.ClassifyInboxDocument:
			result = await handleClassifyInboxDocument.call(this, items, credentials);
			break;
		case Operation.ClassifyDocument:
			result = await handleClassifyDocument.call(this, items, credentials);
			break;
		case Operation.RemoveDocumentLink:
			result = await handleRemoveDocumentLink.call(this, credentials);
			break;
		case Operation.LinkToDocuments:
			result = await handleLinkToDocuments.call(this, credentials);
			break;
		default:
			throw new NodeOperationError(this.getNode(), `Die Operation "${operation}" wird nicht unterstützt!`);
	}

	return [{ json: result }];
}

/**
 * Verfügbare Klassifikationsattribute für ein Dokument abrufen
 */
async function handleGetClassifyAttributes(
	this: IExecuteFunctions,
	credentials: IDataObject,
): Promise<ClassificationResponse> {
	try {
		const response = await this.helpers.httpRequest({
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

		return {
			success: true,
			data: response,
		};
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
): Promise<ClassificationResponse> {
	try {
		const response = await this.helpers.httpRequest({
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

		return {
			success: true,
			data: response,
		};
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
): Promise<ClassificationResponse> {
	try {
		const docId = this.getNodeParameter('docId', 0) as number;
		const fields = this.getNodeParameter('fields', 0) as string;
		
		let fieldsData: IDataObject;
		try {
			fieldsData = JSON.parse(fields);
		} catch (error) {
			throw new NodeOperationError(
				this.getNode(),
				`Ungültiges JSON-Format für Klassifikationsfelder: ${error.message}`,
			);
		}
		
		const response = await this.helpers.httpRequest({
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

		return {
			success: true,
			data: response,
		};
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
): Promise<ClassificationResponse> {
	try {
		const docId = this.getNodeParameter('docId', 0) as number;
		const fields = this.getNodeParameter('fields', 0) as string;
		
		let fieldsData: IDataObject;
		try {
			fieldsData = JSON.parse(fields);
		} catch (e) {
			throw new NodeOperationError(this.getNode(), 'Ungültiges JSON-Format für Klassifikationsfelder!');
		}
		
		const response = await this.helpers.httpRequest({
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

		return {
			success: true,
			data: response,
		};
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
): Promise<ClassificationResponse> {
	try {
		const docId = this.getNodeParameter('docId', 0) as number;
		const clDocId = this.getNodeParameter('clDocId', 0) as number;
		const classifyAttributes = this.getNodeParameter('classifyAttributes', 0) as string;
		
		let classifyData: IDataObject;
		try {
			classifyData = JSON.parse(classifyAttributes);
		} catch (error) {
			throw new NodeOperationError(
				this.getNode(),
				`Ungültiges JSON-Format für Klassifikationsattribute: ${error.message}`,
			);
		}
		
		const requestBody: IDataObject = {
			docId,
			clDocId,
			classifyAttributes: classifyData,
		};
		
		// Debug-Logging
		console.debug('Request URL:', `${credentials.serverUrl as string}/api/classifyDocument`);
		console.debug('Request Body:', JSON.stringify(requestBody, null, 2));
		
		// Baue die Server-URL ohne Trailing-Slash
		let serverUrl = credentials.serverUrl as string;
		if (serverUrl.endsWith('/')) {
			serverUrl = serverUrl.slice(0, -1);
		}
		
		try {
			const response = await this.helpers.httpRequest({
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

			return {
				success: true,
				data: response,
			};
		} catch (error) {
			console.debug(`Primärer API-Endpunkt fehlgeschlagen: ${error.message}`);
			
			// Strategie 1: API-Pfad mit IDs in URL
			try {
				const response = await this.helpers.httpRequest({
					url: `${serverUrl}/api/classifyDocument/${docId}/${clDocId}`,
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: {
						classifyAttributes: classifyData,
						editRoles: requestBody.editRoles,
						readRoles: requestBody.readRoles
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
			} catch (error2) {
				console.debug(`API-Pfad mit IDs fehlgeschlagen: ${error2.message}`);
				
				// Strategie 2: Version 2 API
				try {
					const response = await this.helpers.httpRequest({
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

					return {
						success: true,
						data: response,
					};
				} catch (error3) {
					console.debug(`Version 2 API fehlgeschlagen: ${error3.message}`);
					
					// Strategie 3: Alle Attribute abrufen und senden
					try {
						// Hole alle Klassifikationsattribute
						const classifyAttributesResult = await this.helpers.httpRequest({
							url: `${serverUrl}/api/classifyAttributes`,
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
						
						// Stelle sicher, dass alle erwarteten Attribute im Request vorhanden sind
						const allAttributes = classifyAttributesResult as IDataObject;
						const fullClassifyAttributes = { ...allAttributes };
						
						// Überschreibe mit den Werten aus classifyData
						for (const key of Object.keys(classifyData)) {
							fullClassifyAttributes[key] = classifyData[key];
						}
						
						// Erstelle einen neuen Request mit allen erforderlichen Attributen
						const completeRequestBody = {
							docId,
							clDocId,
							classifyAttributes: fullClassifyAttributes,
							editRoles: requestBody.editRoles as string[],
							readRoles: requestBody.readRoles as string[]
						};
						
						console.debug('Kompletter Request Body mit allen Attributen:', JSON.stringify(completeRequestBody, null, 2));
						
						const response = await this.helpers.httpRequest({
							url: `${serverUrl}/api/classifyDocument`,
							method: 'POST',
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
							body: completeRequestBody,
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
					} catch (finalError) {
						// Sammle alle Fehlermeldungen für eine bessere Diagnose
						const errorDetails = [
							`Primärer Endpunkt: ${error.message}`,
							`ID-basierter Pfad: ${error2.message}`,
							`V2 API: ${error3.message}`,
							`Vollständige Attribute: ${finalError.message}`,
						].join('\n');
						
						throw new NodeOperationError(
							this.getNode(),
							`Alle Versuche der Dokumentklassifikation sind fehlgeschlagen:\n${errorDetails}`,
						);
					}
				}
			}
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
): Promise<ClassificationResponse> {
	try {
		const clDocId = this.getNodeParameter('clDocId', 0) as number;
		
		const response = await this.helpers.httpRequest({
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

		return {
			success: true,
			data: response,
		};
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
): Promise<ClassificationResponse> {
	try {
		const clDocId = this.getNodeParameter('clDocId', 0) as number;
		
		// Hier würden wir Daten zu den zu verknüpfenden Dokumenten benötigen
		// Dies scheint in der Ressourcendatei zu fehlen und müsste ergänzt werden
		const linkedDocuments: number[] = [];
		
		const response = await this.helpers.httpRequest({
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

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		throw new NodeOperationError(
			this.getNode(),
			`Fehler beim Hinzufügen der Dokumentverknüpfungen: ${error.message}`,
		);
	}
} 