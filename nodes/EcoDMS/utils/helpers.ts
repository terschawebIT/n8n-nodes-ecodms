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
