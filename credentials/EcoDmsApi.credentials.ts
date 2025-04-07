import {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class EcoDmsApi implements ICredentialType {
	name = 'ecoDmsApi';
	displayName = 'ecoDMS API';
	documentationUrl = '';
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
			placeholder: 'https://ecodms.example.com',
			required: true,
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
			displayName: 'Mandant',
			name: 'mandant',
			type: 'string',
			default: '',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.serverUrl}}',
			url: '/api/session',
			method: 'POST',
			body: {
				username: '={{$credentials.username}}',
				password: '={{$credentials.password}}',
				mandant: '={{$credentials.mandant}}',
			},
		},
	};
} 