import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class EcoDmsApi implements ICredentialType {
	name = 'ecoDmsApi';
	displayName = 'ecoDMS API';
	documentationUrl = 'https://www.ecodms.de/index.php/de/api-schnittstelle';
	icon: Icon = {
		light: 'file:ecoDms.svg',
		dark: 'file:ecoDms.svg',
	};
	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: '',
			placeholder: 'http://ecodms.example.com:8080',
			required: true,
			description: 'Die URL des ecoDMS-Servers inkl. Port, z.B. http://ecodms.example.com:8080',
		},
		{
			displayName: 'Benutzername',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Passwort',
			name: 'password',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			required: true,
		},
		{
			displayName: 'Archiv-ID',
			name: 'archiveId',
			type: 'string',
			default: '',
			required: true,
			description: 'Die ID des ecoDMS-Archivs. Kann über /api/archives abgerufen werden.',
		},
		{
			displayName: 'API-Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			required: false,
			description: 'Der optionale API-Key, falls dieser aktiviert wurde',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.username}}',
				password: '={{$credentials.password}}',
			},
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.serverUrl}}',
			url: '/api/status',
			method: 'GET',
		},
	};
}
