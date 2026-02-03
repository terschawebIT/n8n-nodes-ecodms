/**
 * Logger-Utility für ecoDMS Node
 *
 * Bietet eine zentrale Logging-Schnittstelle die im Production-Modus
 * deaktiviert werden kann. Debug-Logs werden nur ausgegeben wenn
 * die Umgebungsvariable N8N_ECODMS_DEBUG=true gesetzt ist.
 */

const isDebugEnabled = (): boolean => {
	return process.env.N8N_ECODMS_DEBUG === 'true' || process.env.NODE_ENV === 'development';
};

export const logger = {
	/**
	 * Debug-Log - nur wenn DEBUG aktiviert ist
	 */
	debug: (message: string, ...args: unknown[]): void => {
		if (isDebugEnabled()) {
			console.log(`[ecoDMS DEBUG] ${message}`, ...args);
		}
	},

	/**
	 * Info-Log - immer aktiv
	 */
	info: (message: string, ...args: unknown[]): void => {
		console.log(`[ecoDMS] ${message}`, ...args);
	},

	/**
	 * Warn-Log - immer aktiv
	 */
	warn: (message: string, ...args: unknown[]): void => {
		console.warn(`[ecoDMS WARN] ${message}`, ...args);
	},

	/**
	 * Error-Log - immer aktiv
	 */
	error: (message: string, ...args: unknown[]): void => {
		console.error(`[ecoDMS ERROR] ${message}`, ...args);
	},
};
