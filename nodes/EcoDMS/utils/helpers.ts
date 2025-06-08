import type {
	ICredentialDataDecryptedObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { getErrorMessage } from './errorHandler';

interface EcoDmsApiCredentials extends ICredentialDataDecryptedObject {
	serverUrl: string;
	username: string;
	password: string;
}

/**
 * Erstellt die Basis-URL für API-Anfragen an den ecoDMS-Server
 */
export async function getBaseUrl(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	endpoint: string,
): Promise<string> {
	const credentials = (await this.getCredentials('ecoDmsApi')) as unknown as EcoDmsApiCredentials;
	if (!credentials.serverUrl) {
		throw new Error('Server-URL ist nicht konfiguriert. Bitte in den Anmeldedaten angeben.');
	}

	// Sicherstellen, dass die Server-URL keine nachfolgenden Slashes hat
	let serverUrl = credentials.serverUrl.trim();
	while (serverUrl.endsWith('/')) {
		serverUrl = serverUrl.slice(0, -1);
	}

	// Sicherstellen, dass der Endpunkt keinen führenden Slash hat
	let cleanEndpoint = endpoint.trim();
	while (cleanEndpoint.startsWith('/')) {
		cleanEndpoint = cleanEndpoint.substring(1);
	}

	// API-Endpunkt hinzufügen
	return `${serverUrl}/api/${cleanEndpoint}`;
}

/**
 * Erstellt die HTTP-Auth-Optionen für ecoDMS-API-Anfragen
 */
export async function getAuthOptions(
	this: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<{ username: string; password: string }> {
	const credentials = (await this.getCredentials('ecoDmsApi')) as unknown as EcoDmsApiCredentials;

	if (!credentials.username || !credentials.password) {
		throw new Error('Benutzername und Passwort sind erforderlich.');
	}

	return {
		username: credentials.username,
		password: credentials.password,
	};
}

/**
 * Konvertiert einen String in ein Array von Zahlen
 * Nützlich für Listen wie linkIds, die als kommagetrennte Strings kommen
 */
export function stringToNumberArray(input: string): number[] {
	if (!input || input.trim() === '') {
		return [];
	}

	return input
		.split(',')
		.map((id) => id.trim())
		.filter((id) => id !== '')
		.map((id) => Number.parseInt(id, 10))
		.filter((id) => !Number.isNaN(id));
}

/**
 * Prüft, ob eine Datei einen unterstützten Dateityp hat
 */
export function isSupportedFileType(mimeType: string): boolean {
	const supportedTypes = [
		'application/pdf',
		'image/tiff',
		'image/png',
		'image/jpeg',
		'image/jpg',
		'image/bmp',
	];

	return supportedTypes.includes(mimeType);
}

/**
 * Extrahiert den Dateinamen aus einem Content-Disposition-Header
 */
export function extractFilenameFromHeader(
	contentDisposition: string | undefined,
	fallbackName: string,
): string {
	if (!contentDisposition) {
		return fallbackName;
	}

	const match = contentDisposition.match(/filename="(.+)"/);
	return match ? match[1] : fallbackName;
}

/**
 * Lädt die verfügbaren Ordner aus ecoDMS für Dropdown-Menüs
 */
export async function getFolders(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const credentials = (await this.getCredentials('ecoDmsApi')) as unknown as EcoDmsApiCredentials;

		// Konstruiere die korrekte URL über die Hilfsfunktion
		// Der korrekte API-Endpunkt ist 'folders' (Plural) laut Dokumentation
		const url = await getBaseUrl.call(this, 'folders');

		console.log('Folders-API-URL:', url);

		// API-Aufruf, um Ordner abzurufen
		const response = await this.helpers.httpRequest({
			url,
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			json: true,
			auth: {
				username: credentials.username,
				password: credentials.password,
			},
		});

		console.log('Folders-API-Antwort:', JSON.stringify(response).substring(0, 200));

		if (!Array.isArray(response)) {
			console.error(
				`Unerwartetes Antwortformat beim Abrufen der Ordner: ${JSON.stringify(response).substring(0, 200)}`,
			);
			return [
				{
					name: '-- Fehler beim Laden der Ordner --',
					value: '',
					description: 'Unerwartetes Antwortformat',
				},
			];
		}

		// Ordner in das erforderliche Format konvertieren
		const options: INodePropertyOptions[] = [];

		// Auto-Option als erstes Element
		options.push({
			name: '-- Bitte auswählen --',
			value: '',
			description: 'Bitte einen Wert auswählen',
		});

		for (const folder of response) {
			options.push({
				name: folder.foldername || `Ordner ${folder.oId}`,
				value: folder.oId.toString(),
				description: folder.description || '',
			});
		}

		// Nach Namen sortieren (außer dem ersten Element)
		if (options.length > 1) {
			const autoOption = options.shift();
			options.sort((a, b) => a.name.localeCompare(b.name));
			options.unshift(autoOption!);
		}

		console.log(`${options.length} Ordner-Optionen geladen`);
		return options;
	} catch (error: unknown) {
		console.error('Fehler beim Abrufen der Ordner:', error);
		return [
			{
				name: '-- Fehler beim Laden der Ordner --',
				value: '',
				description: `Fehler: ${getErrorMessage(error)}`,
			},
		];
	}
}

/**
 * Lädt die verfügbaren Dokumentarten aus ecoDMS für Dropdown-Menüs
 */
export async function getDocumentTypes(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const credentials = (await this.getCredentials('ecoDmsApi')) as unknown as EcoDmsApiCredentials;

		// Konstruiere die korrekte URL über die Hilfsfunktion
		const url = await getBaseUrl.call(this, 'types');

		console.log('DocumentTypes-API-URL:', url);

		// API-Aufruf, um Dokumentarten abzurufen
		const response = await this.helpers.httpRequest({
			url,
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			json: true,
			auth: {
				username: credentials.username,
				password: credentials.password,
			},
		});

		console.log('DocumentTypes-API-Antwort:', JSON.stringify(response).substring(0, 200));

		if (!Array.isArray(response)) {
			console.error(
				`Unerwartetes Antwortformat beim Abrufen der Dokumentarten: ${JSON.stringify(response).substring(0, 200)}`,
			);
			return [
				{
					name: '-- Fehler beim Laden der Dokumentarten --',
					value: '',
					description: 'Unerwartetes Antwortformat',
				},
			];
		}

		// Dokumentarten in das erforderliche Format konvertieren
		const options: INodePropertyOptions[] = [];

		// Auto-Option als erstes Element
		options.push({
			name: '-- Bitte auswählen --',
			value: '',
			description: 'Bitte einen Wert auswählen',
		});

		for (const docType of response) {
			options.push({
				name: docType.name || `Typ ${docType.id}`,
				value: docType.id.toString(),
				description: docType.description || '',
			});
		}

		// Nach Namen sortieren (außer dem ersten Element)
		if (options.length > 1) {
			const autoOption = options.shift();
			options.sort((a, b) => a.name.localeCompare(b.name));
			options.unshift(autoOption!);
		}

		console.log(`${options.length} Dokumenttyp-Optionen geladen`);
		return options;
	} catch (error: unknown) {
		console.error('Fehler beim Abrufen der Dokumentarten:', error);
		return [
			{
				name: '-- Fehler beim Laden der Dokumentarten --',
				value: '',
				description: `Fehler: ${getErrorMessage(error)}`,
			},
		];
	}
}

