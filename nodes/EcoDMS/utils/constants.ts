export const Resource = {
	Archive: 'archive',
	Document: 'document',
	DocumentType: 'documentType',
	Folder: 'folder',
	Classification: 'classification',
	Search: 'search',
	License: 'license',
} as const;

export const Operation = {
	Get: 'get',
	List: 'list',
	Upload: 'upload',
	UploadWithPDF: 'uploadWithPdf',
	UploadToInbox: 'uploadToInbox',
	UploadFile: 'uploadFile',
	GetTemplatesForFile: 'getTemplatesForFile',
	GetClassificationWithTemplateRecognition: 'getClassificationWithTemplateRecognition',
	RemoveDocumentLink: 'removeDocumentLink',
	LinkToDocuments: 'linkToDocuments',
	CreateNewClassify: 'createNewClassify',
	ClassifyInboxDocument: 'classifyInboxDocument',
	ClassifyDocument: 'classifyDocument',
	CheckDuplicates: 'checkDuplicates',
	AddVersionWithPdf: 'addVersionWithPdf',
	AddVersion: 'addVersion',
	GetTypes: 'getTypes',
	GetTypeClassifications: 'getTypeClassifications',
	GetDocumentInfo: 'getDocumentInfo',
	GetDocumentWithClassification: 'getDocumentWithClassification',
	GetDocumentVersion: 'getDocumentVersion',
	GetClassifyAttributes: 'getClassifyAttributes',
	GetClassifyAttributesDetail: 'getClassifyAttributesDetail',
	Search: 'search',
	AdvancedSearch: 'advancedSearch',
	GetInfo: 'getInfo',
	SetRoles: 'setRoles',
	EditFolder: 'editFolder',
	CreateFolder: 'createFolder',
	CreateSubfolder: 'createSubfolder',
	GetFolders: 'getFolders',
	Connect: 'connect',
	UploadAndClassify: 'uploadAndClassify',
	UploadAndClassifyUserFriendly: 'uploadAndClassifyUserFriendly',
	SearchAndDownload: 'searchAndDownload',
	ClassifyUserFriendly: 'classifyUserFriendly',
} as const;
