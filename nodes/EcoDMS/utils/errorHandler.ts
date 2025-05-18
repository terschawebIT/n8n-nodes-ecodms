import { NodeOperationError } from 'n8n-workflow';
import { INode } from 'n8n-workflow';

interface ErrorWithMessage {
	message: string;
}

interface ErrorWithStatusCode {
	statusCode?: number;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
	return (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof (error as Record<string, unknown>).message === 'string'
	);
}

function isErrorWithStatusCode(error: unknown): error is ErrorWithStatusCode {
	return (
		typeof error === 'object' &&
		error !== null &&
		'statusCode' in error &&
		typeof (error as Record<string, unknown>).statusCode === 'number'
	);
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
	if (isErrorWithMessage(maybeError)) return maybeError;

	try {
		return new Error(JSON.stringify(maybeError));
	} catch {
		return new Error(String(maybeError));
	}
}

export function getErrorMessage(error: unknown): string {
	return toErrorWithMessage(error).message;
}

export function getStatusCode(error: unknown): number | undefined {
	if (isErrorWithStatusCode(error)) {
		return error.statusCode;
	}
	return undefined;
}

export function createNodeError(node: INode, baseMessage: string, error: unknown): NodeOperationError {
	const errorMessage = `${baseMessage}: ${getErrorMessage(error)}`;
	return new NodeOperationError(node, errorMessage);
}

export function isNodeOperationError(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'constructor' in error &&
		(error as { constructor: { name: string } }).constructor.name === 'NodeOperationError'
	);
} 