import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';
import { createNodeError, getErrorMessage } from '../utils/errorHandler';

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
		case 'classifyUserFriendly':
			result = await handleClassifyUserFriendly.call(this, items, credentials);
			break;
		case Operation.RemoveDocumentLink:
			result = await handleRemoveDocumentLink.call(this, credentials);
			break;
		case Operation.LinkToDocuments:
			result = await handleLinkToDocuments.call(this, credentials);
			break;
		default:
			throw new NodeOperationError(
				this.getNode(),
				`Die Operation "${operation}" wird nicht unterstützt!`,
			);
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
		throw createNodeError(this.getNode(), 'Fehler beim Abrufen der Klassifikationsattribute', error);
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
		throw createNodeError(
			this.getNode(),
			'Fehler beim Abrufen der detaillierten Klassifikationsattribute',
			error,
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
		} catch (error: unknown) {
			throw createNodeError(this.getNode(), 'Ungültiges JSON-Format für Klassifikationsfelder', error);
		}

		const response = await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/createNewClassify`,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: {
				docId,
				...fieldsData,
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
		throw createNodeError(this.getNode(), 'Fehler beim Erstellen der neuen Klassifikation', error);
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
		} catch (error: unknown) {
			throw createNodeError(this.getNode(), 'Ungültiges JSON-Format für Klassifikationsfelder', error);
		}

		const response = await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/classifyInboxDocument`,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: {
				docId,
				...fieldsData,
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
		throw createNodeError(this.getNode(), 'Fehler beim Klassifizieren des Inbox-Dokuments', error);
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
		const fields = this.getNodeParameter('fields', 0) as string;

		let fieldsData: IDataObject;
		try {
			fieldsData = JSON.parse(fields);
		} catch (error: unknown) {
			throw createNodeError(
				this.getNode(),
				'Ungültiges JSON-Format für Klassifikationsattribute',
				error,
			);
		}

		// Versuche verschiedene API-Endpunkte
		try {
			// Primärer API-Endpunkt
			const response = await this.helpers.httpRequest({
				url: `${credentials.serverUrl as string}/api/classifyDocument`,
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: {
					docId,
					...fieldsData,
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
			console.debug(`Primärer API-Endpunkt fehlgeschlagen: ${getErrorMessage(error)}`);

			try {
				// Versuche API-Pfad mit IDs
				const response = await this.helpers.httpRequest({
					url: `${credentials.serverUrl as string}/api/classifyDocument`,
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
					body: {
						docId,
						useIds: true,
						...fieldsData,
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
			} catch (error2: unknown) {
				console.debug(`API-Pfad mit IDs fehlgeschlagen: ${getErrorMessage(error2)}`);

				try {
					// Versuche Version 2 API
					const response = await this.helpers.httpRequest({
						url: `${credentials.serverUrl as string}/api/v2/classifyDocument`,
						method: 'POST',
						headers: {
							Accept: 'application/json',
							'Content-Type': 'application/json',
						},
						body: {
							docId,
							...fieldsData,
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
				} catch (error3: unknown) {
					console.debug(`Version 2 API fehlgeschlagen: ${getErrorMessage(error3)}`);

					// Wenn alle Versuche fehlschlagen, werfe einen zusammengefassten Fehler
					const errorMessage =
						'Alle API-Endpunkte fehlgeschlagen:\n' +
						`Primärer Endpunkt: ${getErrorMessage(error)}\n` +
						`ID-basierter Pfad: ${getErrorMessage(error2)}\n` +
						`V2 API: ${getErrorMessage(error3)}`;

					throw createNodeError(
						this.getNode(),
						'Fehler beim Klassifizieren des Dokuments',
						new Error(errorMessage),
					);
				}
			}
		}
	} catch (error: unknown) {
		throw createNodeError(
			this.getNode(),
			'Fehler beim Aktualisieren der Dokumentklassifikation',
			error,
		);
	}
}

/**
 * Benutzerfreundliche Dokumentklassifizierung mit strukturierten Feldern
 */
async function handleClassifyUserFriendly(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<ClassificationResponse> {
	try {
		const docId = this.getNodeParameter('docId', 0) as number;
		const documentType = this.getNodeParameter('documentType', 0) as string;
		const folder = this.getNodeParameter('folder', 0) as string;
		const status = this.getNodeParameter('status', 0) as string;
		const documentTitle = this.getNodeParameter('documentTitle', 0) as string;
		const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as IDataObject;

		// Baue das Klassifikationsobjekt zusammen
		const classifyData: IDataObject = {
			docart: documentType,
			folder: folder,
			status: status,
			bemerkung: documentTitle,
		};

		// Füge zusätzliche Felder hinzu
		if (additionalFields.revision) {
			classifyData.revision = additionalFields.revision;
		}
		if (additionalFields.keywords) {
			classifyData.keywords = additionalFields.keywords;
		}
		if (additionalFields.author) {
			classifyData.author = additionalFields.author;
		}
		if (additionalFields.documentDate) {
			classifyData.documentDate = additionalFields.documentDate;
		}

		// Behandle benutzerdefinierte Felder
		if (additionalFields.customFields && Array.isArray(additionalFields.customFields)) {
			const customFields = additionalFields.customFields as IDataObject[];
			for (const customField of customFields) {
				if (customField.customField && typeof customField.customField === 'object') {
					const field = customField.customField as IDataObject;
					if (field.name && field.value) {
						classifyData[field.name as string] = field.value;
					}
				}
			}
		}

		// Bereite Berechtigungen vor
		const editRoles = additionalFields.editRoles as string || 'Elite';
		const readRoles = additionalFields.readRoles as string || '';

		// API-Aufruf zur Klassifizierung
		const response = await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/classifyDocument`,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: {
				docId,
				...classifyData,
				editRoles: editRoles.split(',').map(role => role.trim()).filter(role => role),
				readRoles: readRoles.split(',').map(role => role.trim()).filter(role => role),
			},
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});

		return {
			success: true,
			message: 'Dokument erfolgreich klassifiziert',
			data: {
				docId,
				classificationData: classifyData,
				response,
			},
		};
	} catch (error: unknown) {
		throw createNodeError(this.getNode(), 'Fehler bei der benutzerfreundlichen Klassifizierung', error);
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
		const docId = this.getNodeParameter('docId', 0) as number;
		const response = await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/document/${docId}/removeDocumentLink`,
			method: 'DELETE',
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
		throw createNodeError(this.getNode(), 'Fehler beim Entfernen der Dokumentverknüpfungen', error);
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
		const docId = this.getNodeParameter('docId', 0) as number;
		const targetDocIds = this.getNodeParameter('targetDocIds', 0) as number[];

		const response = await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/document/${docId}/linkToDocuments`,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: { targetDocIds },
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
		throw createNodeError(this.getNode(), 'Fehler beim Hinzufügen der Dokumentverknüpfungen', error);
	}
}
