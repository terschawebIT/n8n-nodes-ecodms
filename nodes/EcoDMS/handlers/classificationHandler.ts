import {
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type IRequestOptions,
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

		// Optional: Filter anwenden falls attributeFilter Parameter gesetzt ist
		let filteredResponse = response;
		try {
			const attributeFilter = this.getNodeParameter('attributeFilter', 0) as string[];

			if (attributeFilter && attributeFilter.length > 0) {
				console.log('=== ATTRIBUT-FILTER ANGEWENDET ===');
				console.log('Gewählte Attribute:', attributeFilter);
				console.log('Response Type:', Array.isArray(response) ? 'Array' : 'Object');
				console.log('Response Keys (first 5):', Object.keys(response || {}).slice(0, 5));

				if (Array.isArray(response)) {
					console.log('Filtering Array with', response.length, 'items');
					// Debug: Zeige Struktur der ersten Attribute
					if (response.length > 0) {
						console.log('Beispiel-Attribut Struktur:', JSON.stringify(response[0], null, 2));
					}

					filteredResponse = response.filter((attr: any) => {
						// Prüfe verschiedene mögliche Identifikatoren
						const matches = attributeFilter.some((filterValue) => {
							const fieldMatches =
								attr.name === filterValue ||
								attr.fieldName === filterValue ||
								attr.fieldID === filterValue || // Möglicher Feldname in API
								attr.id === filterValue ||
								attr.displayName === filterValue ||
								attr.caption === filterValue ||
								// Falls es ein Object mit nested Werten ist
								(attr.fieldName && attr.fieldName === filterValue) ||
								(attr.fieldID && attr.fieldID === filterValue);

							if (fieldMatches) {
								console.log('✅ Attribut gefunden:', {
									filterValue,
									attrName: attr.name,
									attrFieldName: attr.fieldName,
									attrFieldID: attr.fieldID,
									attrId: attr.id,
								});
							}

							return fieldMatches;
						});

						if (!matches) {
							// Debug: Zeige warum Attribut nicht gefiltert wurde
							console.log('❌ Attribut nicht gefiltert:', {
								availableFields: {
									name: attr.name,
									fieldName: attr.fieldName,
									fieldID: attr.fieldID,
									id: attr.id,
									displayName: attr.displayName,
									caption: attr.caption,
								},
								searchingFor: attributeFilter,
							});
						}

						return matches;
					});

					console.log(`Von ${response.length} Attributen wurden ${filteredResponse.length} gefiltert`);
				} else if (response && typeof response === 'object') {
					console.log('Filtering Object with', Object.keys(response).length, 'keys');

					// Für Object-Response (wie bei detailInformation API)
					const filteredObject: any = {};
					let totalAttributes = 0;
					let filteredAttributes = 0;

					for (const [key, value] of Object.entries(response)) {
						totalAttributes++;

						// Prüfe ob dieser Schlüssel im Filter enthalten ist
						const matches = attributeFilter.some((filterValue) => {
							const keyMatches =
								key === filterValue ||
								(value &&
									typeof value === 'object' &&
									((value as any).fieldID === filterValue ||
										(value as any).fieldName === filterValue ||
										(value as any).name === filterValue));

							if (keyMatches) {
								console.log('✅ Attribut-Key gefunden:', {
									filterValue,
									objectKey: key,
									valueType: typeof value,
									fieldID: (value as any)?.fieldID,
									fieldName: (value as any)?.fieldName,
								});
							}

							return keyMatches;
						});

						if (matches) {
							filteredObject[key] = value;
							filteredAttributes++;
						} else {
							console.log('❌ Attribut-Key nicht gefiltert:', {
								objectKey: key,
								valueType: typeof value,
								fieldID: (value as any)?.fieldID,
								fieldName: (value as any)?.fieldName,
								searchingFor: attributeFilter,
							});
						}
					}

					filteredResponse = filteredObject;
					console.log(`Von ${totalAttributes} Attributen wurden ${filteredAttributes} gefiltert`);
				}
			} else {
				console.log('Kein Attribut-Filter gesetzt, alle Attribute werden zurückgegeben');
			}
		} catch (filterError) {
			// Falls Filter-Parameter nicht existiert oder Fehler auftritt, alle Attribute zurückgeben
			console.log(
				'Filter-Parameter nicht verfügbar oder Fehler beim Filtern, alle Attribute werden zurückgegeben',
				filterError,
			);
		}

		return {
			success: true,
			data: filteredResponse,
			totalAttributesAvailable: Array.isArray(response) ? response.length : 0,
			filteredAttributesReturned: Array.isArray(filteredResponse) ? filteredResponse.length : 0,
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

		// Debug-Ausgaben
		console.log('=== BENUTZERFREUNDLICHE KLASSIFIZIERUNG GESTARTET ===');
		console.log('DocID:', docId, 'Type:', typeof docId);

		// Zuerst Dokumentinformationen abrufen um clDocId zu erhalten
		const documentInfoUrl = `${credentials.serverUrl as string}/api/documentInfo/${docId}`;
		console.log('Rufe Dokumentinformationen ab:', documentInfoUrl);

		const documentInfoOptions: IRequestOptions = {
			method: 'GET', // documentInfo verwendet GET, nicht POST
			json: true,
			uri: documentInfoUrl,
			auth: {
				user: credentials.username as string,
				pass: credentials.password as string,
			},
		};

		let documentInfo: any;
		try {
			documentInfo = await this.helpers.request(documentInfoOptions);
			console.log('Dokumentinformationen erhalten:', JSON.stringify(documentInfo, null, 2));
		} catch (error) {
			console.error('Fehler beim Abrufen der Dokumentinformationen:', error);
			throw new NodeOperationError(
				this.getNode(),
				`Fehler beim Abrufen der Dokumentinformationen: ${(error as Error).message}`,
			);
		}

		// Extrahiere clDocId aus den Dokumentinformationen
		const clDocId = documentInfo?.[0]?.clDocId || docId; // Array-Zugriff korrigiert
		console.log('DocInfo clDocId:', documentInfo?.[0]?.clDocId);
		console.log('Verwende clDocId:', clDocId);

		const documentTypeLocator = this.getNodeParameter('documentType', 0) as any;
		const folderLocator = this.getNodeParameter('folder', 0) as any;
		const statusLocator = this.getNodeParameter('status', 0) as any;
		const documentTitle = this.getNodeParameter('documentTitle', 0) as string;
		const additionalFields = this.getNodeParameter('additionalFields', 0) as IDataObject;

		// Resource Locator Values extrahieren
		const documentType = documentTypeLocator.value || documentTypeLocator;
		const folder = folderLocator.value || folderLocator;
		const status = statusLocator.value || statusLocator;

		// Debug: Zeige Input-Parameter
		console.log('=== INPUT PARAMETER ===');
		console.log('documentTypeLocator:', documentTypeLocator);
		console.log('documentType extracted:', documentType);
		console.log('folder:', folder);
		console.log('status:', status);
		console.log('documentTitle:', documentTitle);
		console.log('additionalFields:', additionalFields);

		// Verwende existierende classifyAttributes als Basis und überschreibe nur gewünschte Felder
		const existingAttributes = documentInfo?.[0]?.classifyAttributes || {};
		console.log('=== EXISTING ATTRIBUTES ===');
		console.log('Anzahl Felder:', Object.keys(existingAttributes).length);
		console.log('Felder:', Object.keys(existingAttributes));
		console.log('Vollständig:', JSON.stringify(existingAttributes, null, 2));

		// WICHTIG: Behalte ALLE existierenden Felder (inkl. leere dyn_* Felder)
		// Die ecoDMS API erwartet alle ursprünglichen Felder, auch wenn sie leer sind
		console.log('=== USING ALL ATTRIBUTES (including empty dyn_* fields) ===');
		console.log('Anzahl Felder:', Object.keys(existingAttributes).length);
		console.log('Felder:', Object.keys(existingAttributes));

		// Behandle documentDate korrekt: nur gültige Datumsformate oder leer lassen
		let documentDate = '';
		if (additionalFields.documentDate && 
			additionalFields.documentDate !== 'Not specified' && 
			typeof additionalFields.documentDate === 'string' &&
			additionalFields.documentDate.trim() !== '') {
			// Prüfe ob es ein gültiges Datum im Format YYYY-MM-DD ist
			const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
			if (dateRegex.test(additionalFields.documentDate as string)) {
				documentDate = additionalFields.documentDate as string;
			}
		}

		console.log('=== EXTRACTED VALUES DEBUG ===');
		console.log('documentType type:', typeof documentType, 'value:', documentType);
		console.log('folder type:', typeof folder, 'value:', folder);
		console.log('status type:', typeof status, 'value:', status);
		console.log('documentDate type:', typeof documentDate, 'value:', documentDate);

		const classifyAttributes: IDataObject = {
			...existingAttributes, // ALLE existierenden Felder übernehmen (auch leere dyn_* Felder)
			// Überschreibe nur die gewünschten Felder
			docart: documentType,
			folder: folder,
			status: status,
			bemerkung: documentTitle,
			docid: `${docId}#${clDocId}`, // KORREKTES Format: docId#clDocId aus API
			changeid: credentials.username || 'n8n-ecodms', // API-Benutzer als changeid
			rechte: 'W', // Write-Berechtigung
			ctimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), // Aktueller Zeitstempel
			revision: '1.0', // Standard Revision für neue Dokumente
			cdate: documentDate, // Dokumentdatum nur wenn gültig, sonst leer
		};

		// ENTFERNE documentDate aus classifyAttributes - gehört NICHT dorthin!
		if ('documentDate' in classifyAttributes) {
			classifyAttributes.documentDate = undefined;
		}

		// Füge zusätzliche Felder hinzu
		if (additionalFields.keywords) {
			classifyAttributes.keywords = additionalFields.keywords;
		}
		// Autor wird automatisch von ecoDMS gesetzt

		// Behandle dynamische Custom Fields
		if (additionalFields.dynamicCustomFields) {
			let dynamicFields: any[] = [];

			// Handle beide Strukturen: Array und Object mit customField Array
			if (Array.isArray(additionalFields.dynamicCustomFields)) {
				dynamicFields = additionalFields.dynamicCustomFields;
			} else if (
				typeof additionalFields.dynamicCustomFields === 'object' &&
				(additionalFields.dynamicCustomFields as any).customField &&
				Array.isArray((additionalFields.dynamicCustomFields as any).customField)
			) {
				dynamicFields = (additionalFields.dynamicCustomFields as any).customField;
			}

			console.log('=== DYNAMIC FIELDS DEBUG ===');
			console.log('dynamicFields length:', dynamicFields.length);
			console.log('dynamicFields:', JSON.stringify(dynamicFields, null, 2));

			for (const dynamicField of dynamicFields) {
				// Prüfe direkte Struktur
				if (dynamicField.fieldName && dynamicField.fieldValue) {
					const fieldName =
						typeof dynamicField.fieldName === 'object'
							? (dynamicField.fieldName as any).value || dynamicField.fieldName
							: dynamicField.fieldName;
					console.log(`Setting direct field: ${fieldName} = ${dynamicField.fieldValue}`);
					classifyAttributes[fieldName as string] = dynamicField.fieldValue;
				}
				// Prüfe verschachtelte Struktur
				else if (dynamicField.customField && typeof dynamicField.customField === 'object') {
					const field = dynamicField.customField as IDataObject;
					if (field.fieldName && field.fieldValue) {
						const fieldName =
							typeof field.fieldName === 'object'
								? (field.fieldName as any).value || field.fieldName
								: field.fieldName;
						console.log(`Setting nested field: ${fieldName} = ${field.fieldValue}`);
						classifyAttributes[fieldName as string] = field.fieldValue;
					}
				}
			}
		}

		// Behandle manuelle Custom Fields
		if (additionalFields.manualCustomFields && Array.isArray(additionalFields.manualCustomFields)) {
			const manualFields = additionalFields.manualCustomFields as IDataObject[];
			for (const manualField of manualFields) {
				if (manualField.customField && typeof manualField.customField === 'object') {
					const field = manualField.customField as IDataObject;
					if (field.name && field.value) {
						classifyAttributes[field.name as string] = field.value;
					}
				}
			}
		}

		// Behandle zugewiesene Benutzer
		const assignedUsers: string[] = [];
		if (additionalFields.assignedUsers && Array.isArray(additionalFields.assignedUsers)) {
			const userAssignments = additionalFields.assignedUsers as IDataObject[];
			for (const userAssignment of userAssignments) {
				if (userAssignment.user && typeof userAssignment.user === 'object') {
					const user = userAssignment.user as IDataObject;
					const userId =
						typeof user.userId === 'object' ? (user.userId as any).value || user.userId : user.userId;
					const permission = user.permission || 'read';

					if (userId) {
						assignedUsers.push(`${userId}:${permission}`);
					}
				}
			}
		}

		// Behandle zugewiesene Gruppen
		const assignedGroups: string[] = [];
		if (additionalFields.assignedGroups && Array.isArray(additionalFields.assignedGroups)) {
			const groupAssignments = additionalFields.assignedGroups as IDataObject[];
			for (const groupAssignment of groupAssignments) {
				if (groupAssignment.group && typeof groupAssignment.group === 'object') {
					const group = groupAssignment.group as IDataObject;
					const groupId =
						typeof group.groupId === 'object'
							? (group.groupId as any).value || group.groupId
							: group.groupId;
					const permission = group.permission || 'read';

					if (groupId) {
						assignedGroups.push(`${groupId}:${permission}`);
					}
				}
			}
		}

		// Verwalte Berechtigungen basierend auf UI-Eingaben
		const finalEditRoles: string[] = [];
		const finalReadRoles: string[] = [];

		// Verarbeite zugewiesene Benutzer und Gruppen
		for (const userAssignment of assignedUsers) {
			const [userId, permission] = userAssignment.split(':');
			if (permission === 'edit' || permission === 'full') {
				finalEditRoles.push(userId);
			} else {
				finalReadRoles.push(userId);
			}
		}

		for (const groupAssignment of assignedGroups) {
			const [groupId, permission] = groupAssignment.split(':');
			if (permission === 'edit' || permission === 'full') {
				finalEditRoles.push(groupId);
			} else {
				finalReadRoles.push(groupId);
			}
		}

		// Falls keine spezifischen Rollen zugewiesen wurden, verwende die existierenden Dokumentrollen
		if (finalEditRoles.length === 0 && finalReadRoles.length === 0) {
			const existingEditRoles = documentInfo?.[0]?.editRoles || [];
			const existingReadRoles = documentInfo?.[0]?.readRoles || [];
			
			finalEditRoles.push(...existingEditRoles);
			finalReadRoles.push(...existingReadRoles);
			
			// Falls immer noch keine Edit-Rollen vorhanden sind, Fallback auf Benutzer-Rolle
			if (finalEditRoles.length === 0) {
				finalEditRoles.push(`r_${credentials.username}`);
			}
		}

		// API-Aufruf zur Klassifizierung (korrekte ecoDMS API-Struktur)
		const requestBody = {
			docId,
			clDocId: clDocId,
			classifyAttributes,
			editRoles: finalEditRoles,
			readRoles: finalReadRoles,
		};

		console.log('=== DEBUG classifyUserFriendly ===');
		console.log('DocID:', docId, 'Type:', typeof docId);
		console.log('Request Body:', JSON.stringify(requestBody, null, 2));
		console.log('API URL:', `${credentials.serverUrl as string}/api/classifyDocument`);

		const response = await this.helpers
			.httpRequest({
				url: `${credentials.serverUrl as string}/api/classifyDocument`,
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: requestBody,
				json: true,
				auth: {
					username: credentials.username as string,
					password: credentials.password as string,
				},
			})
			.catch((error: any) => {
				console.log('=== API ERROR DETAILS ===');
				console.log('Status Code:', error.statusCode);
				console.log('Response:', error.response?.body || error.message);
				console.log('Error Details:', error);

				// Versuche dokumentInfo zu prüfen
				if (error.statusCode === 404) {
					console.log('HTTP 404 - möglicherweise ungültige docId oder falsche Attribute');
				}
				throw error;
			});

		// Debug: Anzahl Felder nach Bearbeitung
		console.log('=== FINAL CLASSIFY ATTRIBUTES ===');
		console.log('Anzahl Felder:', Object.keys(classifyAttributes).length);
		console.log('Felder:', Object.keys(classifyAttributes));
		console.log('Vollständig:', JSON.stringify(classifyAttributes, null, 2));

		return {
			success: true,
			message: 'Dokument erfolgreich klassifiziert',
			data: {
				docId,
				classifyAttributes,
				assignedUsers: assignedUsers.length > 0 ? assignedUsers : undefined,
				assignedGroups: assignedGroups.length > 0 ? assignedGroups : undefined,
				editRoles: finalEditRoles,
				readRoles: finalReadRoles,
				response,
			},
		};
	} catch (error: unknown) {
		throw createNodeError(
			this.getNode(),
			'Fehler bei der benutzerfreundlichen Klassifizierung',
			error,
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