/**
 * Lädt die verfügbaren Status-Werte aus ecoDMS für Dropdown-Menüs
 */
export async function getStatusValues(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const credentials = (await this.getCredentials('ecoDmsApi')) as unknown as EcoDmsApiCredentials;

		// Konstruiere die korrekte URL über die Hilfsfunktion
		const url = await getBaseUrl.call(this, 'status');

		console.log('Status-API-URL:', url);

		// API-Aufruf, um Status-Werte abzurufen
		const response = await this.helpers.httpRequest({
			url,
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			json: true,
			auth: {
				username: credentials.username,
				password: credentials.password,
			},
		});

		console.log('Status-API-Antwort:', JSON.stringify(response).substring(0, 200));

		if (!Array.isArray(response)) {
			console.error(
				`Unerwartetes Antwortformat beim Abrufen der Status-Werte: ${JSON.stringify(response).substring(0, 200)}`,
			);
			return [
				{
					name: '-- Fehler beim Laden der Status-Werte --',
					value: '',
					description: 'Unerwartetes Antwortformat',
				},
			];
		}

		// Status-Werte in das erforderliche Format konvertieren
		const options: INodePropertyOptions[] = [];

		// Auto-Option als erstes Element
		options.push({
			name: '-- Bitte auswählen --',
			value: '',
			description: 'Bitte einen Wert auswählen',
		});

		for (const status of response) {
			options.push({
				name: status.name || `Status ${status.id}`,
				value: status.id.toString(),
				description: status.description || '',
			});
		}

		// Nach Namen sortieren (außer dem ersten Element)
		if (options.length > 1) {
			const autoOption = options.shift();
			options.sort((a, b) => a.name.localeCompare(b.name));
			options.unshift(autoOption!);
		}

		console.log(`${options.length} Status-Optionen geladen`);
		return options;
	} catch (error: unknown) {
		console.error('Fehler beim Abrufen der Status-Werte:', error);
		return [
			{
				name: '-- Fehler beim Laden der Status-Werte --',
				value: '',
				description: `Fehler: ${getErrorMessage(error)}`,
			},
		];
	}
}

/**
 * Lädt die verfügbaren Klassifikationsattribute für ein Dokument für Dropdown-Menüs
 */
export async function getClassificationAttributes(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const credentials = (await this.getCredentials('ecoDmsApi')) as unknown as EcoDmsApiCredentials;

		// Konstruiere die korrekte URL über die Hilfsfunktion
		const url = await getBaseUrl.call(this, 'classifyAttributes');

		console.log('ClassificationAttributes-API-URL:', url);

		// API-Aufruf, um Klassifikationsattribute abzurufen
		const response = await this.helpers.httpRequest({
			url,
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			json: true,
			auth: {
				username: credentials.username,
				password: credentials.password,
			},
		});

		console.log('ClassificationAttributes-API-Antwort:', JSON.stringify(response).substring(0, 200));

		if (!Array.isArray(response)) {
			console.error(
				`Unerwartetes Antwortformat beim Abrufen der Klassifikationsattribute: ${JSON.stringify(response).substring(0, 200)}`,
			);
			return [
				{
					name: '-- Fehler beim Laden der Klassifikationsattribute --',
					value: '',
					description: 'Unerwartetes Antwortformat',
				},
			];
		}

		// Klassifikationsattribute in das erforderliche Format konvertieren
		const options: INodePropertyOptions[] = [];

		// Auto-Option als erstes Element
		options.push({
			name: '-- Bitte auswählen --',
			value: '',
			description: 'Bitte einen Wert auswählen',
		});

		for (const attr of response) {
			options.push({
				name: attr.name || `Attribut ${attr.id}`,
				value: attr.id?.toString() || attr.name,
				description: attr.description || '',
			});
		}

		// Nach Namen sortieren (außer dem ersten Element)
		if (options.length > 1) {
			const autoOption = options.shift();
			options.sort((a, b) => a.name.localeCompare(b.name));
			options.unshift(autoOption!);
		}

		console.log(`${options.length} Klassifikationsattribut-Optionen geladen`);
		return options;
	} catch (error: unknown) {
		console.error('Fehler beim Abrufen der Klassifikationsattribute:', error);
		return [
			{
				name: '-- Fehler beim Laden der Klassifikationsattribute --',
				value: '',
				description: `Fehler: ${getErrorMessage(error)}`,
			},
		];
	}
}

