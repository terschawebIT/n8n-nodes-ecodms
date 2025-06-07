import { type INode, NodeOperationError } from 'n8n-workflow';

/**
 * Extrahiert eine Fehlermeldung aus einem unbekannten Fehler-Objekt
 */
export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	if (
		error &&
		typeof error === 'object' &&
		'message' in error &&
		typeof error.message === 'string'
	) {
		return error.message;
	}
	return 'Ein unbekannter Fehler ist aufgetreten';
}

/**
 * Erstellt einen NodeOperationError mit einer sicheren Fehlerbehandlung
 */
export function createNodeError(
	node: INode | unknown,
	baseMessage: string,
	error: unknown,
): NodeOperationError {
	const errorMessage = getErrorMessage(error);
	return new NodeOperationError(node as INode, `${baseMessage}: ${errorMessage}`);
}
