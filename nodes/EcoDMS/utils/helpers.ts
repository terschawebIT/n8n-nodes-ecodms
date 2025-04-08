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
			url: `${credentials.serverUrl}/api/getFolders`,
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
		
		for (const folder of response) {
			options.push({
				name: folder.name || `Ordner ${folder.id}`,
				value: folder.id.toString(),
				description: folder.description || '',
			});
		}
		
		// Nach Namen sortieren
		options.sort((a, b) => a.name.localeCompare(b.name));
		
		return options;
	} catch (error) {
		console.error('Fehler beim Abrufen der Ordner:', error);
		return [{ name: 'Fehler beim Laden der Ordner', value: '' }];
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
			url: `${credentials.serverUrl}/api/getTypes`,
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
		
		for (const docType of response) {
			options.push({
				name: docType.name || `Typ ${docType.id}`,
				value: docType.id.toString(),
				description: docType.description || '',
			});
		}
		
		// Nach Namen sortieren
		options.sort((a, b) => a.name.localeCompare(b.name));
		
		return options;
	} catch (error) {
		console.error('Fehler beim Abrufen der Dokumentarten:', error);
		return [{ name: 'Fehler beim Laden der Dokumentarten', value: '' }];
	}
}

/**
 * Lädt die verfügbaren Status-Werte aus ecoDMS für Dropdown-Menüs
 */
export async function getStatusValues(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	try {
		// Da es keine spezifische API für Status-Werte gibt, verwenden wir fixe Werte
		// Diese sollten an die in ecoDMS verfügbaren Status angepasst werden
		const statusOptions: INodePropertyOptions[] = [
			{ name: 'Neu', value: 'neu' },
			{ name: 'In Bearbeitung', value: 'in_bearbeitung' },
			{ name: 'Abgeschlossen', value: 'abgeschlossen' },
			{ name: 'Archiviert', value: 'archiviert' },
			{ name: 'Freigegeben', value: 'freigegeben' },
			{ name: 'Geprüft', value: 'geprueft' },
		];
		
		return statusOptions;
	} catch (error) {
		console.error('Fehler beim Abrufen der Status-Werte:', error);
		return [{ name: 'Fehler beim Laden der Status-Werte', value: '' }];
	}
} 