/**
 * Lädt verfügbare Dokumenttyp-Klassifikationen für Dropdown-Menüs
 */
export async function getTypeClassifications(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const credentials = (await this.getCredentials('ecoDmsApi')) as unknown as EcoDmsApiCredentials;

		// Konstruiere die korrekte URL über die Hilfsfunktion
		const url = await getBaseUrl.call(this, 'typeClassifications');

		console.log('TypeClassifications-API-URL:', url);

		// API-Aufruf, um Dokumenttyp-Klassifikationen abzurufen
		const response = await this.helpers.httpRequest({
			url,
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			json: true,
			auth: {
				username: credentials.username,
				password: credentials.password,
			},
		});

		console.log('TypeClassifications-API-Antwort:', JSON.stringify(response).substring(0, 200));

		if (!Array.isArray(response)) {
			console.error(
				`Unerwartetes Antwortformat beim Abrufen der Dokumenttyp-Klassifikationen: ${JSON.stringify(response).substring(0, 200)}`,
			);
			return [
				{
					name: '-- Fehler beim Laden der Dokumenttyp-Klassifikationen --',
					value: '',
					description: 'Unerwartetes Antwortformat',
				},
			];
		}

		// Dokumenttyp-Klassifikationen in das erforderliche Format konvertieren
		const options: INodePropertyOptions[] = [];

		// Auto-Option als erstes Element
		options.push({
			name: '-- Bitte auswählen --',
			value: '',
			description: 'Bitte einen Wert auswählen',
		});

		for (const classification of response) {
			options.push({
				name: classification.name || `Klassifikation ${classification.id}`,
				value: classification.id?.toString() || classification.name,
				description: classification.description || '',
			});
		}

		// Nach Namen sortieren (außer dem ersten Element)
		if (options.length > 1) {
			const autoOption = options.shift();
			options.sort((a, b) => a.name.localeCompare(b.name));
			options.unshift(autoOption!);
		}

		console.log(`${options.length} Dokumenttyp-Klassifikation-Optionen geladen`);
		return options;
	} catch (error: unknown) {
		console.error('Fehler beim Abrufen der Dokumenttyp-Klassifikationen:', error);
		return [
			{
				name: '-- Fehler beim Laden der Dokumenttyp-Klassifikationen --',
				value: '',
				description: `Fehler: ${getErrorMessage(error)}`,
			},
		];
	}
}

/**
 * Feldtyp aus dem ecoDMS-Wert ableiten
 */
function inferFieldType(fieldInfo: any, value: any): string {
	// Prüfe explizite Typ-Informationen
	if (fieldInfo && typeof fieldInfo === 'object') {
		if (fieldInfo.type) {
			const lowerType = fieldInfo.type.toLowerCase();
			switch (lowerType) {
				case 'boolean':
				case 'checkbox':
					return 'Boolean';
				case 'integer':
				case 'number':
				case 'decimal':
					return 'Number';
				case 'date':
				case 'datetime':
					return 'Date';
				default:
					return 'Text';
			}
		}

		// Prüfe basierend auf Feldnamen/Bezeichnungen
		const name = (fieldInfo.displayName || fieldInfo.name || fieldInfo.caption || '').toLowerCase();
		if (
			name.includes('bezahlt') ||
			name.includes('paid') ||
			name.includes('aktiv') ||
			name.includes('enabled') ||
			name.includes('ja/nein')
		) {
			return 'Boolean';
		}
		if (
			name.includes('datum') ||
			name.includes('date') ||
			name.includes('zeit') ||
			name.includes('time')
		) {
			return 'Date';
		}
		if (
			name.includes('nummer') ||
			name.includes('number') ||
			name.includes('anzahl') ||
			name.includes('count') ||
			name.includes('betrag') ||
			name.includes('amount')
		) {
			return 'Number';
		}
	}

	// Prüfe basierend auf dem Wert
	if (typeof value === 'string') {
		const lowerValue = value.toLowerCase();
		if (
			lowerValue === 'true' ||
			lowerValue === 'false' ||
			lowerValue === 'ja' ||
			lowerValue === 'nein' ||
			lowerValue === 'yes' ||
			lowerValue === 'no'
		) {
			return 'Boolean';
		}
		if (!Number.isNaN(Number(value)) && value.trim() !== '') {
			return 'Number';
		}
		// Datum-Pattern prüfen
		if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{2}[.\/]\d{2}[.\/]\d{4}/.test(value)) {
			return 'Date';
		}
	}

	return 'Text'; // Standard-Fallback
}

/**
 * Lädt verfügbare Custom Fields (dyn_*) aus den Klassifikationsattributen mit Feldtyp-Informationen
 */
