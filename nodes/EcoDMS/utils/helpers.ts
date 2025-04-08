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
		
		// Konstruiere die korrekte URL über die Hilfsfunktion
		// Der korrekte API-Endpunkt ist 'folders' (Plural) laut Dokumentation
		const url = await getBaseUrl.call(this, 'folders');
		
		console.log('Folders-API-URL:', url);
		
		// API-Aufruf, um Ordner abzurufen
		const response = await this.helpers.httpRequest({
			url,
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
		
		console.log('Folders-API-Antwort:', JSON.stringify(response).substring(0, 200));
		
		if (!Array.isArray(response)) {
			console.error(`Unerwartetes Antwortformat beim Abrufen der Ordner: ${JSON.stringify(response).substring(0, 200)}`);
			// Statt eine Exception zu werfen, geben wir ein Standard-Fallback zurück
			return [
				{
					name: '-- Fehler beim Laden der Ordner --',
					value: '',
					description: 'Ordner konnten nicht geladen werden, bitte prüfen Sie die Logs',
				}
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
		
		console.log(`${options.length} Ordner-Optionen geladen`);
		return options;
	} catch (error) {
		console.error('Fehler beim Abrufen der Ordner:', error);
		
		// Statt eine Exception zu werfen, geben wir ein Standard-Fallback zurück
		return [
			{
				name: '-- Fehler beim Laden der Ordner --',
				value: '',
				description: `Fehler: ${error.message}`,
			}
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
		const credentials = await this.getCredentials('ecoDmsApi') as unknown as EcoDmsApiCredentials;
		
		// Konstruiere die korrekte URL über die Hilfsfunktion
		const url = await getBaseUrl.call(this, 'types');
		
		console.log('DocumentTypes-API-URL:', url);
		
		// API-Aufruf, um Dokumentarten abzurufen
		const response = await this.helpers.httpRequest({
			url,
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
		
		console.log('DocumentTypes-API-Antwort:', JSON.stringify(response).substring(0, 200));
		
		if (!Array.isArray(response)) {
			console.error(`Unerwartetes Antwortformat beim Abrufen der Dokumentarten: ${JSON.stringify(response).substring(0, 200)}`);
			// Statt eine Exception zu werfen, geben wir ein Standard-Fallback zurück
			return [
				{
					name: '-- Fehler beim Laden der Dokumentarten --',
					value: '',
					description: 'Dokumentarten konnten nicht geladen werden, bitte prüfen Sie die Logs',
				}
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
	} catch (error) {
		console.error('Fehler beim Abrufen der Dokumentarten:', error);
		
		// Statt eine Exception zu werfen, geben wir ein Standard-Fallback zurück
		return [
			{
				name: '-- Fehler beim Laden der Dokumentarten --',
				value: '',
				description: `Fehler: ${error.message}`,
			}
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
		const credentials = await this.getCredentials('ecoDmsApi') as unknown as EcoDmsApiCredentials;
		
		// Konstruiere die korrekte URL über die Hilfsfunktion
		const url = await getBaseUrl.call(this, 'status');
		
		console.log('Status-API-URL:', url);
		
		// API-Aufruf, um Status-Werte abzurufen
		const response = await this.helpers.httpRequest({
			url,
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
		
		console.log('Status-API-Antwort:', JSON.stringify(response).substring(0, 200));
		
		if (!Array.isArray(response)) {
			console.error(`Unerwartetes Antwortformat beim Abrufen der Status-Werte: ${JSON.stringify(response).substring(0, 200)}`);
			// Statt eine Exception zu werfen, geben wir ein Standard-Fallback zurück
			return [
				{
					name: '-- Fehler beim Laden der Status-Werte --',
					value: '',
					description: 'Status-Werte konnten nicht geladen werden, bitte prüfen Sie die Logs',
				}
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
	} catch (error) {
		console.error('Fehler beim Abrufen der Status-Werte:', error);
		
		// Statt eine Exception zu werfen, geben wir ein Standard-Fallback zurück
		return [
			{
				name: '-- Fehler beim Laden der Status-Werte --',
				value: '',
				description: `Fehler: ${error.message}`,
			}
		];
	}
} 