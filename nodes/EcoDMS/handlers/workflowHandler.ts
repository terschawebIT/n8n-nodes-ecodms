import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';
import { Operation } from '../utils/constants';
import { createNodeError, getErrorMessage } from '../utils/errorHandler';
import { getBaseUrl } from '../utils/helpers';

interface WorkflowResponse extends IDataObject {
	success?: boolean;
	message?: string;
	data?: IDataObject;
}

/**
 * Behandelt alle Workflow-Operationen für ecoDMS
 */
export async function handleWorkflowOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	let result: WorkflowResponse | INodeExecutionData[];

	switch (operation) {
		case Operation.UploadAndClassify:
			result = await handleUploadAndClassify.call(this, items, credentials);
			break;
		case 'uploadAndClassifyUserFriendly':
			result = await handleUploadAndClassifyUserFriendly.call(this, items, credentials);
			break;
		case Operation.SearchAndDownload:
			return await handleSearchAndDownload.call(this, items, credentials);
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
 * Dokument hochladen und sofort klassifizieren
 */
async function handleUploadAndClassify(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<WorkflowResponse> {
	const docId = this.getNodeParameter('docId', 0) as string;
	const url = await getBaseUrl.call(this, `uploadAndClassify/${docId}`);

	try {
		const response = await this.helpers.httpRequest({
			url,
			method: 'POST',
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
		throw createNodeError(this.getNode(), 'Fehler beim Hochladen und Klassifizieren', error);
	}
}

/**
 * Benutzerfreundlich: Dokument hochladen und mit strukturierten Feldern klassifizieren
 */
async function handleUploadAndClassifyUserFriendly(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<WorkflowResponse> {
	try {
		const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
		const documentTypeLocator = this.getNodeParameter('documentType', 0) as any;
		const folderLocator = this.getNodeParameter('folder', 0) as any;
		const statusLocator = this.getNodeParameter('status', 0) as any;
		const documentTitle = this.getNodeParameter('documentTitle', 0) as string;
		const additionalFields = this.getNodeParameter('additionalFields', 0, {}) as IDataObject;

		// Resource Locator Values extrahieren
		const documentType = documentTypeLocator.value || documentTypeLocator;
		const folder = folderLocator.value || folderLocator;
		const status = statusLocator.value || statusLocator;

		// Binäre Daten aus dem ersten Item holen
		const binaryData = items[0].binary?.[binaryPropertyName];
		if (!binaryData) {
			throw new NodeOperationError(
				this.getNode(),
				`Keine binären Daten in der Eigenschaft "${binaryPropertyName}" gefunden!`,
			);
		}

		// 1. Dokument hochladen
		const uploadUrl = await getBaseUrl.call(this, 'document/upload');

		const uploadResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'ecoDmsApi', {
			url: uploadUrl,
			method: 'POST',
			headers: {
				Accept: 'application/json',
			},
			body: {
				file: {
					value: binaryData.data,
					options: {
						filename: binaryData.fileName || 'document.pdf',
						contentType: binaryData.mimeType || 'application/pdf',
					},
				},
			},
			json: true,
		});

		if (!uploadResponse || !uploadResponse.docId) {
			throw new NodeOperationError(
				this.getNode(),
				'Upload fehlgeschlagen - keine Dokument-ID erhalten',
			);
		}

		const docId = uploadResponse.docId;

		// 2. Klassifikationsdaten zusammenstellen
		const classifyData: IDataObject = {
			docart: documentType,
			folder: folder,
			status: status,
			bemerkung: documentTitle,
		};

		// Zusätzliche Felder hinzufügen
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

		// Dynamische Custom Fields behandeln
		if (additionalFields.dynamicCustomFields && Array.isArray(additionalFields.dynamicCustomFields)) {
			const dynamicFields = additionalFields.dynamicCustomFields as IDataObject[];
			for (const dynamicField of dynamicFields) {
				if (dynamicField.customField && typeof dynamicField.customField === 'object') {
					const field = dynamicField.customField as IDataObject;
					const fieldNameObj = field.fieldName as any;
					const fieldName = fieldNameObj?.value || fieldNameObj;
					const fieldValue = field.fieldValue as string;

					if (fieldName && fieldValue) {
						classifyData[fieldName] = fieldValue;
					}
				}
			}
		}

		// Manuelle Custom Fields behandeln
		if (additionalFields.manualCustomFields && Array.isArray(additionalFields.manualCustomFields)) {
			const customFields = additionalFields.manualCustomFields as IDataObject[];
			for (const customField of customFields) {
				if (customField.customField && typeof customField.customField === 'object') {
					const field = customField.customField as IDataObject;
					if (field.name && field.value) {
						classifyData[field.name as string] = field.value;
					}
				}
			}
		}

		// Benutzer und Gruppen-Zuweisungen verarbeiten
		const userPermissions: IDataObject[] = [];
		const groupPermissions: IDataObject[] = [];

		if (additionalFields.assignedUsers && Array.isArray(additionalFields.assignedUsers)) {
			const assignedUsers = additionalFields.assignedUsers as IDataObject[];
			for (const userAssignment of assignedUsers) {
				if (userAssignment.user && typeof userAssignment.user === 'object') {
					const user = userAssignment.user as IDataObject;
					const userIdObj = user.userId as any;
					const userId = userIdObj?.value || userIdObj;
					const permission = user.permission as string;

					if (userId && permission) {
						userPermissions.push({
							userId,
							permission,
						});
					}
				}
			}
		}

		if (additionalFields.assignedGroups && Array.isArray(additionalFields.assignedGroups)) {
			const assignedGroups = additionalFields.assignedGroups as IDataObject[];
			for (const groupAssignment of assignedGroups) {
				if (groupAssignment.group && typeof groupAssignment.group === 'object') {
					const group = groupAssignment.group as IDataObject;
					const groupIdObj = group.groupId as any;
					const groupId = groupIdObj?.value || groupIdObj;
					const permission = group.permission as string;

					if (groupId && permission) {
						groupPermissions.push({
							groupId,
							permission,
						});
					}
				}
			}
		}

		// Berechtigungen vorbereiten
		const editRoles = (additionalFields.editRoles as string) || 'Elite';
		const readRoles = (additionalFields.readRoles as string) || '';

		// Erweiterte Berechtigungen hinzufügen falls vorhanden
		if (userPermissions.length > 0 || groupPermissions.length > 0) {
			classifyData.userPermissions = userPermissions;
			classifyData.groupPermissions = groupPermissions;
		}

		// 3. Dokument klassifizieren
		const classifyUrl = await getBaseUrl.call(this, 'classifyDocument');

		const classifyResponse = await this.helpers.httpRequest({
			url: classifyUrl,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: {
				docId,
				...classifyData,
				editRoles: editRoles
					.split(',')
					.map((role) => role.trim())
					.filter((role) => role),
				readRoles: readRoles
					.split(',')
					.map((role) => role.trim())
					.filter((role) => role),
			},
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});

		return {
			success: true,
			message: 'Dokument erfolgreich hochgeladen und klassifiziert',
			data: {
				docId,
				uploadResponse,
				classificationData: classifyData,
				classifyResponse,
			},
		};
	} catch (error: unknown) {
		throw createNodeError(
			this.getNode(),
			'Fehler beim benutzerfreundlichen Upload und Klassifizierung',
			error,
		);
	}
}

/**
 * Nach Dokumenten suchen und als Binärdaten herunterladen
 */
async function handleSearchAndDownload(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	credentials: IDataObject,
): Promise<INodeExecutionData[]> {
	try {
		const searchTerm = this.getNodeParameter('searchTerm', 0) as string;
		const binaryPropertyName = this.getNodeParameter('binaryProperty', 0) as string;
		const limit = this.getNodeParameter('limit', 0, 10) as number;

		// Suche nach Dokumenten
		const searchResponse = await this.helpers.httpRequest({
			url: `${credentials.serverUrl as string}/api/search`,
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: {
				searchTerm,
				limit,
			},
			json: true,
			auth: {
				username: credentials.username as string,
				password: credentials.password as string,
			},
		});

		if (
			!searchResponse.results ||
			!Array.isArray(searchResponse.results) ||
			searchResponse.results.length === 0
		) {
			return [{ json: { success: true, message: 'Keine Dokumente gefunden' } }];
		}

		const returnItems: INodeExecutionData[] = [];

		// Für jedes gefundene Dokument
		for (const document of searchResponse.results) {
			try {
				const docId = document.id;

				// Dokument herunterladen
				const downloadResponse = await this.helpers.httpRequest({
					url: `${credentials.serverUrl as string}/api/document/${docId}`,
					method: 'GET',
					headers: {
						Accept: '*/*',
					},
					encoding: 'arraybuffer',
					returnFullResponse: true,
					auth: {
						username: credentials.username as string,
						password: credentials.password as string,
					},
				});

				// Dateiname aus Content-Disposition-Header extrahieren
				const contentDisposition = downloadResponse.headers['content-disposition'] as string;
				let fileName = `document_${docId}.pdf`;
				if (contentDisposition) {
					const match = contentDisposition.match(/filename="(.+)"/);
					if (match) {
						fileName = match[1];
					}
				}

				// Mime-Typ bestimmen
				const contentType =
					(downloadResponse.headers['content-type'] as string) || 'application/octet-stream';

				// Neues Item mit Dokumentinformationen und Binärdaten erstellen
				const newItem: INodeExecutionData = {
					json: {
						...document,
						downloadSuccess: true,
					},
					binary: {},
				};

				// Binäre Daten hinzufügen
				newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(
					Buffer.from(downloadResponse.body as Buffer),
					fileName,
					contentType,
				);

				returnItems.push(newItem);
			} catch (error: unknown) {
				// Bei Fehler beim Herunterladen eines einzelnen Dokuments weitermachen
				returnItems.push({
					json: {
						...document,
						downloadSuccess: false,
						downloadError: getErrorMessage(error),
					},
				});
			}
		}

		return returnItems;
	} catch (error: unknown) {
		throw createNodeError(
			this.getNode(),
			'Fehler beim Suchen und Herunterladen der Dokumente',
			error,
		);
	}
}