export async function getCustomFields(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const credentials = (await this.getCredentials('ecoDmsApi')) as unknown as EcoDmsApiCredentials;

		// Versuche zuerst aus documentInfo eines existierenden Dokuments Custom Fields zu extrahieren
		const customFieldsMap = new Map<
			string,
			{ displayName: string; fieldType: string; fieldInfo: any }
		>();

		// Versuche mehrere Ansätze um Custom Fields zu finden
		const endpoints = [
			'classifyAttributes/detailInformation',
			'search?maxHits=1',
			'classifyAttributes',
		];

		for (const endpoint of endpoints) {
			try {
				const url = await getBaseUrl.call(this, endpoint);
				console.log(`Trying CustomFields-API-URL: ${url}`);

				const response = await this.helpers.httpRequest({
					url,
					method: 'GET',
					headers: {
						Accept: 'application/json',
					},
					json: true,
					auth: {
						username: credentials.username,
						password: credentials.password,
					},
				});

				console.log(
					`CustomFields Response from ${endpoint}:`,
					JSON.stringify(response).substring(0, 500),
				);

				if (response && typeof response === 'object') {
					// Verarbeite die Antwort je nach Endpoint
					if (endpoint === 'classifyAttributes/detailInformation') {
						// Detaillierte Informationen haben das Format: [{ success: true, data: { ... } }]
						if (
							Array.isArray(response) &&
							response.length > 0 &&
							response[0].success &&
							response[0].data
						) {
							console.log('Processing detailInformation response with success/data structure');
							await extractDynFieldsFromAttributes(response[0].data, customFieldsMap);
						} else if (typeof response === 'object') {
							// Direkte Datenstruktur
							console.log('Processing detailInformation response as direct object');
							await extractDynFieldsFromAttributes(response, customFieldsMap);
						}
					} else if (endpoint === 'search?maxHits=1') {
						// Aus Suchergebnissen extrahieren - oft haben diese vollständige Feldstrukturen
						if (Array.isArray(response) && response.length > 0) {
							const searchResult = response[0];
							if (searchResult?.classifyAttributes) {
								await extractDynFieldsFromAttributes(searchResult.classifyAttributes, customFieldsMap);
							}
						}
					} else {
						// Standard classifyAttributes
						await extractDynFieldsFromAttributes(response, customFieldsMap);
					}

					// Wenn wir Custom Fields gefunden haben, beende die Schleife
					if (customFieldsMap.size > 0) {
						console.log(`Found ${customFieldsMap.size} custom fields from ${endpoint}`);
						break;
					}
				}
			} catch (endpointError) {
				console.log(`Endpoint ${endpoint} failed:`, endpointError);
			}
		}

		// Falls noch keine gefunden, versuche documentInfo von einem beliebigen Dokument
		if (customFieldsMap.size === 0) {
			try {
				// Versuche documentInfo von Dokument ID 1 bis 10 zu holen
				for (let docId = 1; docId <= 10; docId++) {
					try {
						const docInfoUrl = await getBaseUrl.call(this, `documentInfo/${docId}`);
						const docInfoResponse = await this.helpers.httpRequest({
							url: docInfoUrl,
							method: 'GET',
							headers: {
								Accept: 'application/json',
							},
							json: true,
							auth: {
								username: credentials.username,
								password: credentials.password,
							},
						});

						if (Array.isArray(docInfoResponse) && docInfoResponse.length > 0) {
							const docInfo = docInfoResponse[0];
							if (docInfo?.classifyAttributes) {
								await extractDynFieldsFromAttributes(docInfo.classifyAttributes, customFieldsMap);

								if (customFieldsMap.size > 0) {
									console.log(`Found ${customFieldsMap.size} custom fields from documentInfo/${docId}`);
									break;
								}
							}
						}
					} catch (docError) {
						// Ignore einzelne Dokument-Fehler
					}
				}
			} catch (error) {
				console.log('DocumentInfo Fallback fehlgeschlagen:', error);
			}
		}

		// Custom Fields in das erforderliche Format konvertieren
		const options: INodePropertyOptions[] = [];

		// Auto-Option als erstes Element
		options.push({
			name: '-- Bitte auswählen --',
			value: '',
			description: 'Bitte ein Custom Field auswählen',
		});

		// Gefundene Custom Fields hinzufügen - ALLE Typen anzeigen
		for (const [key, fieldData] of customFieldsMap.entries()) {
			const typeDisplay = fieldData.fieldType || 'Text';

			options.push({
				name: `${fieldData.displayName} (${typeDisplay})`,
				value: key,
				description: `${fieldData.displayName} - Typ: ${typeDisplay} (${key})`,
			});
		}

		// Wenn immer noch keine Custom Fields gefunden wurden, zeige Standard-Beispiele
		if (options.length === 1) {
			console.log('Keine Custom Fields (dyn_*) gefunden, verwende Standard-Beispiele');
			return getDefaultCustomFields();
		}

		// Nach Namen sortieren (außer dem ersten Element)
		if (options.length > 1) {
			const autoOption = options.shift();
			options.sort((a, b) => a.name.localeCompare(b.name));
			options.unshift(autoOption!);
		}

		console.log(`${options.length} Custom Field-Optionen mit korrekten Feldtypen geladen`);
		return options;
	} catch (error: unknown) {
		console.error('Fehler beim Abrufen der Custom Fields:', error);
		console.log('Verwende Standard-Custom-Fields als Fallback');
		return getDefaultCustomFields();
	}
}

/**
 * Hilfsfunktion um dyn_* Felder aus classifyAttributes zu extrahieren
 */
