import { IDataObject, IExecuteFunctions, ILoadOptionsFunctions, ICredentialDataDecryptedObject, INodePropertyOptions } from 'n8n-workflow';

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
	const credentials = await this.getCredentials('ecoDmsApi') as unknown as EcoDmsApiCredentials;
	if (!credentials.serverUrl) {
		throw new Error('Server-URL ist nicht konfiguriert. Bitte in den Anmeldedaten angeben.');
	}
	
	// Sicherstellen, dass die URL mit einem Slash endet
	const serverUrl = credentials.serverUrl;
	const baseUrl = serverUrl.endsWith('/') ? serverUrl : `${serverUrl}/`;
	
	// API-Endpunkt hinzufügen
	return `${baseUrl}api/${endpoint}`;
}

/**
 * Erstellt die HTTP-Auth-Optionen für ecoDMS-API-Anfragen
 */
export async function getAuthOptions(
	this: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<{ username: string; password: string }> {
	const credentials = await this.getCredentials('ecoDmsApi') as unknown as EcoDmsApiCredentials;
	
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
	
	return input.split(',')
		.map(id => id.trim())
		.filter(id => id !== '')
		.map(id => parseInt(id, 10))
		.filter(id => !isNaN(id));
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
export async function getFolders(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const credentials = await this.getCredentials('ecoDmsApi') as unknown as EcoDmsApiCredentials;
		
		// API-Aufruf, um Ordner abzurufen
		const response = await this.helpers.httpRequest({
			url: `${credentials.serverUrl}/api/folders`,
			method: 'GET',
			headers: {
				'Accept': 'application/json',
			},
			json: true,
			auth: {
				username: credentials.username,
				password: credentials.password,
			},
		});
		
		if (!Array.isArray(response)) {
			throw new Error('Unerwartetes Antwortformat beim Abrufen der Ordner');
		}
		
		// Ordner in das erforderliche Format konvertieren
		const options: INodePropertyOptions[] = [];
		
		// Auto-Option als erstes Element
		options.push({
			name: '-- Automatisch --',
			value: 'auto',
			description: 'Automatische Auswahl',
		});
		
		for (const folder of response) {
			options.push({
				name: folder.name || `Ordner ${folder.id}`,
				value: folder.id.toString(),
				description: folder.description || '',
			});
		}
		
		// Nach Namen sortieren (außer dem ersten Element)
		if (options.length > 1) {
			const autoOption = options.shift();
			options.sort((a, b) => a.name.localeCompare(b.name));
			options.unshift(autoOption!);
		}
		
		return options;
	} catch (error) {
		console.error('Fehler beim Abrufen der Ordner:', error);
		return [{
			name: '-- Automatisch --',
			value: 'auto',
			description: 'Automatische Auswahl',
		}];
	}
}

/**
 * Lädt die verfügbaren Dokumentarten aus ecoDMS für Dropdown-Menüs
 */
export async function getDocumentTypes(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const credentials = await this.getCredentials('ecoDmsApi') as unknown as EcoDmsApiCredentials;
		
		// API-Aufruf, um Dokumentarten abzurufen
		const response = await this.helpers.httpRequest({
			url: `${credentials.serverUrl}/api/types`,
			method: 'GET',
			headers: {
				'Accept': 'application/json',
			},
			json: true,
			auth: {
				username: credentials.username,
				password: credentials.password,
			},
		});
		
		if (!Array.isArray(response)) {
			throw new Error('Unerwartetes Antwortformat beim Abrufen der Dokumentarten');
		}
		
		// Dokumentarten in das erforderliche Format konvertieren
		const options: INodePropertyOptions[] = [];
		
		// Auto-Option als erstes Element
		options.push({
			name: '-- Automatisch --',
			value: 'auto',
			description: 'Automatische Auswahl',
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
		
		return options;
	} catch (error) {
		console.error('Fehler beim Abrufen der Dokumentarten:', error);
		return [{
			name: '-- Automatisch --',
			value: 'auto',
			description: 'Automatische Auswahl',
		}];
	}
}

/**
 * Lädt die verfügbaren Status-Werte aus ecoDMS für Dropdown-Menüs
 */
export async function getStatusValues(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		const credentials = await this.getCredentials('ecoDmsApi') as unknown as EcoDmsApiCredentials;
		
		// API-Aufruf, um Status-Werte abzurufen
		const response = await this.helpers.httpRequest({
			url: `${credentials.serverUrl}/api/status`,
			method: 'GET',
			headers: {
				'Accept': 'application/json',
			},
			json: true,
			auth: {
				username: credentials.username,
				password: credentials.password,
			},
		});
		
		if (!Array.isArray(response)) {
			throw new Error('Unerwartetes Antwortformat beim Abrufen der Status-Werte');
		}
		
		// Status-Werte in das erforderliche Format konvertieren
		const options: INodePropertyOptions[] = [];
		
		// Auto-Option als erstes Element
		options.push({
			name: '-- Automatisch --',
			value: 'auto',
			description: 'Automatische Auswahl',
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
		
		return options;
	} catch (error) {
		console.error('Fehler beim Abrufen der Status-Werte:', error);
		return [{
			name: '-- Automatisch --',
			value: 'auto',
			description: 'Automatische Auswahl',
		}];
	}
} 