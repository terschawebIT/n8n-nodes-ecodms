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

		// Versuche verschiedene API-Endpoints für Custom Fields
		const endpoints = ['classifyAttributes/detailInformation', 'classifyAttributes'];
		const customFieldsMap = new Map<
			string,
			{ displayName: string; fieldType: string; fieldInfo: any }
		>();

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
					JSON.stringify(response).substring(0, 400),
				);

				if (response && typeof response === 'object') {
					// Verarbeite die Antwort basierend auf dem Endpoint
					if (endpoint === 'classifyAttributes/detailInformation') {
						// Detaillierte Informationen verarbeiten
						for (const [key, value] of Object.entries(response)) {
							if (key.startsWith('dyn_')) {
								if (typeof value === 'object' && value !== null) {
									const fieldInfo = value as any;
									const displayName =
										fieldInfo.displayName || fieldInfo.name || fieldInfo.caption || fieldInfo.label;
									if (displayName) {
										const fieldType = inferFieldType(fieldInfo, null);
										customFieldsMap.set(key, { displayName, fieldType, fieldInfo });
									}
								} else if (typeof value === 'string' && value.trim()) {
									const fieldType = inferFieldType(null, value);
									customFieldsMap.set(key, { displayName: value, fieldType, fieldInfo: null });
								}
							}
						}
					} else if (endpoint === 'classifyAttributes') {
						// Einfache Klassifikationsattribute verarbeiten
						if (Array.isArray(response)) {
							for (const item of response) {
								if (item && typeof item === 'object') {
									const key = item.name || item.id || item.key;
									const displayName = item.displayName || item.label || item.caption || item.description;
									if (key?.startsWith('dyn_') && displayName) {
										const fieldType = inferFieldType(item, item.value || item.defaultValue);
										customFieldsMap.set(key, { displayName, fieldType, fieldInfo: item });
									}
								}
							}
						} else {
							// Object-Format verarbeiten
							for (const [key, value] of Object.entries(response)) {
								if (key.startsWith('dyn_')) {
									if (typeof value === 'string' && value.trim()) {
										const fieldType = inferFieldType(null, value);
										customFieldsMap.set(key, { displayName: value, fieldType, fieldInfo: null });
									} else if (typeof value === 'object' && value !== null) {
										const fieldInfo = value as any;
										const displayName =
											fieldInfo.displayName || fieldInfo.name || fieldInfo.caption || fieldInfo.label;
										if (displayName) {
											const fieldType = inferFieldType(fieldInfo, fieldInfo.value || fieldInfo.defaultValue);
											customFieldsMap.set(key, { displayName, fieldType, fieldInfo });
										}
									}
								}
							}
						}
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

		// Custom Fields in das erforderliche Format konvertieren
		const options: INodePropertyOptions[] = [];

		// Auto-Option als erstes Element
		options.push({
			name: '-- Bitte auswählen --',
			value: '',
			description: 'Bitte ein Custom Field auswählen',
		});

		// Gefundene Custom Fields hinzufügen
		for (const [key, fieldData] of customFieldsMap.entries()) {
			options.push({
				name: `${fieldData.displayName} (${fieldData.fieldType})`,
				value: key,
				description: `${fieldData.displayName} - Typ: ${fieldData.fieldType} (${key})`,
			});
		}

		// Wenn keine Custom Fields gefunden wurden, zeige Standard-Beispiele
		if (options.length === 1) {
			console.log(
				'Keine Custom Fields (dyn_*) in den API-Antworten gefunden, verwende Standard-Beispiele',
			);
			return getDefaultCustomFields();
		}

		// Nach Namen sortieren (außer dem ersten Element)
		if (options.length > 1) {
			const autoOption = options.shift();
			options.sort((a, b) => a.name.localeCompare(b.name));
			options.unshift(autoOption!);
		}

		console.log(`${options.length} Custom Field-Optionen mit Feldtypen geladen`);
		return options;
	} catch (error: unknown) {
		console.error('Fehler beim Abrufen der Custom Fields:', error);
		console.log('Verwende Standard-Custom-Fields als Fallback');
		return getDefaultCustomFields();
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
			];
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