async function extractDynFieldsFromAttributes(
	attributes: any,
	customFieldsMap: Map<string, { displayName: string; fieldType: string; fieldInfo: any }>,
): Promise<void> {
	if (!attributes || typeof attributes !== 'object') {
		return;
	}

	for (const [key, value] of Object.entries(attributes)) {
		if (key.startsWith('dyn_')) {
			let fieldType = 'Text';
			let displayName = key;

			// Prüfe ob es die detaillierte API-Struktur ist
			if (value && typeof value === 'object' && 'fieldType' in value) {
				const fieldInfo = value as any;

				// Nutze den korrekten fieldName aus der API
				displayName = fieldInfo.fieldName || fieldInfo.displayName || key;

				// Verbessere Display-Namen für wichtige Felder um Klarheit zu schaffen
				const improvedDisplayNames: { [key: string]: string } = {
					defdate: 'Wiedervorlagedatum',
					cdate: 'Dokumentendatum',
					ctimestamp: 'Erstellungsdatum',
					changeid: 'Bearbeiter',
					docid: 'Dokument-ID',
					docart: 'Dokumentenart',
					folder: 'Ordner',
					mainfolder: 'Hauptordner',
					status: 'Status',
					bemerkung: 'Bemerkung',
					revision: 'Revision',
					rechte: 'Berechtigung',
				};

				// Nutze verbesserte Namen falls verfügbar
				if (improvedDisplayNames[fieldInfo.fieldID || key]) {
					displayName = improvedDisplayNames[fieldInfo.fieldID || key];
				}

				// Mappe ecoDMS Feldtypen zu n8n-kompatible Typen
				switch (fieldInfo.fieldType) {
					case 'eco_CheckBox':
						fieldType = 'Boolean';
						break;
					case 'eco_ComboBox':
						// ComboBox mit verfügbaren Optionen
						if (fieldInfo.classificationContent && Array.isArray(fieldInfo.classificationContent)) {
							fieldType = `ComboBox (${fieldInfo.classificationContent.length} Optionen)`;
						} else {
							fieldType = 'ComboBox';
						}
						break;
					case 'eco_DateField':
						fieldType = 'Date';
						break;
					default: {
						// Erweiterte Typ-Inferenz basierend auf displayName für TextField
						const lowerDisplayName = displayName.toLowerCase();
						if (
							lowerDisplayName.includes('betrag') ||
							lowerDisplayName.includes('amount') ||
							lowerDisplayName.includes('preis') ||
							lowerDisplayName.includes('kosten') ||
							lowerDisplayName.includes('summe') ||
							lowerDisplayName.includes('wert')
						) {
							fieldType = 'Number';
						} else if (lowerDisplayName.includes('datum') || lowerDisplayName.includes('date')) {
							fieldType = 'Date';
						} else if (
							lowerDisplayName.includes('aktiv') ||
							lowerDisplayName.includes('bezahlt') ||
							lowerDisplayName.includes('paid') ||
							lowerDisplayName.includes('enabled')
						) {
							fieldType = 'Boolean';
						} else {
							fieldType = 'Text';
						}
						break;
					}
				}

				customFieldsMap.set(key, {
					displayName: displayName,
					fieldType,
					fieldInfo: {
						key,
						originalFieldType: fieldInfo.fieldType,
						classificationContent: fieldInfo.classificationContent,
						fieldID: fieldInfo.fieldID,
						fieldName: fieldInfo.fieldName,
					},
				});
			} else {
				// Fallback für einfache Wert-Strukturen
				// Versuche Typ aus dem Feldnamen zu ermitteln
				const lowerKey = key.toLowerCase();
				if (lowerKey.includes('datum') || lowerKey.includes('date')) {
					fieldType = 'Date';
					displayName = key.replace(/dyn_\d+_/, '').replace(/_/g, ' ');
				} else if (
					lowerKey.includes('betrag') ||
					lowerKey.includes('amount') ||
					lowerKey.includes('nummer') ||
					lowerKey.includes('number')
				) {
					fieldType = 'Number';
					displayName = key.replace(/dyn_\d+_/, '').replace(/_/g, ' ');
				} else if (
					lowerKey.includes('aktiv') ||
					lowerKey.includes('bezahlt') ||
					lowerKey.includes('paid') ||
					lowerKey.includes('enabled')
				) {
					fieldType = 'Boolean';
					displayName = key.replace(/dyn_\d+_/, '').replace(/_/g, ' ');
				} else {
					// Versuche Typ aus dem Wert zu ermitteln
					fieldType = inferFieldType(null, value);
					displayName = key.replace(/dyn_\d+_/, '').replace(/_/g, ' ');
				}

				// Fallback für leere displayNames
				if (!displayName || displayName.trim() === '') {
					displayName = key;
				}

				customFieldsMap.set(key, {
					displayName: displayName,
					fieldType,
					fieldInfo: { key, value, originalValue: value },
				});
			}
		}
	}
}

/**
 * Lädt Feldtyp-Informationen für ein spezifisches Custom Field
 */
export async function getCustomFieldType(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const fieldName = this.getCurrentNodeParameter('fieldName') as any;
		const actualFieldName = fieldName?.value || fieldName;

		if (!actualFieldName || !actualFieldName.startsWith('dyn_')) {
			return [
				{ name: 'Text', value: 'string', description: 'Standard Text-Feld' },
				{ name: 'Number', value: 'number', description: 'Numerisches Feld' },
				{ name: 'Boolean', value: 'boolean', description: 'Ja/Nein-Feld' },
				{ name: 'Date', value: 'dateTime', description: 'Datum/Zeit-Feld' },
				{ name: 'Options', value: 'options', description: 'Auswahl aus Liste' },
			];
		}

		// Hole Custom Field Informationen aus dem Cache
		const customFieldsMap = new Map();

		// Versuche mehrere Ansätze um Custom Fields zu finden
		const endpoints = [
			'classifyAttributes/detailInformation',
			'search?maxHits=1',
			'classifyAttributes',
		];

		for (const endpoint of endpoints) {
			try {
				const url = await getBaseUrl.call(this, endpoint);
				const credentials = (await this.getCredentials('ecoDmsApi')) as unknown as EcoDmsApiCredentials;

				const response = await this.helpers.httpRequest({
					url,
					method: 'GET',
					headers: {
						Accept: 'application/json',
					},
					json: true,
					auth: {
						username: credentials.username,
						password: credentials.password,
					},
				});

				if (response) {
					await extractDynFieldsFromAttributes(response, customFieldsMap);
					if (customFieldsMap.size > 0) break;
				}
			} catch (error) {
				console.log(`Endpoint ${endpoint} failed:`, error);
			}
		}

		const fieldInfo = customFieldsMap.get(actualFieldName);
		if (fieldInfo) {
			// Mappe ecoDMS-Typen zu korrekten n8n-Typen
			let n8nType = 'string';
			let recommendedName = 'Text';

			if (fieldInfo.fieldInfo?.originalFieldType) {
				switch (fieldInfo.fieldInfo.originalFieldType) {
					case 'eco_CheckBox':
						n8nType = 'boolean';
						recommendedName = 'Boolean';
						break;
					case 'eco_ComboBox':
						n8nType = 'options';
						recommendedName = 'Options';
						break;
					case 'eco_DateField':
						n8nType = 'dateTime';
						recommendedName = 'Date';
						break;
					default:
						n8nType = 'string';
						recommendedName = 'Text';
						break;
				}
			}

			return [
				{
					name: `${recommendedName} (empfohlen)`,
					value: n8nType,
					description: `Empfohlener Typ für "${fieldInfo.displayName}"`,
				},
				{ name: 'Text', value: 'string', description: 'Standard Text-Feld' },
				{ name: 'Number', value: 'number', description: 'Numerisches Feld' },
				{ name: 'Boolean', value: 'boolean', description: 'Ja/Nein-Feld' },
				{ name: 'Date', value: 'dateTime', description: 'Datum/Zeit-Feld' },
				{ name: 'Options', value: 'options', description: 'Auswahl aus Liste' },
			].filter((option, index, self) => self.findIndex((o) => o.value === option.value) === index);
		}

		const credentials = (await this.getCredentials('ecoDmsApi')) as unknown as EcoDmsApiCredentials;

		// Versuche detaillierte Informationen für das spezifische Feld zu bekommen
		const detailUrl = await getBaseUrl.call(this, 'classifyAttributes/detailInformation');

		const response = await this.helpers.httpRequest({
			url: detailUrl,
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			json: true,
			auth: {
				username: credentials.username,
				password: credentials.password,
			},
		});

		if (response?.[actualFieldName]) {
			const fieldInfo = response[actualFieldName];
			const inferredType = inferFieldType(fieldInfo, fieldInfo.value || fieldInfo.defaultValue);

			// Empfohlenen Typ an erste Stelle setzen
			const options = [
				{
					name: `${inferredType} (empfohlen)`,
					value: inferredType.toLowerCase(),
					description: 'Empfohlener Typ basierend auf Feldanalyse',
				},
			];

			// Andere Optionen hinzufügen
			const allTypes = [
				{ name: 'Text', value: 'string', description: 'Standard Text-Feld' },
				{ name: 'Number', value: 'number', description: 'Numerisches Feld' },
				{ name: 'Boolean', value: 'boolean', description: 'Ja/Nein-Feld' },
				{ name: 'Date', value: 'dateTime', description: 'Datum/Zeit-Feld' },
			];

			for (const type of allTypes) {
				if (type.value !== inferredType.toLowerCase()) {
					options.push(type);
				}
			}

			return options;
		}

		// Fallback wenn keine spezifischen Informationen verfügbar sind
		return [
			{ name: 'Text', value: 'string', description: 'Standard Text-Feld' },
			{ name: 'Number', value: 'number', description: 'Numerisches Feld' },
			{ name: 'Boolean', value: 'boolean', description: 'Ja/Nein-Feld' },
			{ name: 'Date', value: 'dateTime', description: 'Datum/Zeit-Feld' },
		];
	} catch (error: unknown) {
		console.error('Fehler beim Abrufen der Feldtyp-Informationen:', error);
		return [
			{ name: 'Text', value: 'string', description: 'Standard Text-Feld' },
			{ name: 'Number', value: 'number', description: 'Numerisches Feld' },
			{ name: 'Boolean', value: 'boolean', description: 'Ja/Nein-Feld' },
			{ name: 'Date', value: 'dateTime', description: 'Datum/Zeit-Feld' },
		];
	}
}

/**
 * Lädt die verfügbaren Optionen für ComboBox Custom Fields
 */
export async function getComboBoxOptions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const fieldName = this.getCurrentNodeParameter('fieldName') as any;
		const actualFieldName = fieldName?.value || fieldName;

		console.log('=== DEBUG getComboBoxOptions ===');
		console.log('fieldName:', fieldName);
		console.log('actualFieldName:', actualFieldName);

		if (!actualFieldName || !actualFieldName.startsWith('dyn_')) {
			console.log('Field name invalid, returning empty array');
			return [];
		}

		// Hole Custom Field Informationen
		const customFieldsMap = new Map();

		// Versuche mehrere Ansätze um Custom Fields zu finden
		const endpoints = [
			'classifyAttributes/detailInformation',
			'search?maxHits=1',
			'classifyAttributes',
		];

		for (const endpoint of endpoints) {
			try {
				const url = await getBaseUrl.call(this, endpoint);
				const credentials = (await this.getCredentials('ecoDmsApi')) as unknown as EcoDmsApiCredentials;

				const response = await this.helpers.httpRequest({
					url,
					method: 'GET',
					headers: {
						Accept: 'application/json',
					},
					json: true,
					auth: {
						username: credentials.username,
						password: credentials.password,
					},
				});

				if (response) {
					await extractDynFieldsFromAttributes(response, customFieldsMap);
					if (customFieldsMap.size > 0) break;
				}
			} catch (error) {
				console.log(`Endpoint ${endpoint} failed:`, error);
			}
		}

		const fieldInfo = customFieldsMap.get(actualFieldName);
		console.log('fieldInfo found:', fieldInfo);
		console.log('classificationContent:', fieldInfo?.fieldInfo?.classificationContent);

		if (
			fieldInfo?.fieldInfo?.classificationContent &&
			Array.isArray(fieldInfo.fieldInfo.classificationContent)
		) {
			const options = fieldInfo.fieldInfo.classificationContent.map((option: any) => ({
				name: option,
				value: option,
				description: `Option: ${option}`,
			}));
			console.log('Returning options:', options);
			return options;
		}

		console.log('No classification content found, returning empty array');
		return [];
	} catch (error: unknown) {
		console.error('Fehler beim Abrufen der ComboBox-Optionen:', error);
		return [];
	}
}

/**
 * Standard Custom Fields als Fallback wenn API nicht verfügbar ist
 */
function getDefaultCustomFields(): INodePropertyOptions[] {
	return [
		{
			name: '-- Bitte auswählen --',
			value: '',
			description: 'Bitte ein Custom Field auswählen',
		},
		{
			name: 'Beispiel: Kundennummer',
			value: 'dyn_0_customer_number',
			description: 'Benutzerdefinierte Kundennummer',
		},
		{
			name: 'Beispiel: Projektnummer',
			value: 'dyn_1_project_number',
			description: 'Benutzerdefinierte Projektnummer',
		},
		{
			name: 'Beispiel: Kostenstelle',
			value: 'dyn_2_cost_center',
			description: 'Benutzerdefinierte Kostenstelle',
		},
		{
			name: 'Beispiel: Abteilung',
			value: 'dyn_3_department',
			description: 'Benutzerdefinierte Abteilung',
		},
		{
			name: 'Beispiel: Priorität',
			value: 'dyn_4_priority',
			description: 'Benutzerdefinierte Priorität',
		},
		{
			name: 'Manuell eingeben...',
			value: 'manual',
			description: 'Custom Field Namen manuell eingeben (dyn_*)',
		},
	];
}

/**
 * Lädt verfügbare Benutzer aus ecoDMS über die Rollen-API
 */
export async function getUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const credentials = (await this.getCredentials('ecoDmsApi')) as unknown as EcoDmsApiCredentials;

		// Versuche zuerst die Rollen-API
		const rolesUrl = await getBaseUrl.call(this, 'roles');
		console.log(`Roles-API-URL: ${rolesUrl}`);

		const rolesResponse = await this.helpers.httpRequest({
			url: rolesUrl,
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			json: true,
			auth: {
				username: credentials.username,
				password: credentials.password,
			},
		});

		console.log('Roles-API-Antwort:', JSON.stringify(rolesResponse).substring(0, 200));

		const users: Set<string> = new Set();

		if (Array.isArray(rolesResponse)) {
			// Filtere Benutzer-Rollen (normalerweise beginnen sie mit "r_" oder sind LDAP-Benutzer)
			const userRoles = rolesResponse.filter(
				(role: string) =>
					role.startsWith('r_') ||
					role.startsWith('LDAP_r_') ||
					(!role.startsWith('eco') &&
						!role.startsWith('LDAP_r_') &&
						role !== 'Management' &&
						role !== 'scanner'),
			);

			console.log(`Gefundene Benutzer-Rollen: ${userRoles.length}`);

			// Für jede Benutzer-Rolle versuchen wir die tatsächlichen Benutzer abzurufen
			for (const role of userRoles.slice(0, 5)) {
				// Limitiere auf erste 5 Rollen
				try {
					const usersForRoleUrl = await getBaseUrl.call(
						this,
						`usersForRole/${encodeURIComponent(role)}`,
					);
					const usersResponse = await this.helpers.httpRequest({
						url: usersForRoleUrl,
						method: 'GET',
						headers: {
							Accept: 'application/json',
						},
						json: true,
						auth: {
							username: credentials.username,
							password: credentials.password,
						},
					});

					if (Array.isArray(usersResponse)) {
						for (const username of usersResponse) {
							users.add(username);
						}
					}
				} catch (error) {
					console.log(`Fehler beim Abrufen der Benutzer für Rolle ${role}:`, error);
				}
			}
		}

		// Benutzer in das erforderliche Format konvertieren
		const options: INodePropertyOptions[] = [];

		// Auto-Option als erstes Element
		options.push({
			name: '-- Bitte auswählen --',
			value: '',
			description: 'Bitte einen Benutzer auswählen',
		});

		// Konvertiere Set zu Array und sortiere
		const userArray = Array.from(users).sort();

		for (const username of userArray) {
			options.push({
				name: username,
				value: username,
				description: `ecoDMS Benutzer: ${username}`,
			});
		}

		if (options.length > 1) {
			console.log(`${options.length - 1} Benutzer aus ecoDMS-Rollen geladen`);
			return options;
		}

		console.log('Keine Benutzer aus Rollen gefunden, verwende Standard-Beispiele');
		return getDefaultUsers();
	} catch (error: unknown) {
		console.error('Fehler beim Abrufen der Benutzer über Rollen-API:', error);
		console.log('Verwende Standard-Benutzer als Fallback');
		return getDefaultUsers();
	}
}

/**
 * Standard Benutzer als Fallback
 */
function getDefaultUsers(): INodePropertyOptions[] {
	return [
		{
			name: '-- Bitte auswählen --',
			value: '',
			description: 'Bitte einen Benutzer auswählen',
		},
		{
			name: 'Admin',
			value: 'admin',
			description: 'Administrator-Benutzer',
		},
		{
			name: 'Elite',
			value: 'elite',
			description: 'Elite-Benutzer',
		},
		{
			name: 'User',
			value: 'user',
			description: 'Standard-Benutzer',
		},
		{
			name: 'Gast',
			value: 'guest',
			description: 'Gast-Benutzer',
		},
		{
			name: 'Manuell eingeben...',
			value: 'manual',
			description: 'Benutzer-ID manuell eingeben',
		},
	];
}

/**
 * Lädt verfügbare Gruppen aus ecoDMS über die Rollen-API
 */
export async function getGroups(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const credentials = (await this.getCredentials('ecoDmsApi')) as unknown as EcoDmsApiCredentials;

		// Verwende die Rollen-API um Gruppen zu finden
		const rolesUrl = await getBaseUrl.call(this, 'roles');
		console.log(`Groups-Roles-API-URL: ${rolesUrl}`);

		const rolesResponse = await this.helpers.httpRequest({
			url: rolesUrl,
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			json: true,
			auth: {
				username: credentials.username,
				password: credentials.password,
			},
		});

		console.log('Groups-Roles-API-Antwort:', JSON.stringify(rolesResponse).substring(0, 200));

		const groups: Set<string> = new Set();

		if (Array.isArray(rolesResponse)) {
			// Filtere Gruppen-Rollen (normalerweise Custom-Rollen die keine System-Rollen sind)
			const groupRoles = rolesResponse.filter(
				(role: string) =>
					!role.startsWith('eco') && // Keine System-Rollen
					!role.startsWith('r_') && // Keine einzelnen Benutzer-Rollen
					!role.startsWith('LDAP_r_') && // Keine LDAP-Benutzer-Rollen
					role !== 'scanner', // Scanner ist ein Benutzer, keine Gruppe
			);

			console.log(`Gefundene Gruppen-Rollen: ${groupRoles.length}`);

			// Alle Gruppen-Rollen als Gruppen hinzufügen
			for (const role of groupRoles) {
				groups.add(role);
			}

			// Zusätzlich LDAP-Gruppen suchen
			const ldapGroups = rolesResponse.filter(
				(role: string) =>
					role.startsWith('r_LDAP_') || // LDAP-Gruppen
					(role.startsWith('LDAP_') && !role.startsWith('LDAP_r_')), // Andere LDAP-Einträge
			);

			for (const role of ldapGroups) {
				groups.add(role);
			}
		}

		// Gruppen in das erforderliche Format konvertieren
		const options: INodePropertyOptions[] = [];

		// Auto-Option als erstes Element
		options.push({
			name: '-- Bitte auswählen --',
			value: '',
			description: 'Bitte eine Gruppe auswählen',
		});

		// Konvertiere Set zu Array und sortiere
		const groupArray = Array.from(groups).sort();

		for (const groupName of groupArray) {
			let displayName = groupName;
			let description = `ecoDMS Gruppe: ${groupName}`;

			// Spezielle Behandlung für LDAP-Gruppen
			if (groupName.startsWith('r_LDAP_')) {
				displayName = groupName.replace('r_LDAP_', 'LDAP: ');
				description = `LDAP-Gruppe: ${groupName}`;
			} else if (groupName.startsWith('LDAP_')) {
				displayName = groupName.replace('LDAP_', 'LDAP: ');
				description = `LDAP-Gruppe: ${groupName}`;
			}

			options.push({
				name: displayName,
				value: groupName,
				description: description,
			});
		}

		if (options.length > 1) {
			console.log(`${options.length - 1} Gruppen aus ecoDMS-Rollen geladen`);
			return options;
		}

		console.log('Keine Gruppen aus Rollen gefunden, verwende Standard-Beispiele');
		return getDefaultGroups();
	} catch (error: unknown) {
		console.error('Fehler beim Abrufen der Gruppen über Rollen-API:', error);
		console.log('Verwende Standard-Gruppen als Fallback');
		return getDefaultGroups();
	}
}

/**
 * Standard Gruppen als Fallback
 */
function getDefaultGroups(): INodePropertyOptions[] {
	return [
		{
			name: '-- Bitte auswählen --',
			value: '',
			description: 'Bitte eine Gruppe auswählen',
		},
		{
			name: 'Elite',
			value: 'elite',
			description: 'Elite-Gruppe',
		},
		{
			name: 'Administratoren',
			value: 'admin',
			description: 'Administrator-Gruppe',
		},
		{
			name: 'Benutzer',
			value: 'users',
			description: 'Standard-Benutzergruppe',
		},
		{
			name: 'Gäste',
			value: 'guests',
			description: 'Gast-Gruppe',
		},
		{
			name: 'Abteilung 1',
			value: 'dept1',
			description: 'Abteilung 1',
		},
		{
			name: 'Manuell eingeben...',
			value: 'manual',
			description: 'Gruppen-ID manuell eingeben',
		},
	];
}
