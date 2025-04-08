
Swagger UI
ecoDMS API

 24.02 

OAS3

/v3/api-docs
Introduction

The ecoDMS API is intended for developers. It allows you to connect all third-party systems such as CRM software, inventory management systems and much more. Use the interface to connect with the base functions of ecoDMS Server, such as archiving, classification, or downloading. The individual functions are called via the REST web services. Each function thus has a unique address expressed in form of a URL and which can be used, among others, in web browsers.

If, for example, you want to download a document with the ID=5 from ecoDMS, use the command /document/5 where '/document' is the REST call of the function and '5' is the input parameter that is interpreted as Document ID=5.
Base URL

http://[hostname]:[port]/api/[REST-Command]
Accept-Header

Generally, all methods return a response in application/json format for all 201 (HttpStatus.OK) status codes.

If the Accept-Header */* is used, all 404 (HttpStatus.NOT_FOUND) and 401 (HttpStatus.UNAUTHORIZED) responses are in text/html format.

To use the format application/json for almost all response types, the Accept-Header application/json should be defined.

See exemptions below!
Exemptions

The Accept-Header */* must be used for the following methods:
201 response format: application/octet-stream

    /api/document/{docId}
    /api/document/{docId}/{clDocId}
    /api/document/{docId}/version/{version}
    /api/document/{docId}/{clDocId}/version/{version}

201 response format: image/jpeg

    /api/thumbnail/{docId}/page/{pageNr}/height/{height}
    /api/thumbnail/{docId}/page/{pageNr}/height/{height}/version/{version}

Mind that 404 and 401 responses are in text/html format for these methods!
Please note

ecoDMS API REST Service only supports UTF-8 coding. This means that before you call any REST function, you must ensure that the HTTP request is coded in UTF-8.

Also note that all query parameters must be properly URI encoded! For example, the URI encoding for the symbol + is %2B.

To check, if the service is running, the /api/test function can be called.

The API REST service of ecoDMS uses HTTP Basic authentication according to RFC 2617.

    The first step when logging in is to connect to ecoDMS Server. To do so, call the REST function /api/connect/{archiveName} (GET). If the API key was activated, the REST function /api/connect/{archiveName} (POST) with the corresponding request parameters must be called. You must select an existing ecoDMS-Archive. As input parameter of this function, enter the ID number of the archive. To get the correct archive ID, /api/archives can be called beforehand. The key (archive ID) of the returned map is used for the connect call.

    As soon as the connection with an ecoDMS-Archive has been established, check the validity of the ecoDMS user credentials (user name and password). You can do this by sending the Base64-coded authentication pattern in the header of the HTTP request to the ecoDMS API REST Service. To do so, any REST function that requires authentication can be called (e.g. /api/status).

    The HTTP response also contains cookie information, which is saved locally by the client and is transmitted for any further transactions in the HTTP request header.

Additional Information

    To work with the ecoDMS API, you need so-called API connects.
    1 API connect = 1 monthly upload or download via the ecoDMS API
    The number of available API connects is reset with the first upload or download in a new month.
    More information about the license model can be found here.

If additional API Connects have been added via the website, the ecoDMS server service and the API service (in the ecoDMS settings) must be restarted.

If ecoDMS is installed via docker, the ecoDMS container and the API service (in the ecoDMS settings) have to be restarted.

If permission are changed for a user, the API service has to be restarted in order for the permissions to take effect.
API functions, that do not need authentication

    /api/test
    /api/archives
    /api/licenseInfo

API functions only for admin users (ecoSIMSAdmin)

    /api/startDebug
    /api/startDebug/{apiKey}
    /api/stopDebug

All other API functions can be called by all users, the results depend on the corresponding user rights.
API properties
Upload size

The default upload size for ecoDMS API REST Service is limited to 10 MB per file. You can adjust the upload size on ecoDMS Server if required.

    Stop the ecoDMS service. *)

    Open the file "ecodms.properties" in the server installation path. **)

    Add the following lines in the file (100 MB allowed for one file in this example - 100 * 1024 * 1024 bytes):

    rest.api.maxUploadSize=-1

    rest.api.maxUploadSizePerFile=104857600

    Please do NOT change the other values in the file!

    Save this file to the same path.

    Start the ecoDMS service. ***)

Search timeout

Depending on the server configuration, the search timeout can be adjusted (30 seconds is default).

    Stop the ecoDMS service. *)

    Open the file "ecodms.properties" in the server installation path. **)

    Add the following line in the file (search timeout of 1 minute):

    ecoClassify.searchTimeoutSeconds=60

    Please do NOT change the other values in the file!

    Save this file to the same path.

    Start the ecoDMS service. ***)

Windows

    *) Open the Windows Services Manager and stop the "ecoDMS Server XX" service.

    **) Installation path: C:\Program Files (x86)\ecoDMS GmbH\ecoDMS Server\ or C:\Program Files\ecoDMS GmbH\ecoDMS Server\

    ***) Open the Windows Services Manager and start the "ecoDMS Server XX" service.

Linux / Docker

    *) As root, execute the command stop service ecodms in the terminal.

    **) Installation path: /opt/ecodms/ecodmsserver/

    ***) As root, execute the command start service ecodms in the terminal.

Servers
eco-dms-rest-controller
POST
/api/uploadFileWithPdf/{versionControlled}

This function transfers a new file and the associated PDF to ecoDMS. You can save a PDF file, for example, with the ecoDMS PDF/A printer or with an ecoDMS Office plugin. The document ID of the archived document is returned as the result. Once the document has been archived, it can be classified using /api/classifyDocument.
Parameters
Name	Description
versionControlled *
boolean
(path)
	

This command shows whether this is a versioned document.

    false: For a non-versioned document.
    true: For a versioned document.

Example : true
Request body
file *
string($binary)
	

This is the file you want to save in ecoDMS. The filestream is transmitted in the HTTP body of the request message to the API REST Service.
pdfFile
string($binary)
	

This is the file which is displayed in ecoDMS as default document (e.g. PDF).
Responses
Code	Description	Links
201	

The files were uploaded successfully.
Media type
Controls Accept header.

10

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/uploadFileWithPdf/true</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the parameter file is empty
    an internal error occured while uploading/archiving the file(s)

Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Nothing to write to upload file!! MulitpartFile is NULL!!</title>
</head>
<body><h2>HTTP ERROR 404 Nothing to write to upload file!! MulitpartFile is NULL!!</h2>
<table>
<tr><th>URI:</th><td>/api/uploadFileWithPdf/true</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Nothing to write to upload file!! MulitpartFile is NULL!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
POST
/api/uploadFileToInbox

This command is used to copy a document (PDF file) to the inbox. An ID is returned in the response.

This ID is required for further processing of the document, see e.g. /api/getInboxClassifications.

Example call with rights: http://localhost:8180/api/uploadFileToInbox?rights=r_ecodms&rights=r_myuser
Parameters
Name	Description
rights
array[string]
(query)
	

Optional rights for the document. If defined, only these users can see the document in the inbox. If empty, the user role of the logged in API user is set.
Request body
file *
string($binary)
	

This is the file you want to upload to the ecoDMS inbox. The filestream is transmitted in the HTTP body of the request message to the API REST Service.

Only PDF files are allowed!
Responses
Code	Description	Links
201	

The file was uploaded successfully.
Media type
Controls Accept header.

683601

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/uploadFileToInbox</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the parameter file is empty
    the file is not a PDF file
    the API user does not have permission to use the inbox (role ecoICELogon)
    an internal error occured while uploading/adding the file(s)

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Only PDF Format allowed.</title>
</head>
<body><h2>HTTP ERROR 404 Only PDF Format allowed.</h2>
<table>
<tr><th>URI:</th><td>/api/uploadFileToInbox</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Only PDF Format allowed.</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message for an invalid file format.
	No links
POST
/api/uploadFile/{versionControlled}

This function transfers a new file to ecoDMS and returns the document ID of the archived document as the result. Once the document has been archived, it can be classified using /api/classifyDocument.
Parameters
Name	Description
versionControlled *
boolean
(path)
	

This command shows whether this is a versioned document.

    false: For a non-versioned document.
    true: For a versioned document.

Example : false
Request body
file *
string($binary)
	

This is the file you want to save in ecoDMS. The filestream is transmitted in the HTTP body of the request message to the API REST Service.
Responses
Code	Description	Links
201	

The file was uploaded successfully.
Media type
Controls Accept header.

10

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/uploadFile/false</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the parameter file is empty
    an internal error occured while uploading/archiving the file

Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Nothing to write to upload file!! MulitpartFile is NULL!!</title>
</head>
<body><h2>HTTP ERROR 404 Nothing to write to upload file!! MulitpartFile is NULL!!</h2>
<table>
<tr><th>URI:</th><td>/api/uploadFile/false</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Nothing to write to upload file!! MulitpartFile is NULL!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
POST
/api/setFolderRoles/{folderId}

Use this command to set folder permissions in ecoDMS. The necessary folder IDs (folderId) can be retrieved via /api/folders. After changing the roles, the Refresh button may flash in the ecoDMS Client and in the inbox.
Parameters
Name	Description
folderId *
string
(path)
	

Unique internal identifier of folder.

Example : 1.1
Request body

List of roles authorized to view the folder. If empty, all users/roles are allowed to view the folder.
Examples:

[]

Example Description

Empty list to grant permission for all users to this folder.
Responses
Code	Description	Links
200	

The new permission for the folder were applied successfully.
Media type
Controls Accept header.

true

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/setFolderRoles/1.1</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the folder is empty or was not found
    one or more roles were not found
    the API user is not an admin (role ecoSIMSADMIN)
    an internal error occured while setting the folder roles

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Folder 300 was not found!</title>
</head>
<body><h2>HTTP ERROR 404 Folder 300 was not found!</h2>
<table>
<tr><th>URI:</th><td>/api/setFolderRoles/300</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Folder 300 was not found!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if a folder was not found.
	No links
POST
/api/searchDocuments

Provides a list with EcoDMSDocumentInformation from the selected ecoDMS-Archive, which is defined with a user-defined search filter. The search filter is similar to the extended search in ecoDMS Client and can contain several search criteria.
Parameters

No parameters
Request body

List of search filter objects. Each search filter in the list is concatenated with a logical AND operator. The search attributes, their compare operators and which values to use, are described in the schema EcoDMSSearchFilter.
Examples:

[
  {
    "classifyAttribut": "folderonly",
    "searchValue": "6",
    "searchOperator": "="
  },
  {
    "classifyAttribut": "bemerkung",
    "searchValue": "insurance",
    "searchOperator": "ilike"
  }
]

Example Description

Documents in folder 6 (excluding subfolders) whose comment contains insurance.
Responses
Code	Description	Links
200	

Search result for the given request. The result documents are ordered by the attribute docid in descending order. Only documents that the user is authorised to see are returned. A maximum of 100 documents is returned for this method call. For further description of the result objects, see schema EcoDMSDocumentInformation.
Media type
Controls Accept header.
Examples

[
  {
    "docId": 3,
    "clDocId": 121,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "28",
      "docid": "3#121",
      "defdate": "",
      "changeid": "ecoDMS",
      "revision": "1.3",
      "rechte": "W",
      "folder": "1.1",
      "cdate": "2021-02-19",
      "bemerkung": "Example document",
      "ctimestamp": "2021-09-30 11:09:49",
      "mainfolder": "1",
      "status": "3"
    },
    "editRoles": [
      "ecoSIMSUSER"
    ],
    "readRoles": []
  },
  {
    "docId": 2,
    "clDocId": 2,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "30",
      "docid": "2#2",
      "defdate": "",
      "changeid": "ecoDMS",
      "revision": "1.1",
      "rechte": "W",
      "folder": "4",
      "cdate": "2021-02-22",
      "bemerkung": "SO620.pdf",
      "ctimestamp": "2021-02-19 11:52:50",
      "mainfolder": "4",
      "status": "3"
    },
    "editRoles": [
      "ecoSIMSUSER"
    ],
    "readRoles": []
  },
  {
    "docId": 1,
    "clDocId": 110,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "38",
      "docid": "1#110",
      "defdate": "2024-01-30",
      "changeid": "ecoDMS",
      "revision": "1.1",
      "rechte": "W",
      "folder": "3",
      "cdate": "2021-02-23",
      "bemerkung": "rechnung_invoice_ECO3001624.pdf",
      "ctimestamp": "2021-02-19 11:52:21",
      "mainfolder": "3",
      "status": "2"
    },
    "editRoles": [
      "r_ecodms"
    ],
    "readRoles": [
      "ecoSIMSUSER"
    ]
  },
  {
    "docId": 1,
    "clDocId": 112,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "38",
      "docid": "1#112",
      "defdate": "",
      "changeid": "My user",
      "revision": "1.0",
      "rechte": "W",
      "folder": "3",
      "cdate": "2021-02-23",
      "bemerkung": "rechnung_invoice_ECO3001624.pdf",
      "ctimestamp": "2024-01-29 11:33:02",
      "mainfolder": "3",
      "status": "3"
    },
    "editRoles": [
      "ecoSIMSUSER"
    ],
    "readRoles": []
  }
]

Example Description

Example for a search result.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/searchDocuments</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the request list was empty
    the search attribute was not found
    an invalid search operator was defined for an attribute
    the value has an invalid date or timestamp pattern for classify attribute ctimestamp
    the value has an invalid date pattern for classify attributes of type eco_DateField
    an internal error occured while searching for documents

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: List of search filters must not be null</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: List of search filters must not be null</h2>
<table>
<tr><th>URI:</th><td>/api/searchDocuments</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: List of search filters must not be null</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the request body is empty.
	No links
POST
/api/searchDocumentsExtv2

This advanced search function works the same way as the normal search ( /api/searchDocuments ). It also supports additional parameters as well as the option to customize the sort order of the result.
Parameters

No parameters
Request body

Advanced search filter. See schema EcoDMSSearchData for details.
Examples:

{
  "filter": [
    {
      "classifyAttribut": "docart",
      "searchValue": "3",
      "searchOperator": "!="
    }
  ],
  "sortOrder": [
    {
      "classifyAttribut": "revision",
      "sortDirection": "desc"
    }
  ],
  "personalDocumentsOnly": true,
  "trashedDocuments": false,
  "maxDocumentCount": 1000,
  "readRoles": true
}

Example Description

Maximum of 1000 personal documents for the logged-in API user that do not have document type 3, sorted by document revision in descending order.
Responses
Code	Description	Links
200	

Search result for the given request. If no sort order was defined, the result documents are ordered by the attribute docid in descending order. Only documents that the user is authorised to see are returned. For further description of the result objects, see schema EcoDMSDocumentInformation.
Media type
Controls Accept header.
Examples

[
  {
    "docId": 3,
    "clDocId": 121,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "28",
      "docid": "3#121",
      "defdate": "",
      "changeid": "ecoDMS",
      "revision": "1.3",
      "rechte": "W",
      "folder": "1.1",
      "cdate": "2021-02-19",
      "bemerkung": "Example document",
      "ctimestamp": "2021-09-30 11:09:49",
      "mainfolder": "1",
      "status": "3"
    },
    "editRoles": [
      "ecoSIMSUSER"
    ],
    "readRoles": []
  },
  {
    "docId": 2,
    "clDocId": 2,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "30",
      "docid": "2#2",
      "defdate": "",
      "changeid": "ecoDMS",
      "revision": "1.1",
      "rechte": "W",
      "folder": "4",
      "cdate": "2021-02-22",
      "bemerkung": "SO620.pdf",
      "ctimestamp": "2021-02-19 11:52:50",
      "mainfolder": "4",
      "status": "3"
    },
    "editRoles": [
      "ecoSIMSUSER"
    ],
    "readRoles": []
  },
  {
    "docId": 1,
    "clDocId": 110,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "38",
      "docid": "1#110",
      "defdate": "2024-01-30",
      "changeid": "ecoDMS",
      "revision": "1.1",
      "rechte": "W",
      "folder": "3",
      "cdate": "2021-02-23",
      "bemerkung": "rechnung_invoice_ECO3001624.pdf",
      "ctimestamp": "2021-02-19 11:52:21",
      "mainfolder": "3",
      "status": "2"
    },
    "editRoles": [
      "r_ecodms"
    ],
    "readRoles": [
      "ecoSIMSUSER"
    ]
  },
  {
    "docId": 1,
    "clDocId": 112,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "38",
      "docid": "1#112",
      "defdate": "",
      "changeid": "My user",
      "revision": "1.0",
      "rechte": "W",
      "folder": "3",
      "cdate": "2021-02-23",
      "bemerkung": "rechnung_invoice_ECO3001624.pdf",
      "ctimestamp": "2024-01-29 11:33:02",
      "mainfolder": "3",
      "status": "3"
    },
    "editRoles": [
      "ecoSIMSUSER"
    ],
    "readRoles": []
  }
]

Example Description

Example for a search result.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/searchDocumentsExtv2</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the request list was empty
    the search attribute was not found
    an invalid search operator was defined for an attribute
    the value has an invalid date or timestamp pattern for classify attribute ctimestamp
    the value has an invalid date pattern for classify attributes of type eco_DateField
    maxDocumentCount exceeds the maximum value (1000)
    an invalid classify attribute was defined in a sort order
    an internal error occured while searching for documents

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: List of search filters must not be null</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: List of search filters must not be null</h2>
<table>
<tr><th>URI:</th><td>/api/searchDocumentsExtv2</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: List of search filters must not be null</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the request body is empty.
	No links
POST
/api/searchDocumentsExt

The advanced search function works the same way as the normal search ( /api/searchDocuments ), but it also supports four additional URL parameters.

Example call with all query parameters: http://localhost:8180/api/searchDocumentsExt?personalDocumentsOnly=false&trashedDocuments=false&maxDocumentCount=100&readRoles=true
Parameters
Name	Description
personalDocumentsOnly
boolean
(query)
	

If set to true, only documents that are directly assigned to the user (via user role or a role the user is assigned to) are returned.

Default value : false

Example : false
trashedDocuments
boolean
(query)
	

Specifies whether only trashed documents or only documents, that are not thrashed, should be searched for.

Default value : false

Example : false
maxDocumentCount
integer($int32)
(query)
	

Maximum number of documents in the result (Maximum value: 1000).

Default value : 100

Example : 100
readRoles
boolean
(query)
	

Determines, if editRoles and readRoles should be returned in the result. If set to false, empty lists are returned for the roles.

Default value : true

Example : true
Request body

List of search filter objects. Each search filter in the list is concatenated with a logical AND operator. The search attributes, their compare operators and which values to use, are described in the schema EcoDMSSearchFilter.
Examples:

[
  {
    "classifyAttribut": "status",
    "searchValue": "2",
    "searchOperator": "="
  },
  {
    "classifyAttribut": "defdate",
    "searchValue": "2021-08-15",
    "searchOperator": ">="
  },
  {
    "classifyAttribut": "changeid",
    "searchValue": "ecoDMS",
    "searchOperator": "="
  }
]

Example Description

Documents with status 2 and a resubmission date on/after 2021-08-15 that were last edited by user ecoDMS.
Responses
Code	Description	Links
200	

Search result for the given request. The result documents are ordered by the attribute docid in descending order. Only documents that the user is authorised to see are returned. For further description of the result objects, see schema EcoDMSDocumentInformation.
Media type
Controls Accept header.
Examples

[
  {
    "docId": 3,
    "clDocId": 121,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "28",
      "docid": "3#121",
      "defdate": "",
      "changeid": "ecoDMS",
      "revision": "1.3",
      "rechte": "W",
      "folder": "1.1",
      "cdate": "2021-02-19",
      "bemerkung": "Example document",
      "ctimestamp": "2021-09-30 11:09:49",
      "mainfolder": "1",
      "status": "3"
    },
    "editRoles": [
      "ecoSIMSUSER"
    ],
    "readRoles": []
  },
  {
    "docId": 2,
    "clDocId": 2,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "30",
      "docid": "2#2",
      "defdate": "",
      "changeid": "ecoDMS",
      "revision": "1.1",
      "rechte": "W",
      "folder": "4",
      "cdate": "2021-02-22",
      "bemerkung": "SO620.pdf",
      "ctimestamp": "2021-02-19 11:52:50",
      "mainfolder": "4",
      "status": "3"
    },
    "editRoles": [
      "ecoSIMSUSER"
    ],
    "readRoles": []
  },
  {
    "docId": 1,
    "clDocId": 110,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "38",
      "docid": "1#110",
      "defdate": "2024-01-30",
      "changeid": "ecoDMS",
      "revision": "1.1",
      "rechte": "W",
      "folder": "3",
      "cdate": "2021-02-23",
      "bemerkung": "rechnung_invoice_ECO3001624.pdf",
      "ctimestamp": "2021-02-19 11:52:21",
      "mainfolder": "3",
      "status": "2"
    },
    "editRoles": [
      "r_ecodms"
    ],
    "readRoles": [
      "ecoSIMSUSER"
    ]
  },
  {
    "docId": 1,
    "clDocId": 112,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "38",
      "docid": "1#112",
      "defdate": "",
      "changeid": "My user",
      "revision": "1.0",
      "rechte": "W",
      "folder": "3",
      "cdate": "2021-02-23",
      "bemerkung": "rechnung_invoice_ECO3001624.pdf",
      "ctimestamp": "2024-01-29 11:33:02",
      "mainfolder": "3",
      "status": "3"
    },
    "editRoles": [
      "ecoSIMSUSER"
    ],
    "readRoles": []
  }
]

Example Description

Example for a search result.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/searchDocumentsExt</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the request list was empty
    the search attribute was not found
    an invalid search operator was defined for an attribute
    the value has an invalid date or timestamp pattern for classify attribute ctimestamp
    the value has an invalid date pattern for classify attributes of type eco_DateField
    maxDocumentCount exceeds the maximum value (1000)
    an internal error occured while searching for documents

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: List of search filters must not be null</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: List of search filters must not be null</h2>
<table>
<tr><th>URI:</th><td>/api/searchDocumentsExt</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: List of search filters must not be null</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the request body is empty.
	No links
POST
/api/getTemplateForFile

This call lists all templates (including classifications) that would be recognised for a selected file. Mind that values to fill for a form template are not dynamically filled - the initial values in the template are returned for classify attributes. For form template processing, see /api/getClassificationWithTemplateRecognition
Parameters

No parameters
Request body
file *
string($binary)
	

File to check. The filestream is transmitted in the HTTP body of the request message to the API REST Service.
Responses
Code	Description	Links
201	

Recognised templates for the file or empty list if no template would be applied.
Media type
Controls Accept header.

[
  {
    "name": "Invoice template",
    "keyWords": [
      "Invoice",
      "invoice amount",
      "amount"
    ],
    "keySequenze": "",
    "recordFields": [
      {
        "fieldId": 5,
        "name": "Ordner",
        "page": 0,
        "coords": {
          "x": 0,
          "y": 0,
          "width": 1389.3258426966293,
          "height": 100
        },
        "point": {
          "x": 103.93258666992188,
          "y": 803.3707885742188
        },
        "type": 4,
        "hasOptions": true,
        "options": "invoice\nincoming invoice",
        "barcode": false,
        "active": true,
        "offset": -1,
        "pageIndex": 1,
        "extData": "falsefalsetrue"
      }
    ],
    "autoKeyWords": "Example company Jane Doe Example Street 1 Example-Document • Dummy GmbH • Suite 562 • 948 Janelle Ferry, North Wally, CO 14877-0581",
    "autoArchive": 1,
    "readUsers": [
      "ecoSIMSUSER"
    ],
    "writeUsers": [
      "r_ecodms"
    ],
    "regExList": [
      "\\b(invoice)\\b",
      "\\b(invoice amount:)\\b"
    ],
    "notRegExList": [
      "\\b(outgoing invoice)\\b"
    ],
    "barcodeList": [
      "ABCD123456"
    ],
    "fieldActive": [
      {
        "docid": true
      },
      {
        "mainfolder": true
      },
      {
        "bemerkung": true
      },
      {
        "status": false
      },
      {
        "revision": true
      },
      {
        "folder": false
      },
      {
        "docart": false
      },
      {
        "ctimestamp": true
      },
      {
        "cdate": false
      },
      {
        "changeid": true
      },
      {
        "defdate": false
      }
    ],
    "classifyDataList": [
      {
        "mainfolder": "0"
      },
      {
        "bemerkung": "My example invoice"
      },
      {
        "status": "1"
      },
      {
        "folder": "0"
      },
      {
        "docart": "0"
      },
      {
        "cdate": "2000-08-15"
      },
      {
        "defdate": ""
      }
    ]
  }
]

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/getTemplateForFile</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the parameter file is empty
    an internal error occured while uploading/archiving the file

Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Nothing to write to upload file!! MulitpartFile is NULL!!</title>
</head>
<body><h2>HTTP ERROR 404 Nothing to write to upload file!! MulitpartFile is NULL!!</h2>
<table>
<tr><th>URI:</th><td>/api/getTemplateForFile</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Nothing to write to upload file!! MulitpartFile is NULL!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
POST
/api/getClassificationWithTemplateRecognition

This call lists all template names including the classification that would be recognised for selected file or docId/version as well as the defined role permissions. If the detected template is a form template, the dynamic values defined in the form template are applied to the corresponding classify attributes. Only classify attributes, that were checked in the template (and additionally the attribute mainfolder with value -1) are listed. docId and clDocId in the EcoDMSDocumentInformation always have the value -1 since no document was archived yet.

Example call with docId and versionId: http://localhost:8180/api/getClassificationWithTemplateRecognition?docId=1&versionId=1
Parameters
Name	Description
docId
integer($int64)
(query)
	

Unique ID of the document for which the template classifications should be returned. Mind that this value must not be filled, if multipartFile was set and is required if no file is set.

Example : 1
versionId
integer($int64)
(query)
	

Version number of the document for which the template classifications should be returned. If multipartFile was set, this value is ignored. It is only used in combination with docId.
Request body
multipartFile
string($binary)
	

File, for which template classifications should be determined. This file is required, if docId was not defined and must not be set if docId was defined.The filestream is transmitted in the HTTP body of the request message to the API REST Service.
Responses
Code	Description	Links
200	

If no templates were recognised for the document, an empty map is returned. Otherwise, the result map is filled with key = name of template and value = EcoDMSDocumentInformation object with the corresponding classify attributes.
Media type
Controls Accept header.
Examples

{
  "Invoice template": {
    "docId": -1,
    "clDocId": -1,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "0",
      "folder": "0",
      "cdate": "2021-02-17",
      "bemerkung": "Example invoice #123456",
      "mainfolder": "-1",
      "status": "1"
    },
    "editRoles": [
      "r_ecodms"
    ],
    "readRoles": [
      "ecoSIMSUSER"
    ]
  }
}

Example Description

Result example, assuming that one template was found.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/getClassificationWithTemplateRecognition</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the parameter file and the parameter docId are filled
    the parameter file and the parameter docId are empty
    the parameter versionId was filled and this version was not found for the defined docId
    the logged in API user has no permission to view the document with the defined docId
    an internal error occured while determining template classifications

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: please define file OR docid</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: please define file OR docid</h2>
<table>
<tr><th>URI:</th><td>/api/getClassificationWithTemplateRecognition</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: please define file OR docid</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if both parameters multipartFile and docId were filled.
	No links
POST
/api/editFolder

Use this command to update folder attributes in ecoDMS. The necessary EcoDMSFolder data can be retrieved via /api/folders. After updating the folder, the Refresh button may flash in the ecoDMS Client and in the inbox.
Parameters

No parameters
Request body

Updated data to set for a folder.

{
  "mainFolder": true,
  "foldername": "Invoices",
  "externalKey": "",
  "buzzwords": "",
  "active": true,
  "dataString": "5Invoices﻿M﻿﻿0﻿19﻿U﻿ ",
  "oId": "5"
}

Responses
Code	Description	Links
200	

The folder was updated successfully.
Media type
Controls Accept header.

true

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/editFolder</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the folder for the set oId was not found
    the request is empty
    the API user is not an admin (role ecoSIMSADMIN)
    an internal error occured while updating the folder

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Folder not found.</title>
</head>
<body><h2>HTTP ERROR 404 Folder not found.</h2>
<table>
<tr><th>URI:</th><td>/api/editFolder</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Folder not found.</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if a folder was not found.
	No links
POST
/api/document/{clDocId}/removeDocumentLink

This call removes links between document classifications. For example, the necessary clDocId could be determined with /api/searchDocuments or /api/documentInfo/{docId}. The currently linked documents to a classification are returned in call /document/{clDocId}/readLinkedDocuments. Document classifications can be linked with /document/{clDocId}/linkToDocuments.
Parameters
Name	Description
clDocId *
integer($int64)
(path)
	

Unique ID of a document classification, to which other document classfications should be linked.

Example : 7
Request body

List of linked document classification IDs to be removed.
Examples:

[
  4,
  5,
  6
]

Example Description

In this example, the link to the document classifications 4, 5 and 6 should be removed.
Responses
Code	Description	Links
200	

The linked document classifications were removed successfully.
Media type
Controls Accept header.

true

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/document/7/removeDocumentLink</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the parameter clDocId was not set
    the request is empty
    the API user does not have permission to view the document classification with the corresponding clDocId
    the API user does not have permission to view one or more document classifications listed in the request
    the API user does not have permission to classify documents (role ecoSIMSCLASSIFY)
    an internal error occured while removing the linked document classifications

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Unable to remove document links. clDocId is null!!</title>
</head>
<body><h2>HTTP ERROR 404 Unable to remove document links. clDocId is null!!</h2>
<table>
<tr><th>URI:</th><td>/api/document/removeDocumentLink</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Unable to remove document links. clDocId is null!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the classify id is empty.
	No links
POST
/api/document/{clDocId}/linkToDocuments

This call adds links between document classifications.

When linking documents, any archived files, including their classifications, can be added to a document and combined to form one process. The links are displayed in ecoDMS Client table as expandable sub-entries of the main document. The main entry of each linked document remains as it is. This function is similar to a virtual document clip.

For example, the necessary clDocId could be determined with /api/searchDocuments or /api/documentInfo/{docId}. The currently linked documents to a classification are returned in call /document/{clDocId}/readLinkedDocuments. Links between document classifications can be removed with /document/{clDocId}/removeDocumentLink.
Parameters
Name	Description
clDocId *
integer($int64)
(path)
	

Unique ID of a document classification, to which other document classfications should be linked.

Example : 7
Request body

List of document classification IDs to be linked. The list may also contain already linked IDs, these will be ignored (the links will be maintained).
Examples:

[
  4,
  5,
  6
]

Example Description

In this example, the document classifications 4, 5 and 6 should be linked.
Responses
Code	Description	Links
200	

The document classifications were linked successfully.
Media type
Controls Accept header.

true

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/document/7/linkToDocuments</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the parameter clDocId was not set
    the request is empty
    the API user does not have permission to view the document classification with the corresponding clDocId
    the API user does not have permission to view one or more document classifications listed in the request
    the API user does not have permission to classify documents (role ecoSIMSCLASSIFY)
    the document classification list contains the same clDocId as in the path parameter
    an internal error occured while linking the document classifications

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Unable to link documents. clDocId is null!!</title>
</head>
<body><h2>HTTP ERROR 404 Unable to link documents. clDocId is null!!</h2>
<table>
<tr><th>URI:</th><td>/document/linkToDocuments</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Unable to link documents. clDocId is null!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the classify id is empty.
	No links
POST
/api/createNewClassify

Create an additional (multiple) classification for a document.
Parameters

No parameters
Request body

EcoDMSDocumentInformation object with classify and permission information.

The following attributes in the object can be omitted:

    archiveName (connected archive will be used)
    clDocId (result of this call)

Classify attributes
The same classify attributes as returned in /api/classifyAttributes must be defined in the map. It is recommended to call /api/documentInfo/{docId} for the corresponding docId and adapt the classify attributes of the result.

These classify attributes may be omitted (will be filled automatically):

    docid
    changeid
    revision
    rechte
    ctimestamp
    mainfolder
    dyn_highlight

If cdate is empty, the current date is used.

If editRoles is empty, the user role of the logged in API user is set.
Examples:

{
  "docId": 1,
  "classifyAttributes": {
    "docart": "1",
    "defdate": "",
    "folder": "1.4",
    "cdate": "",
    "bemerkung": "Additional invoice classification",
    "status": "2"
  },
  "editRoles": [
    "r_ecodms"
  ],
  "readRoles": [
    "ecoSIMSUSER"
  ]
}

Example Description

Example for an additional classification for document with ID 1.
Responses
Code	Description	Links
200	

The additional classification was successfully added to the document.
Media type
Controls Accept header.

114

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/createNewClassify</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the request is empty
    docId in the request is empty
    classifyAttributes in the request is empty
    the map contains an invalid number of classify attributes
    the value of a classify attribute is null instead of an empty string
    the map contains an invalid classify attribute
    an invalid value was defined for a classify attribute (e.g. a status that does not exist)
    the API user does not have permission to classify documents (role ecoSIMSCLASSIFY)
    the API user does not have permission to view the document
    the API user does not have permission to edit the document
    one or more roles defined in editRoles and/or readRoles was not found
    a required classify attribute is empty
    status is 2 (resubmission) and defdate is empty
    defdate is filled and status is not 2 (resubmission)
    editRoles and readRoles contain the same role
    an internal error occured while creating an additional classification

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Unable to classify document. EcoDMSDocumentInformation is empty!!</title>
</head>
<body><h2>HTTP ERROR 404 Unable to classify document. EcoDMSDocumentInformation is empty!!</h2>
<table>
<tr><th>URI:</th><td>/api/createNewClassify</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Unable to classify document. EcoDMSDocumentInformation is empty!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the request is empty.
	No links
POST
/api/createFolder

Creates a new folder at top level (without parent folder). After creating the folder, the Refresh button may flash in the ecoDMS Client and in the inbox.
Parameters

No parameters
Request body

Data to set for the new folder.
Examples:

{
  "mainFolder": true,
  "foldername": "Invoices",
  "externalKey": "F1234",
  "buzzwords": "Invoices, Incoming invoice"
}

Example Description

Example for a new folder at top level.
Responses
Code	Description	Links
200	

The folder was created successfully.
Media type
Controls Accept header.

5

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/createFolder</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the request is empty
    the API user does not have permission to create folders (role ecoSIMSCREATEFOLDER)
    an internal error occured while creating the folder

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Unable to classify document. EcoDMSFolder data is empty!!</title>
</head>
<body><h2>HTTP ERROR 404 Unable to classify document. EcoDMSFolder data is empty!!</h2>
<table>
<tr><th>URI:</th><td>/api/createFolder</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Unable to classify document. EcoDMSFolder data is empty!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the request is empty.
	No links
POST
/api/createFolder/parent/{parentoid}

This function creates a new subfolder in the ecoDMS folder structure. After creating the folder, the Refresh button may flash in the ecoDMS Client and in the inbox.
Parameters
Name	Description
parentoid *
string
(path)
	

Unique ID of a folder. This ID can be determined with /api/folders.

Example : 5
Request body

Data to set for the new subfolder.
Examples:

{
  "mainFolder": false,
  "foldername": "Incoming",
  "externalKey": "F1234_1",
  "buzzwords": "Incoming"
}

Example Description

Example for a new subfolder assigned to the corresponding parent folder.
Responses
Code	Description	Links
200	

The subfolder was created successfully.
Media type
Controls Accept header.

5.1

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/createFolder/parent/5</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the request is empty
    the parent folder ID was not found
    the API user does not have permission to create folders (role ecoSIMSCREATEFOLDER)
    an internal error occured while creating the folder

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Unable to classify document. EcoDMSFolder data is empty!!</title>
</head>
<body><h2>HTTP ERROR 404 Unable to classify document. EcoDMSFolder data is empty!!</h2>
<table>
<tr><th>URI:</th><td>/api/createFolder/parent/5</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Unable to classify document. EcoDMSFolder data is empty!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the request is empty.
	No links
GET
/api/connect/{archiveName}

This command connects an ecoDMS user to the ecoDMS API REST Service. A message confirms that the current ecoDMS user is logged in.

See introduction for further information.
Parameters
Name	Description
archiveName *
string
(path)
	

Unique ID of ecoDMS archive. Existing archives can be queried with /api/archives.

Example : 1
Responses
Code	Description	Links
200	

The user was successfully connected.
Media type
Controls Accept header.

Login for user my.user successful, selected Archive 1.

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/connect/1</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    an internal error occured while connecting

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Example error message</title>
</head>
<body><h2>HTTP ERROR 404 Example error message</h2>
<table>
<tr><th>URI:</th><td>/api/connect/1</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Example error message</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Example error message.
	No links
POST
/api/connect/{archiveName}

This command connects an ecoDMS user to the ecoDMS API REST Service with an additional API key. A message confirms that the current ecoDMS user is logged in.

See introduction for further information.
Parameters
Name	Description
archiveName *
string
(path)
	

Unique ID of ecoDMS archive. Existing archives can be queried with /api/archives.

Example : 1
user *
string
(query)
	

User name
pass *
string
(query)
	

User password
apiKey *
string
(query)
	

API key
Responses
Code	Description	Links
200	

The user was successfully connected.
Media type
Controls Accept header.

Login for user my.user successful, selected Archive 1.

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/connect/1</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    an internal error occured while connecting

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Example error message</title>
</head>
<body><h2>HTTP ERROR 404 Example error message</h2>
<table>
<tr><th>URI:</th><td>/api/connect/1</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Example error message</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Example error message.
	No links
POST
/api/classifyInboxDocument

With this call, the following can be accomplished:

    create a first-time classification for a new inbox document
    update an existing classification of an inbox document
    create additional (multiple) classifications for an inbox document

Parameters

No parameters
Request body

EcoDMSDocumentInformation object with classify and permission information.

The following attributes in the object can be omitted:

    archiveName (connected archive will be used)

docId
Unique ID of an inbox document, returned in call /api/uploadFileToInbox.

clDocId
For a first-time classification of an inbox document, the value -1 is used. This can be checked with call /api/getInboxClassifications. If the call only returns one result with clDocId set to -1, this is the first classification. This call then returns an unique clDocId.

For additional (multiple) classifications, the value -1 is also used (multiple classification results or one result with another clDocId value).

If an already saved inbox document classification should be updated, use the unique clDocId returned in this call or in the inbox classification result.

Classify attributes
The same classify attributes as returned in /api/classifyAttributes must be defined in the map. It is recommended to call /api/getInboxClassifications for the corresponding docId and adapt the classify attributes of the result.

These classify attributes may be omitted (will be filled automatically):

    docid
    changeid
    revision
    rechte
    mainfolder
    dyn_highlight
    ctimestamp (only for new classifications, it must be filled for updates)

For a classification update (assigned clDocId value), use the same value for ctimestamp as returned in /api/getInboxClassifications.

If cdate is empty, the current date is used.

If certain classification attributes are required for the given document type, the value of these attributes must be filled. These document type settings can be checked with /api/typeClassifications.
Examples:

{
  "docId": 683601,
  "clDocId": -1,
  "classifyAttributes": {
    "docart": "1",
    "defdate": "",
    "folder": "1.4",
    "cdate": "",
    "bemerkung": "Inbox invoice classification"
  },
  "editRoles": [
    "r_ecodms"
  ],
  "readRoles": [
    "ecoSIMSUSER"
  ]
}

Example Description

Example for first-time or additional (multiple) classification for inbox document with ID 683601.
Responses
Code	Description	Links
200	

The classification was successfully created/added/updated for the inbox document.
Media type
Controls Accept header.

530

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/classifyInboxDocument</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the request is empty
    docId in the request is empty
    classifyAttributes in the request is empty
    the map contains an invalid number of classify attributes
    the value of a classify attribute is null instead of an empty string
    the map contains an invalid classify attribute
    an invalid value was defined for a classify attribute (e.g. a status that does not exist)
    the API user does not have permission to classify documents (role ecoSIMSCLASSIFY)
    one or more roles defined in editRoles and/or readRoles was not found
    a classify attribute was defined as required for the document type but the value is empty
    no classification or inbox document was found for docId and/or clDocId
    the API user does not have permission to view the document
    the API user does not have permission to use the inbox (role ecoICELogon)
    the document was edited in the meantime (ctimestamp changed)
    a required classify attribute is empty
    status is 2 (resubmission) and defdate is empty
    defdate is filled and status is not 2 (resubmission)
    editRoles and readRoles contain the same role
    an internal error occured while creating/updating/adding an inbox document classification

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Unable to classify document. EcoDMSDocumentInformation is empty!!</title>
</head>
<body><h2>HTTP ERROR 404 Unable to classify document. EcoDMSDocumentInformation is empty!!</h2>
<table>
<tr><th>URI:</th><td>/api/classifyInboxDocument</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Unable to classify document. EcoDMSDocumentInformation is empty!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the request is empty.
	No links
POST
/api/classifyDocument

With this call, a document classification in ecoDMS is updated.
Parameters

No parameters
Request body

EcoDMSDocumentInformation object with classify and permission information.

The following attributes in the object can be omitted:

    archiveName (connected archive will be used)

For example, the values for docId and clDocId with /api/searchDocuments.

Classify attributes
The same classify attributes as returned in /api/classifyAttributes must be defined in the map. It is recommended to call /api/documentInfo/{docId} for the corresponding docId and adapt the classify attributes of the result.

These classify attributes may be omitted (will be filled automatically):

    docid
    changeid
    rechte
    ctimestamp
    mainfolder
    dyn_highlight

For revision, the same value as returned in /api/documentInfo/{docId} must be used.

If cdate is empty, the current date is used.
Examples:

{
  "docId": 5,
  "clDocId": 117,
  "classifyAttributes": {
    "docart": "1",
    "defdate": "",
    "revision": "1.1",
    "folder": "1.4",
    "cdate": "",
    "bemerkung": "Invoice classification update",
    "status": "2"
  },
  "editRoles": [
    "r_ecodms"
  ],
  "readRoles": [
    "ecoSIMSUSER"
  ]
}

Example Description

Example for a classification update for document with ID 5.
Responses
Code	Description	Links
200	

The classification was successfully updated for the document.
Media type
Controls Accept header.

117

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/classifyDocument</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the request is empty
    docId in the request is empty
    classifyAttributes in the request is empty
    the map contains an invalid number of classify attributes
    the value of a classify attribute is null instead of an empty string
    the map contains an invalid classify attribute
    an invalid value was defined for a classify attribute (e.g. a status that does not exist)
    the API user does not have permission to classify documents (role ecoSIMSCLASSIFY)
    the revision is invalid or a new revision was added by another user in the meantime
    the API user does not have permission to view the document
    the API user does not have permission to edit the document
    an invalid value was defined for clDocId
    one or more roles defined in editRoles and/or readRoles was not found
    a required classify attribute is empty
    status is 2 (resubmission) and defdate is empty
    defdate is filled and status is not 2 (resubmission)
    editRoles and readRoles contain the same role
    an internal error occured while updating a document classification

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Unable to classify document. EcoDMSDocumentInformation is empty!!</title>
</head>
<body><h2>HTTP ERROR 404 Unable to classify document. EcoDMSDocumentInformation is empty!!</h2>
<table>
<tr><th>URI:</th><td>/api/classifyDocument</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Unable to classify document. EcoDMSDocumentInformation is empty!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the request is empty.
	No links
POST
/api/checkDuplicates

This command lists all duplicates found in the ecoDMS archive for the given input file. A maxMatchValue of 80 is set as default.
Parameters

No parameters
Request body
file *
string($binary)
	

For this file, the ecoDMS documents are checked for duplicates. The filestream is transmitted in the HTTP body of the request message to the API REST Service.

The following file types are supported:

    PDF
    TIF
    TIFF
    PNG
    JPEG
    JPG
    BMP

Responses
Code	Description	Links
200	

EcoDMSDuplicates object with information about duplicates in the ecoDMS archive. A maximum of 5 duplicates are returned. If duplicate detection is not activated, an empty result is returned.
Media type
Controls Accept header.
Examples

{
  "duplicates": [
    {
      "docId": 17,
      "page": 1,
      "version": 2,
      "matchValue": 100,
      "inputThumbId": "0"
    },
    {
      "docId": 5,
      "page": 3,
      "version": 6,
      "matchValue": 100,
      "inputThumbId": "0"
    },
    {
      "docId": 3,
      "page": 7,
      "version": 1,
      "matchValue": 91.79133,
      "inputThumbId": "1"
    }
  ],
  "inputThumbs": {
    "0": "aW1hZ2UvanBlZyBwbGFjZWhvbGRlcg==",
    "1": "aW1hZ2UvanBlZyBwbGFjZWhvbGRlcjI="
  }
}

Example Description

Example with several duplicates.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/checkDuplicates</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    file is empty
    file has an invalid file type
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Nothing to write to upload file!! MulitpartFile is NULL!!</title>
</head>
<body><h2>HTTP ERROR 404 Nothing to write to upload file!! MulitpartFile is NULL!!</h2>
<table>
<tr><th>URI:</th><td>/api/checkDuplicates</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Nothing to write to upload file!! MulitpartFile is NULL!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if file is empty.
	No links
POST
/api/checkDuplicates/{maxMatchValue}

This command lists all duplicates found in the ecoDMS archive for the given input file.
Parameters
Name	Description
maxMatchValue *
integer($int32)
(path)
	

By means of this setting you define the necessary match of documents for duplicate detection. I.e. the lower the value is set, the less matches within the documents are necessary for duplicate detection. The higher the value is set, the more matches within the documents are required for duplicate detection. When set to 100, the documents must match exactly for duplicate detection.

Minimum value: 1

Maximum value: 100

Example : 90
Request body
file *
string($binary)
	

For this file, the ecoDMS documents are checked for duplicates. The filestream is transmitted in the HTTP body of the request message to the API REST Service.

The following file types are supported:

    PDF
    TIF
    TIFF
    PNG
    JPEG
    JPG
    BMP

Responses
Code	Description	Links
200	

EcoDMSDuplicates object with information about duplicates in the ecoDMS archive. A maximum of 5 duplicates are returned. If duplicate detection is not activated, an empty result is returned.
Media type
Controls Accept header.
Examples

{
  "duplicates": [
    {
      "docId": 17,
      "page": 1,
      "version": 2,
      "matchValue": 100,
      "inputThumbId": "0"
    },
    {
      "docId": 5,
      "page": 3,
      "version": 6,
      "matchValue": 100,
      "inputThumbId": "0"
    },
    {
      "docId": 3,
      "page": 7,
      "version": 1,
      "matchValue": 91.79133,
      "inputThumbId": "1"
    }
  ],
  "inputThumbs": {
    "0": "aW1hZ2UvanBlZyBwbGFjZWhvbGRlcg==",
    "1": "aW1hZ2UvanBlZyBwbGFjZWhvbGRlcjI="
  }
}

Example Description

Example with several duplicates.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/checkDuplicates/90</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    file is empty
    file has an invalid file type
    maxMatchValue is not between/equal 1 and 100
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Nothing to write to upload file!! MulitpartFile is NULL!!</title>
</head>
<body><h2>HTTP ERROR 404 Nothing to write to upload file!! MulitpartFile is NULL!!</h2>
<table>
<tr><th>URI:</th><td>/api/checkDuplicates/90</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Nothing to write to upload file!! MulitpartFile is NULL!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if file is empty.
	No links
POST
/api/addVersionWithPdfToDocument/{docId}/{fixed}

Use this call to add a new version including PDF file to an already archived document in ecoDMS. The new file is archived with the specified document as a further version in ecoDMS. You need to specify whether you want to fix the current version of the document. If you enable "Fix document", you cannot add any further versions to this document after archiving.

Example call with all path parameters: http://localhost:8180/api/addVersionWithPdfToDocument/5/false
Parameters
Name	Description
docId *
integer($int64)
(path)
	

Unique ID of document.

Example : 5
fixed *
boolean
(path)
	

If you enable "Fix document", you cannot add any further versions to this document after archiving.

    false: Do not fix version.
    true: Fix version.

Example : false
Request body
file *
string($binary)
	

This is the file you want to add to a new document version in ecoDMS. The filestream is transmitted in the HTTP body of the request message to the API REST Service.
pdfFile *
string($binary)
	

This is the file which is displayed in ecoDMS as default document (e.g. PDF) for the new version.
Responses
Code	Description	Links
201	

The files were uploaded successfully.
Media type
Controls Accept header.

true

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/addVersionWithPdfToDocument/5/false</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the parameter file is empty
    the parameter pdfFile is empty
    the API user does not have permission to use versioning (role ecoSIMSVERSIONING)
    the API user does not have permission to view the document
    the API user does not have permission to edit the document
    an internal error occured while uploading the file(s)/adding the version (e.g. a document is locked by another user, a document does not support versioning, a document with versions is finalized, ...)

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Nothing to write to upload file!! MulitpartFile is NULL!!</title>
</head>
<body><h2>HTTP ERROR 404 Nothing to write to upload file!! MulitpartFile is NULL!!</h2>
<table>
<tr><th>URI:</th><td>/api/addVersionWithPdfToDocument/5/false</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Nothing to write to upload file!! MulitpartFile is NULL!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if parameter file is empty.
	No links
POST
/api/addVersionToDocument/{docId}/{fixed}

Use this call to add a new version to an already archived document in ecoDMS. The new file is archived with the specified document as a further version in ecoDMS. You need to specify whether you want to fix the current version of the document. If you set "Fix document", you cannot add any further versions to this document after archiving.

Example call with all path parameters: http://localhost:8180/api/addVersionToDocument/5/false
Parameters
Name	Description
docId *
integer($int64)
(path)
	

Unique ID of document.

Example : 5
fixed *
boolean
(path)
	

If you enable "Fix document", you cannot add any further versions to this document after archiving.

    false: Do not fix version.
    true: Fix version.

Example : false
Request body
file *
string($binary)
	

This is the file you want to add to a new document version in ecoDMS. The filestream is transmitted in the HTTP body of the request message to the API REST Service.
Responses
Code	Description	Links
201	

The file was uploaded successfully.
Media type
Controls Accept header.

true

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/addVersionToDocument/5/false</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the parameter file is empty
    the API user does not have permission to use versioning (role ecoSIMSVERSIONING)
    the API user does not have permission to view the document
    the API user does not have permission to edit the document
    an internal error occured while uploading the file/adding the version (e.g. a document is locked by another user, a document does not support versioning, a document with versions is finalized, ...)

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Nothing to write to upload file!! MulitpartFile is NULL!!</title>
</head>
<body><h2>HTTP ERROR 404 Nothing to write to upload file!! MulitpartFile is NULL!!</h2>
<table>
<tr><th>URI:</th><td>/api/addVersionToDocument/5/false</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Nothing to write to upload file!! MulitpartFile is NULL!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if parameter file is empty.
	No links
GET
/api/usersForRole/{roleName}

This call lists the ecoDMS users assigned to a role. All existing roles can be determined with /api/roles.
Parameters
Name	Description
roleName *
string
(path)
	

Unique name of role.

Example : ecoSIMSUSER
Responses
Code	Description	Links
200	

User IDs (login names) for the role.
Media type
Controls Accept header.
Examples

[
  "ecodms",
  "example.user",
  "MYGROUP"
]

Example Description

User IDs (login names) for ecoSIMSUSER system role.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/usersForRole/ecoSIMSUSER</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the role was not found
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Role [r_invalid] was not found!</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Role [r_invalid] was not found!</h2>
<table>
<tr><th>URI:</th><td>/api/usersForRole/r_invalid</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Role [r_invalid] was not found!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the role was not found.
	No links
GET
/api/userRoles

This command lists the ecoDMS roles of the currently logged in API user.
Parameters

No parameters
Responses
Code	Description	Links
200	

Unique Role IDs for the logged in user.
Media type
Controls Accept header.
Examples

[
  "r_ecodms",
  "ecoSIMSUSER",
  "ecoWORKZAdmin",
  "Management",
  "ecoSIMSADMIN",
  "ecoSIMSCLASSIFY",
  "ecoSIMSHISTORY",
  "ecoICELogon",
  "ecoSIMSCREATEFOLDER",
  "ecoSIMSVERSIONING",
  "ecoSIMSWEBCLIENT",
  "ecoSIMSTEMPLATES",
  "ecoSIMSDELETE",
  "ecoSIMSINETSHARE"
]

Example Description

Role IDs for ecodms user.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/userRoles</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Example error message</title>
</head>
<body><h2>HTTP ERROR 404 Example error message</h2>
<table>
<tr><th>URI:</th><td>/api/userRoles</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Example error message</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Example error message.
	No links
GET
/api/types

Supplies a list with the "Document Types" defined in ecoDMS. Each document type has a unique ID, a unique name and a retention period.

You need the ID, for example, to search for the value of the "Document Type" attribute in ecoDMS Archive with a search filter. Moreover, you can modify the value within a classification for a specific document using the document type ID.
Parameters

No parameters
Responses
Code	Description	Links
200	

Document types in ecoDMS.
Media type
Controls Accept header.
Examples

[
  {
    "id": 28,
    "name": "Quote",
    "frist": {
      "jahre": 0,
      "monate": 0,
      "tage": 0,
      "type": "P"
    }
  },
  {
    "id": 29,
    "name": "Assessment",
    "frist": {
      "jahre": 0,
      "monate": 0,
      "tage": 0,
      "type": "P"
    }
  },
  {
    "id": 30,
    "name": "Purchase order",
    "frist": {
      "jahre": 0,
      "monate": 0,
      "tage": 0,
      "type": "P"
    }
  },
  {
    "id": 32,
    "name": "Documentation",
    "frist": {
      "jahre": 0,
      "monate": 0,
      "tage": 0,
      "type": "P"
    }
  },
  {
    "id": 34,
    "name": "Information",
    "frist": {
      "jahre": 2,
      "monate": 0,
      "tage": 0,
      "type": "D"
    }
  },
  {
    "id": 44,
    "name": "Calculation",
    "frist": {
      "jahre": 0,
      "monate": 6,
      "tage": 0,
      "type": "D"
    }
  },
  {
    "id": 36,
    "name": "Bank statement",
    "frist": {
      "jahre": 0,
      "monate": 0,
      "tage": 0,
      "type": "P"
    }
  },
  {
    "id": 37,
    "name": "Cancellation",
    "frist": {
      "jahre": 0,
      "monate": 0,
      "tage": 0,
      "type": "P"
    }
  },
  {
    "id": 47,
    "name": "Delivery receipt",
    "frist": {
      "jahre": 0,
      "monate": 0,
      "tage": 0,
      "type": "P"
    }
  },
  {
    "id": 60,
    "name": "Payroll",
    "frist": {
      "jahre": 0,
      "monate": 0,
      "tage": 0,
      "type": "P"
    }
  },
  {
    "id": 0,
    "name": "not assigned",
    "frist": {
      "jahre": 0,
      "monate": 0,
      "tage": 0,
      "type": "P"
    }
  },
  {
    "id": 61,
    "name": "Audit report",
    "frist": {
      "jahre": 0,
      "monate": 0,
      "tage": 10,
      "type": "P"
    }
  },
  {
    "id": 38,
    "name": "Outgoing invoice",
    "frist": {
      "jahre": 10,
      "monate": 0,
      "tage": 0,
      "type": "P"
    }
  },
  {
    "id": 39,
    "name": "Incoming invoice",
    "frist": {
      "jahre": 7,
      "monate": 0,
      "tage": 0,
      "type": "P"
    }
  },
  {
    "id": 40,
    "name": "Invoice correction",
    "frist": {
      "jahre": 0,
      "monate": 0,
      "tage": 0,
      "type": "P"
    }
  },
  {
    "id": 41,
    "name": "Contract",
    "frist": {
      "jahre": 0,
      "monate": 0,
      "tage": 0,
      "type": "P"
    }
  }
]

Example Description

Example for several document types.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/types</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Example error message</title>
</head>
<body><h2>HTTP ERROR 404 Example error message</h2>
<table>
<tr><th>URI:</th><td>/api/types</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Example error message</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Example error message.
	No links
GET
/api/typeClassifications/{docTypeId}

This call returns the defined required and hidden classification for a document type.

All existing document types can be determined with /api/types.
Parameters
Name	Description
docTypeId *
integer($int64)
(path)
	

Unique ID of document type.

Example : 39
Responses
Code	Description	Links
200	

Required/hidden classification attributes for the document type or an empty list if the document type was not found.
Media type
Controls Accept header.
Examples

[
  {
    "docTypeId": 39,
    "index": 0,
    "fieldId": "docid",
    "hidden": true,
    "mandatory": false
  },
  {
    "docTypeId": 39,
    "index": 1,
    "fieldId": "mainfolder",
    "hidden": false,
    "mandatory": false
  },
  {
    "docTypeId": 39,
    "index": 4,
    "fieldId": "bemerkung",
    "hidden": false,
    "mandatory": false
  },
  {
    "docTypeId": 39,
    "index": 5,
    "fieldId": "status",
    "hidden": false,
    "mandatory": true
  },
  {
    "docTypeId": 39,
    "index": 10,
    "fieldId": "revision",
    "hidden": true,
    "mandatory": false
  },
  {
    "docTypeId": 39,
    "index": 2,
    "fieldId": "folder",
    "hidden": false,
    "mandatory": false
  },
  {
    "docTypeId": 39,
    "index": 3,
    "fieldId": "docart",
    "hidden": false,
    "mandatory": true
  },
  {
    "docTypeId": 39,
    "index": 9,
    "fieldId": "ctimestamp",
    "hidden": true,
    "mandatory": false
  },
  {
    "docTypeId": 39,
    "index": 8,
    "fieldId": "cdate",
    "hidden": false,
    "mandatory": false
  },
  {
    "docTypeId": 39,
    "index": 11,
    "fieldId": "changeid",
    "hidden": true,
    "mandatory": false
  },
  {
    "docTypeId": 39,
    "index": 12,
    "fieldId": "defdate",
    "hidden": false,
    "mandatory": false
  },
  {
    "docTypeId": 39,
    "index": 13,
    "fieldId": "dyn_highlight",
    "hidden": false,
    "mandatory": false
  }
]

Example Description

Classification attributes for a given document type.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/typeClassifications/39</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Example error message</title>
</head>
<body><h2>HTTP ERROR 404 Example error message</h2>
<table>
<tr><th>URI:</th><td>/api/typeClassifications/39</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Example error message</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Example error message.
	No links
GET
/api/thumbnail/{docId}/page/{pageNr}/height/{height}

This call produces a preview image with a desired height for a specified page in a document.
Parameters
Name	Description
docId *
integer($int64)
(path)
	

Unique ID of document.

Example : 5
pageNr *
integer($int32)
(path)
	

Page number of document, for which the thumbnail should be created. Minimum value: 1.

Example : 1
height *
integer($int32)
(path)
	

Height in pixels for the thumbnail. Maximum value: 1080.

Example : 800
Responses
Code	Description	Links
200	

Image file in image/jpegformat for the corresponding parameters. Name of the result file: thumbnail_{docId}_{pageNr}.jpg; Example: thumbnail_5_1.jpg.
Media type
Controls Accept header.

string

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/thumbnail/5/page/1/height/1080</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    height exceeds the maximum of 1080 pixels
    height is 0 or negative
    pageNr is 0 or negative
    docId was not found or the API user does not have permission to view the document
    no thumbnail can be created for the document (e.g. for a .docx file)
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Preview height is limited to 1080 pixels.</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Preview height is limited to 1080 pixels.</h2>
<table>
<tr><th>URI:</th><td>/api/thumbnail/5/page/7/height/2048</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Preview height is limited to 1080 pixels.</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if height exceeds the maximum of 1080 pixels.
	No links
GET
/api/thumbnail/{docId}/page/{pageNr}/height/{height}/version/{version}

This call produces a preview image with a desired height for a specified page in a document.
Parameters
Name	Description
docId *
integer($int64)
(path)
	

Unique ID of document.

Example : 5
pageNr *
integer($int32)
(path)
	

Page number of document, for which the thumbnail should be created. Minimum value: 1.

Example : 1
height *
integer($int32)
(path)
	

Height in pixels for the thumbnail. Maximum value: 1080.

Example : 800
version *
integer($int32)
(path)
	

The version of the document.

Example : 1
Responses
Code	Description	Links
200	

Image file in image/jpegformat for the corresponding parameters. Name of the result file: thumbnail_{docId}_{pageNr}.jpg; Example: thumbnail_5_1.jpg.
Media type
Controls Accept header.

string

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/thumbnail/5/page/1/height/1080/version/1</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    height exceeds the maximum of 1080 pixels
    height is 0 or negative
    pageNr is 0 or negative
    docId was not found or the API user does not have permission to view the document
    version was not found for the docId
    no thumbnail can be created for the document (e.g. for a .docx file)
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Preview height is limited to 1080 pixels.</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Preview height is limited to 1080 pixels.</h2>
<table>
<tr><th>URI:</th><td>/api/thumbnail/5/page/7/height/2048/version/1</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Preview height is limited to 1080 pixels.</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if height exceeds the maximum of 1080 pixels.
	No links
GET
/api/test

Tests the connection with the ecoDMS API REST Service and does not require login.
Parameters

No parameters
Responses
Code	Description	Links
200	

Fixed response of test call.
Media type
Controls Accept header.
Examples

<h1>API TEST: OK</h1>

Example Description

Response of test method.
	No links
404	

There is no error response for this call.
	No links
GET
/api/stopDebug

This call stops the Swagger UI. After it is stopped the API service is restarted, /api/test called and the response displayed in the browser. When you are using the API port productively or if it is available to everyone, it makes sense to stop Swagger.
Parameters

No parameters
Responses
Code	Description	Links
200	

Fixed response of stopDebug call. The response is only defined for media type text/html since the method is intended to be called from a browser.
Media type
Controls Accept header.
Examples

<html><head><title>Debugger</title></head><body>Debugger stopping, please wait...</body></html>

Example Description

Response of stopDebug method.
	No links
404	

There is no error response for this call.
	No links
GET
/api/status

This command provides a list with the statuses defined in ecoDMS. Each status has a unique ID and a unique name. You need the ID, for example, to search for the value of the "status" attribute in ecoDMS Archive with a search filter. Moreover, you can modify the value within a classification for a specific document using the status ID.
Parameters

No parameters
Responses
Code	Description	Links
200	

Document statuses in ecoDMS.
Media type
Controls Accept header.
Examples

[
  {
    "id": 3,
    "name": "Done"
  },
  {
    "id": 2,
    "name": "Resubmission"
  },
  {
    "id": 1,
    "name": "ToDo"
  }
]

Example Description

Example for default document statuses.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/status</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Example error message</title>
</head>
<body><h2>HTTP ERROR 404 Example error message</h2>
<table>
<tr><th>URI:</th><td>/api/status</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Example error message</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Example error message.
	No links
GET
/api/startDebug

This call starts the Swagger UI. If you can read this, you already knew that 😉.

After it is called the API service is restarted, and the Swagger UI loaded and displayed in the browser.

Example call with API key: http://localhost:8180/api/startDebug?apiKey=dGhpc2lzdGhlYXBpa2V5
Parameters
Name	Description
apiKey
string
(query)
	

Optional API key in case of API key activation

Default value :
Responses
Code	Description	Links
200	

Fixed response of startDebug call. The response is only defined for media type text/html since the method is intended to be called from a browser.
Media type
Controls Accept header.
Examples

<html><head><title>Debugger</title></head><body>Debugger starting, please wait...</body></html>

Example Description

Response of startDebug method.
	No links
404	

There is no error response for this call.
	No links
GET
/api/roles

This call provides a list of the roles (users, groups) stored in ecoDMS. For example, these values can be used to transfer an authorisation during classification.
Parameters

No parameters
Responses
Code	Description	Links
200	

List of system-, user- custom-, AD/LDAP- and AD/LDAP-user roles in ecoDMS.
Media type
Controls Accept header.
Examples

[
  "ecoICELogon",
  "ecoSIMSADMIN",
  "ecoSIMSALLDOCS",
  "ecoSIMSCLASSIFY",
  "ecoSIMSCREATEFOLDER",
  "ecoSIMSDELETE",
  "ecoSIMSHISTORY",
  "ecoSIMSINETSHARE",
  "ecoSIMSTEMPLATES",
  "ecoSIMSUSER",
  "ecoSIMSVERSIONING",
  "ecoSIMSWEBCLIENT",
  "ecoWORKZAdmin",
  "ecoWORKZUser",
  "LDAP_r_jane.doe",
  "LDAP_r_john.doe",
  "LDAP_r_max.smith",
  "Management",
  "r_ecodms",
  "r_example.user",
  "r_LDAP_MYGROUP",
  "scanner"
]

Example Description

Example for ecoDMS roles.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/roles</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Example error message</title>
</head>
<body><h2>HTTP ERROR 404 Example error message</h2>
<table>
<tr><th>URI:</th><td>/api/roles</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Example error message</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Example error message.
	No links
GET
/api/rolesForUser/{userName}

This call lists the ecoDMS roles assigned to a user.
Parameters
Name	Description
userName *
string
(path)
	

Unique name of user.

Example : ecodms
Responses
Code	Description	Links
200	

Role IDs for the user.
Media type
Controls Accept header.
Examples

[
  "r_ecodms",
  "ecoSIMSUSER",
  "ecoWORKZAdmin",
  "Management",
  "ecoSIMSADMIN",
  "ecoSIMSCLASSIFY",
  "ecoSIMSHISTORY",
  "ecoICELogon",
  "ecoSIMSCREATEFOLDER",
  "ecoSIMSVERSIONING",
  "ecoSIMSWEBCLIENT",
  "ecoSIMSTEMPLATES",
  "ecoSIMSDELETE",
  "ecoSIMSINETSHARE"
]

Example Description

Role IDs for ecodms user.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/rolesForUser/ecodms</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the user was not found
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 User [invalid] was not found!</title>
</head>
<body><h2>HTTP ERROR 404 User [invalid] was not found!</h2>
<table>
<tr><th>URI:</th><td>/api/rolesForUser/invalid</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>User [invalid] was not found!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the user was not found.
	No links
GET
/api/moveInboxFileToArchive/{id}

The document is archived via this request with the associated ID, returned in call /api/uploadFileToInbox.
Parameters
Name	Description
id *
integer($int64)
(path)
	

Unique ID of inbox document.

Example : 683601
Responses
Code	Description	Links
201	

Unique docId of archived document.
Media type
Controls Accept header.
Examples

120

Example Description

Example response for a docId.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/moveInboxFileToArchive/683601</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the API user does not have permission to use the inbox (role ecoICELogon)
    an internal error occured while moving the file to the archive

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: User is not permitted to exceute the action!</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: User is not permitted to exceute the action!</h2>
<table>
<tr><th>URI:</th><td>/api/moveInboxFileToArchive/683601</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: User is not permitted to exceute the action!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the user does not have permission to use the inbox (role ecoICELogon).
	No links
GET
/api/moveInboxFileToArchive/{id}/{archiveId}

The document is archived via this request with the associated ID, returned in call /api/uploadFileToInbox.
Parameters
Name	Description
id *
integer($int64)
(path)
	

Unique ID of inbox document.

Example : 683601
archiveId *
integer($int32)
(path)
	

This ID can be used if several ecoDMS archives exist on one ecoDMS server. Existing archives can be queried with /api/archives.

Example : 1
Responses
Code	Description	Links
201	

Unique docId of archived document.
Media type
Controls Accept header.
Examples

120

Example Description

Example response for a docId.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/moveInboxFileToArchive/683601</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the API user does not have permission to use the inbox (role ecoICELogon)
    an internal error occured while moving the file to the archive

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: User is not permitted to exceute the action!</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: User is not permitted to exceute the action!</h2>
<table>
<tr><th>URI:</th><td>/api/moveInboxFileToArchive/683601</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: User is not permitted to exceute the action!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the user does not have permission to use the inbox (role ecoICELogon).
	No links
GET
/api/licenseInfo

This call lists details about the activated ecoDMS license.
Parameters

No parameters
Responses
Curl

curl -X 'GET' \
  'http://10.10.10.115:8180/api/licenseInfo' \
  -H 'accept: application/json'

Request URL

http://10.10.10.115:8180/api/licenseInfo

Server response
Code	Details
200	
Response body
Download

[
  "Terschaweb IT",
  "QPR6-332221-0318-TLEB-1718",
  "3",
  "2025-04-01",
  "NVCL0001#ecodmsclassifyplugin",
  "NVCL0002#ecodmshelpplugin",
  "NVCL0003#ecodmsnoticeplugin",
  "NVCL0004#ecodmsversioningplugin",
  "NVCL0005#ecodmsdmstool",
  "CECL0006#ecodmsprinter",
  "NVCL0008#ecodmsexporterplugin",
  "NVCL0009#ecodmspreviewplugin",
  "NVCL0011#ecodmsworkbenchplugin",
  "NVCL0010#ecodmsapiconnects:30",
  "NVCL0012#"
]

Response headers

 cache-control: no-cache,no-store,max-age=0,must-revalidate  content-type: application/json  date: Mon,07 Apr 2025 14:09:34 GMT  expires: 0  pragma: no-cache  server: Jetty(9.4.54.v20240208)  transfer-encoding: chunked  x-content-type-options: nosniff  x-frame-options: DENY  x-xss-protection: 1; mode=block 

Responses
Code	Description	Links
200	

The returned license info list contains the following information:

    licensee
    license number
    maximum number of users
    license expiry date
    plugins included in the license
    maximum number of API connects

Media type
Controls Accept header.
Examples

[
  "Example Company",
  "ABCD-EFGH-1234-IJ56-2024-0815",
  "5",
  "2026-06-30",
  "NVCL0001#ecodmsclassifyplugin",
  "NVCL0002#ecodmshelpplugin",
  "NVCL0003#ecodmsnoticeplugin",
  "NVCL0004#ecodmsversioningplugin",
  "NVCL0005#ecodmsdmstool",
  "CECL0006#ecodmsprinter",
  "NVCL0008#ecodmsexporterplugin",
  "NVCL0009#ecodmspreviewplugin",
  "NVCL0011#ecodmsworkbenchplugin",
  "NVCL0010#ecodmsapiconnects:50",
  "NVCL0012#ecoDMS-EXT-LIC-WKZ",
  "NVCL0013#ecoDMS-EXT-LIC-API"
]

Example Description

ecoDMS license info.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/licenseInfo</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

There is no error response for this call.
	No links
GET
/api/highlightColors

This call lists the colors that are used to highlight sections in the PDF editor.
Parameters

No parameters
Responses
Code	Description	Links
200	

Fixed response with colors in hex format.
Media type
Controls Accept header.
Examples

[
  "0000ff",
  "008000",
  "00ffff",
  "800080",
  "ff0000",
  "ffff00"
]

Example Description

All colors in hex format.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/highlightColors</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

There is no error response for this call.
	No links
GET
/api/getTemplates

This call lists created templates including their classification and permission.
Parameters

No parameters
Responses
Code	Description	Links
200	

Templates created in ecoDMS.
Media type
Controls Accept header.

[
  {
    "name": "Invoice template",
    "keyWords": [
      "Invoice",
      "invoice amount",
      "amount"
    ],
    "keySequenze": "",
    "recordFields": [
      {
        "fieldId": 5,
        "name": "Ordner",
        "page": 0,
        "coords": {
          "x": 0,
          "y": 0,
          "width": 1389.3258426966293,
          "height": 100
        },
        "point": {
          "x": 103.93258666992188,
          "y": 803.3707885742188
        },
        "type": 4,
        "hasOptions": true,
        "options": "invoice\nincoming invoice",
        "barcode": false,
        "active": true,
        "offset": -1,
        "pageIndex": 1,
        "extData": "falsefalsetrue"
      }
    ],
    "autoKeyWords": "Example company Jane Doe Example Street 1 Example-Document • Dummy GmbH • Suite 562 • 948 Janelle Ferry, North Wally, CO 14877-0581",
    "autoArchive": 1,
    "readUsers": [
      "ecoSIMSUSER"
    ],
    "writeUsers": [
      "r_ecodms"
    ],
    "regExList": [
      "\\b(invoice)\\b",
      "\\b(invoice amount:)\\b"
    ],
    "notRegExList": [
      "\\b(outgoing invoice)\\b"
    ],
    "barcodeList": [
      "ABCD123456"
    ],
    "fieldActive": [
      {
        "docid": true
      },
      {
        "mainfolder": true
      },
      {
        "bemerkung": true
      },
      {
        "status": false
      },
      {
        "revision": true
      },
      {
        "folder": false
      },
      {
        "docart": false
      },
      {
        "ctimestamp": true
      },
      {
        "cdate": false
      },
      {
        "changeid": true
      },
      {
        "defdate": false
      }
    ],
    "classifyDataList": [
      {
        "mainfolder": "0"
      },
      {
        "bemerkung": "My example invoice"
      },
      {
        "status": "1"
      },
      {
        "folder": "0"
      },
      {
        "docart": "0"
      },
      {
        "cdate": "2000-08-15"
      },
      {
        "defdate": ""
      }
    ]
  }
]

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/getTemplates</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Example error message</title>
</head>
<body><h2>HTTP ERROR 404 Example error message</h2>
<table>
<tr><th>URI:</th><td>/api/getTemplates</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Example error message</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Example error message.
	No links
GET
/api/getInboxDocumentRights/{id}

The permissions for a document in the inbox can be read via this request with the associated ID, returned in /api/uploadFileToInbox.
Parameters
Name	Description
id *
integer($int32)
(path)
	

Unique ID of an inbox document.

Example : 683601
Responses
Code	Description	Links
200	

List with inbox document permissions.
Media type
Controls Accept header.
Examples

[
  "r_ecodms",
  "Management",
  "ecoSIMSCLASSIFY"
]

Example Description

Example for a result with user-, custom- and system roles.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/getInboxDocumentRights/683601</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the id is empty
    the API user does not have permission to use the inbox (role ecoICELogon)
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Unable to get rights. id is empty!!</title>
</head>
<body><h2>HTTP ERROR 404 Unable to get rights. id is empty!!</h2>
<table>
<tr><th>URI:</th><td>/api/getInboxDocumentRights</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Unable to get rights. id is empty!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the id was empty.
	No links
GET
/api/getInboxClassifications/{id}

The classification and permissions of the document in the inbox can be read via this request with the associated ID, returned in /api/uploadFileToInbox.

The result data is required for the next steps:

    /api/classifyInboxDocument
    /api/moveInboxFileToArchive

Parameters
Name	Description
id *
integer($int32)
(path)
	

Unique ID of an inbox document.

Example : 683601
Responses
Code	Description	Links
200	

EcoDMSDocumentInformation list with classify- and permission information of an inbox document.
Media type
Controls Accept header.
Examples

[
  {
    "docId": 688350,
    "clDocId": -1,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "0",
      "docid": "688350#-1",
      "defdate": "",
      "changeid": "",
      "revision": "1.0",
      "rechte": "",
      "folder": "0",
      "cdate": "2024-02-08",
      "bemerkung": "",
      "ctimestamp": "2024-02-08 14:19:01",
      "mainfolder": "0",
      "status": "1",
      "dyn_highlight": ""
    },
    "editRoles": [],
    "readRoles": []
  }
]

Example Description

Example for a result for an inbox document, wheras /api/classifyInboxDocument was not yet called.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/getInboxClassifications/683601</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the id is empty
    the inbox document was not found
    the API user does not have permission to view the document
    the API user does not have permission to use the inbox (role ecoICELogon)
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Unable to get classification. id is empty!!</title>
</head>
<body><h2>HTTP ERROR 404 Unable to get classification. id is empty!!</h2>
<table>
<tr><th>URI:</th><td>/api/getInboxClassifications/683601</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Unable to get classification. id is empty!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the id was empty.
	No links
GET
/api/folders

This call lists all folders (including all subfolders) in the ecoDMS archive.
Parameters

No parameters
Responses
Code	Description	Links
200	

List of EcoDMSFolder data in ecoDMS.
Media type
Controls Accept header.
Examples

[
  {
    "mainFolder": true,
    "foldername": "General",
    "externalKey": "",
    "buzzwords": "",
    "active": true,
    "dataString": "1﻿General﻿M﻿﻿0﻿19﻿U﻿ ﻿",
    "oId": "1"
  },
  {
    "mainFolder": false,
    "foldername": "Company",
    "externalKey": "",
    "buzzwords": "",
    "active": true,
    "dataString": "1.1Company﻿0﻿﻿0﻿6﻿U﻿ ﻿",
    "oId": "1.1"
  },
  {
    "mainFolder": false,
    "foldername": "Tax",
    "externalKey": "",
    "buzzwords": "",
    "active": true,
    "dataString": "1.2Tax0﻿﻿0﻿6﻿U﻿ ﻿",
    "oId": "1.2"
  },
  {
    "mainFolder": false,
    "foldername": "Miscellaneous",
    "externalKey": "",
    "buzzwords": "",
    "active": true,
    "dataString": "1.3Miscellaneous0﻿﻿0﻿27﻿U﻿ ﻿",
    "oId": "1.3"
  },
  {
    "mainFolder": true,
    "foldername": "Finances",
    "externalKey": "4711",
    "buzzwords": "Tax, Money",
    "active": true,
    "dataString": "10﻿FinancesM﻿4711﻿0﻿19﻿U﻿ ﻿Tax, Money",
    "oId": "10"
  },
  {
    "mainFolder": true,
    "foldername": "Bank",
    "externalKey": "",
    "buzzwords": "",
    "active": true,
    "dataString": "2﻿Bank﻿M﻿﻿0﻿18﻿U﻿ ﻿",
    "oId": "2"
  },
  {
    "mainFolder": true,
    "foldername": "Debtors",
    "externalKey": "",
    "buzzwords": "",
    "active": true,
    "dataString": "3DebtorsM﻿﻿0﻿14﻿U﻿ ﻿",
    "oId": "3"
  },
  {
    "mainFolder": true,
    "foldername": "Creditors",
    "externalKey": "",
    "buzzwords": "",
    "active": true,
    "dataString": "4Creditors﻿M﻿﻿0﻿15﻿U﻿ ﻿",
    "oId": "4"
  },
  {
    "mainFolder": true,
    "foldername": "Insurances",
    "externalKey": "",
    "buzzwords": "",
    "active": true,
    "dataString": "6Insurances﻿M﻿﻿0﻿17﻿U﻿ ﻿",
    "oId": "6"
  }
]

Example Description

Example for several ecoDMS folders.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/folders</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Fehler beim Abruf der Liste mit den Ordner vom ecoSIMS! Example error message</title>
</head>
<body><h2>HTTP ERROR 404 Fehler beim Abruf der Liste mit den Ordner vom ecoSIMS! Example error message</h2>
<table>
<tr><th>URI:</th><td>/api/folders</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Fehler beim Abruf der Liste mit den Ordner vom ecoSIMS! Example error message</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Example error message.
	No links
GET
/api/folderRoles/{folderId}
GET
/api/documentInfo/{docId}

Provides a list of EcoDMSDocumentInformation objects for the document archived in ecoDMS. This document information is required, for example, for classification (/api/classifyDocument). You can assign new (multiple) classifications and edit existing ones.

The list contains only one object, if there are no multiple classifications for the corresponding docId. Classifications, to which the user is not authorised to edit/view, are not returned in the result.
Parameters
Name	Description
docId *
integer($int64)
(path)
	

Unique id of document.

Example : 5
Responses
Code	Description	Links
200	

List with a single EcoDMSDocumentInformation object (no multiple classifications, or no permissions to view others) or several objects for additional classifications. A maximum of 1000 documents is returned for this method call.
Media type
Controls Accept header.
Examples

[
  {
    "docId": 5,
    "clDocId": 5,
    "archiveName": "1",
    "classifyAttributes": {
      "docart": "10",
      "docid": "5#5",
      "defdate": "",
      "changeid": "ecoDMS",
      "revision": "1.3",
      "rechte": "W",
      "folder": "1.1",
      "cdate": "2018-08-15",
      "bemerkung": "Example document",
      "ctimestamp": "2018-08-15 11:54:22",
      "mainfolder": "1",
      "status": "3"
    },
    "editRoles": [
      "r_ecodms"
    ],
    "readRoles": [
      "ecoSIMSUSER"
    ]
  }
]

Example Description

Example for a single classification, wheras no multiple classifications exist in the ecoDMS database (clDocId = docId).
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/documentInfo/5</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the document was not found or the user does not have permission to view the document
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Unable to find document with docid = 3000!!</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Unable to find document with docid = 3000!!</h2>
<table>
<tr><th>URI:</th><td>/api/documentInfo/3000</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Unable to find document with docid = 3000!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if a document was not found or the user has no permssion to view.
	No links
GET
/api/document/{docId}

This call returns the document file for the given docId from the ecoDMS archive.
Parameters
Name	Description
docId *
integer($int64)
(path)
	

Unique ID of document.

Example : 5
Responses
Code	Description	Links
200	

Document file in application/octet-streamformat for the corresponding parameters. Name of the result file: {docId}_{original file name when archiving}; Example: 5_my_example_invoice.pdf.
Media type
Controls Accept header.

string

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/document/5</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    docId was not found or the API user does not have permission to view the document
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Warning: User does not have required permission to see document [5000]</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Warning: User does not have required permission to see document [5000]</h2>
<table>
<tr><th>URI:</th><td>/api/document/5000</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Warning: User does not have required permission to see document [5000]</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if docId was not found or the API user does not have permission to view the document.
	No links
GET
/api/document/{docId}/{clDocId}

This call returns the document file for the given docId and clDocId from the ecoDMS archive.
Parameters
Name	Description
docId *
integer($int64)
(path)
	

Unique ID of document.

Example : 5
clDocId *
integer($int64)
(path)
	

Unique ID of document classification.

Example : 7
Responses
Code	Description	Links
200	

Document file in application/octet-streamformat for the corresponding parameters. The file name is configured in ecoDMS client.
Media type
Controls Accept header.

string

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/document/5/7</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    docId and/or clDocId were not found or the API user does not have permission to view the document
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Warning: User does not have required permission to see document [5] [5000].</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Warning: User does not have required permission to see document [5] [5000].</h2>
<table>
<tr><th>URI:</th><td>/api/document/5/5000</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Warning: User does not have required permission to see document [5] [5000].</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if docId and/or clDocId were not found or the API user does not have permission to view the document.
	No links
GET
/api/document/{docId}/{clDocId}/version/{version}

This call returns the document file version for the given docId, clDocId and version from the ecoDMS archive. If versions exist and how many versions a document has, can be checked with /api/document/{docId}/readDocumentVersions.
Parameters
Name	Description
docId *
integer($int64)
(path)
	

Unique ID of document.

Example : 5
clDocId *
integer($int64)
(path)
	

Unique ID of document classification.

Example : 7
version *
integer($int64)
(path)
	

Version number of document.

Example : 2
Responses
Code	Description	Links
200	

Document version file in application/octet-streamformat for the corresponding parameters. The file name is configured in ecoDMS client.
Media type
Controls Accept header.

string

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/document/5/7/version/2</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    docId and/or clDocId were not found or the API user does not have permission to view the document
    version was not found for the document
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Warning: User does not have required permission to see document [5] [70].</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Warning: User does not have required permission to see document [5] [70].</h2>
<table>
<tr><th>URI:</th><td>/api/document/5/70/version/1</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Warning: User does not have required permission to see document [5] [70].</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if docId and/or clDocId were not found or the API user does not have permission to view the document.
	No links
GET
/api/document/{docId}/version/{version}

This call returns the document file for the given version and docId from the ecoDMS archive. If versions exist and how many versions a document has, can be checked with /api/document/{docId}/readDocumentVersions.
Parameters
Name	Description
docId *
integer($int64)
(path)
	

Unique ID of document.

Example : 5
version *
integer($int64)
(path)
	

Version number of document.

Example : 2
Responses
Code	Description	Links
200	

Document version file in application/octet-streamformat for the corresponding parameters. Name of the result file: {docId}_{version}_{original file name of version document when archiving}; Example: 5_2_my_example_invoice_version.pdf.
Media type
Controls Accept header.

string

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/document/5/version/2</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    docId was not found or the API user does not have permission to view the document
    version was not found for the document
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Warning: User does not have required permission to see document [500]</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Warning: User does not have required permission to see document [500]</h2>
<table>
<tr><th>URI:</th><td>/api/document/500/version/1</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Warning: User does not have required permission to see document [500]</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if docId was not found or the API user does not have permission to view the document.
	No links
GET
/api/document/{docId}/readDocumentVersions

This command lists details on the versions of a document from the ecoDMS archive.
Parameters
Name	Description
docId *
integer($int64)
(path)
	

Unique ID of document.

Example : 5
Responses
Code	Description	Links
200	

List of EcoDMSVersionFormatter objects.

If a document does not have any versions, an empty result is returned. For checked out documents, checkOutUser and checkOutDate are filled for all versions (otherwise empty). For fixed documents (no new versions possible), fixed is set to true and fixUser, fixDate are filled for all versions (otherwise false / empty).
Media type
Controls Accept header.
Examples

[
  {
    "id": 1,
    "date": "2024-01-01 12:13:14",
    "user": "ecodms",
    "file": "example_invoice.pdf",
    "fixed": false,
    "fixUser": "",
    "fixDate": null,
    "comment": " ",
    "pdfFile": "example_invoice.pdf",
    "checkOutUser": "",
    "checkOutDate": null
  },
  {
    "id": 2,
    "date": "2024-01-02 14:15:16",
    "user": "ecodms",
    "file": "updated_invoice.pdf",
    "fixed": false,
    "fixUser": "",
    "fixDate": null,
    "comment": "new version",
    "pdfFile": "updated_invoice.pdf",
    "checkOutUser": "",
    "checkOutDate": null
  }
]

Example Description

Example with two document versions.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/documentInfo/5/readDocumentVersions</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    docId was not found or the API user does not have permission to view the document
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Permission denied.</title>
</head>
<body><h2>HTTP ERROR 404 de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Permission denied.</h2>
<table>
<tr><th>URI:</th><td>/api/documentInfo/20/readDocumentVersions</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>de.applord.ecodms.ecodmsjavaclient.exception.EcoDMSException: Permission denied.</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if docId was not found or the API user does not have permission to view the document.
	No links
GET
/api/document/{docId}/readBarcodes

This command provides details about the recognised barcodes on a document.
Parameters
Name	Description
docId *
integer($int64)
(path)
	

Unique ID of document.

Example : 5
Responses
Code	Description	Links
200	

EcoDMSBarcodeSearchResult object containing information about the barcodes on all pages of the document.
Media type
Controls Accept header.
Examples

{
  "barcodeCount": 3,
  "barcodes": [
    {
      "page": 0,
      "type": "DMTX",
      "barcodeData": "ZWNvRE1TOmludm9pY2VleGFtcGxl"
    },
    {
      "page": 2,
      "type": "CODE39",
      "barcodeData": "UjEyMzQ1Njc="
    },
    {
      "page": 2,
      "type": "QRCode",
      "barcodeData": "aW52b2ljZSBjb2RlIGV4YW1wbGUgIzM0Mzk4MwpleGFtcGxlIGNvbXBhbnk="
    }
  ]
}

Example Description

Example for a document with several barcodes.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/document/5/readBarcodes</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    docId was not found
    the API user does not have permission to view the document
    barcode reading is not supported for the document format
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Document not found!</title>
</head>
<body><h2>HTTP ERROR 404 Document not found!</h2>
<table>
<tr><th>URI:</th><td>/api/document/5000/readBarcodes</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Document not found!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the document for docId was not found.
	No links
GET
/api/document/{clDocId}/removeFromTrash

This command restores a document classification from the trash. You can use the following API functions to search for deleted documents:

    /api/searchDocumentsExt
    /api/searchDocumentsExtv2

Parameters
Name	Description
clDocId *
integer($int64)
(path)
	

Unique ID of document classification.

Example : 17
Responses
Code	Description	Links
200	

The document classification was successfully removed from trash.
Media type
Controls Accept header.

true

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/document/17/removeFromTrash</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    clDocId is empty
    clDocId was not found or the API user does not have permission to view the document classification
    an internal error occured while removing the document classification from trash

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Unable to restore document from trash. clDocId is null!!</title>
</head>
<body><h2>HTTP ERROR 404 Unable to restore document from trash. clDocId is null!!</h2>
<table>
<tr><th>URI:</th><td>/api/document/removeFromTrash</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Unable to restore document from trash. clDocId is null!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if clDocId is empty.
	No links
GET
/api/document/{clDocId}/readLinkedDocuments

This call lists the linked document classifications to the specified clDocId.
Parameters
Name	Description
clDocId *
integer($int64)
(path)
	

Unique ID of document classification.

Example : 17
Responses
Code	Description	Links
200	

All document classifications linked to the requested one or empty if no classifications are linked.
Media type
Controls Accept header.
Examples

[
  23,
  30,
  42
]

Example Description

Example for several linked document classifications.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/document/17/readLinkedDocuments</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    clDocId is empty
    clDocId was not found or the API user does not have permission to view the document
    the API user does not have permission to classify documents (role ecoSIMSCLASSIFY)
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Unable to read document links. clDocId is null!!</title>
</head>
<body><h2>HTTP ERROR 404 Unable to read document links. clDocId is null!!</h2>
<table>
<tr><th>URI:</th><td>/api/document/readLinkedDocuments</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Unable to read document links. clDocId is null!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if clDocId is empty.
	No links
GET
/api/document/{clDocId}/moveToTrash

This command moves a document classification to the trash. You can use the following API function to determine clDocId:

    /api/documentInfo/{docId}

Parameters
Name	Description
clDocId *
integer($int64)
(path)
	

Unique ID of document classification.

Example : 17
Responses
Code	Description	Links
200	

The document classification was successfully moved to trash.
Media type
Controls Accept header.

true

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/document/17/moveToTrash</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    clDocId is empty
    clDocId was not found or the API user does not have permission to view the document classification
    the API user does not have permission to delete documents (role ecoSIMSDELETE)
    an internal error occured while moving the document classification to trash

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Unable to move document to trash. clDocId is null!!</title>
</head>
<body><h2>HTTP ERROR 404 Unable to move document to trash. clDocId is null!!</h2>
<table>
<tr><th>URI:</th><td>/api/document/moveToTrash</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Unable to move document to trash. clDocId is null!!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if clDocId is empty.
	No links
GET
/api/dmsServerVersion

Provides information about the currently installed ecoDMS server version.
Parameters

No parameters
Responses
Code	Description	Links
200	

EcoDMSServerVersionInfo of current ecoDMS version.
Media type
Controls Accept header.

{
  "fullVersion": "24.01",
  "version": "24",
  "revision": "01",
  "patchLevel": "0"
}

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/dmsServerVersion</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Example error message</title>
</head>
<body><h2>HTTP ERROR 404 Example error message</h2>
<table>
<tr><th>URI:</th><td>/api/dmsServerVersion</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Example error message</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Example error message.
	No links
GET
/api/disconnect

This command terminates the connection with the ecoDMS API REST Service. A message confirms that the current ecoDMS user is logged off.
Parameters

No parameters
Responses
Code	Description	Links
200	

The user was successfully disconnected.
Media type
Controls Accept header.

Logoff for user ecodms successfull

	No links
404	

This response is returned if

    disconnect for the API user failed
    an internal error occured while disconnecting

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Logoff for user ecodms failed</title>
</head>
<body><h2>HTTP ERROR 404 Logoff for user ecodms failed</h2>
<table>
<tr><th>URI:</th><td>/api/disconnect</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Logoff for user ecodms failed</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Example for a failed disconnect.
	No links
GET
/api/classifyAttributes

This call lists the classify attributes in ecoDMS. Mind that attributes, that were disabled in ecoDMS client, are not listed.
Parameters

No parameters
Responses
Code	Description	Links
200	

Map with key = unique name of classify attribute and value = name of attribute.
Media type
Controls Accept header.

{
  "docart": "Document Type",
  "docid": "DocID",
  "defdate": "Resubmission on",
  "changeid": "Edited by",
  "revision": "Revision",
  "rechte": "Berechtigung",
  "folder": "Folder",
  "cdate": "Date",
  "bemerkung": "Comment",
  "ctimestamp": "Last Change",
  "mainfolder": "Main Folder",
  "status": "Status",
  "dyn_highlight": "Highlight-Colors"
}

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/classifyAttributes</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Example error message</title>
</head>
<body><h2>HTTP ERROR 404 Example error message</h2>
<table>
<tr><th>URI:</th><td>/api/classifyAttributes</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Example error message</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Example error message.
	No links
GET
/api/classifyAttributes/detailInformation

This call lists detailed information about the classify attributes in ecoDMS. Mind that attributes, that were disabled in ecoDMS client, are not listed.
Parameters

No parameters
Responses
Code	Description	Links
200	

Map with key = unique name of classify attribute and value = EcoDMSClassifyField object.
Media type
Controls Accept header.
Examples

{
  "docart": {
    "fieldID": "docart",
    "fieldName": "Document Type",
    "fieldValue": null,
    "fieldType": "eco_ComboBox",
    "classificationContent": null
  },
  "docid": {
    "fieldID": "docid",
    "fieldName": "DocID",
    "fieldValue": null,
    "fieldType": "eco_TextField",
    "classificationContent": null
  },
  "defdate": {
    "fieldID": "defdate",
    "fieldName": "Resubmission on",
    "fieldValue": null,
    "fieldType": "eco_DateField",
    "classificationContent": null
  },
  "changeid": {
    "fieldID": "changeid",
    "fieldName": "Edited by",
    "fieldValue": null,
    "fieldType": "eco_TextField",
    "classificationContent": null
  },
  "revision": {
    "fieldID": "revision",
    "fieldName": "Revision",
    "fieldValue": null,
    "fieldType": "eco_TextField",
    "classificationContent": null
  },
  "rechte": {
    "fieldID": "rechte",
    "fieldName": "Berechtigung",
    "fieldValue": null,
    "fieldType": "eco_TextField",
    "classificationContent": null
  },
  "folder": {
    "fieldID": "folder",
    "fieldName": "Folder",
    "fieldValue": null,
    "fieldType": "eco_ComboBox",
    "classificationContent": null
  },
  "cdate": {
    "fieldID": "cdate",
    "fieldName": "Date",
    "fieldValue": null,
    "fieldType": "eco_DateField",
    "classificationContent": null
  },
  "bemerkung": {
    "fieldID": "bemerkung",
    "fieldName": "Comment",
    "fieldValue": null,
    "fieldType": "eco_TextField",
    "classificationContent": null
  },
  "ctimestamp": {
    "fieldID": "ctimestamp",
    "fieldName": "Last Change",
    "fieldValue": null,
    "fieldType": "eco_DateField",
    "classificationContent": null
  },
  "mainfolder": {
    "fieldID": "mainfolder",
    "fieldName": "Main Folder",
    "fieldValue": null,
    "fieldType": "eco_ComboBox",
    "classificationContent": null
  },
  "status": {
    "fieldID": "status",
    "fieldName": "Status",
    "fieldValue": null,
    "fieldType": "eco_ComboBox",
    "classificationContent": null
  },
  "dyn_highlight": {
    "fieldID": "dyn_highlight",
    "fieldName": "Highlight-Colors",
    "fieldValue": null,
    "fieldType": "eco_Color",
    "classificationContent": null
  }
}

Example Description

Example for detailed information about classify attributes.
	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/classifyAttributes/detailInformation</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Example error message</title>
</head>
<body><h2>HTTP ERROR 404 Example error message</h2>
<table>
<tr><th>URI:</th><td>/api/classifyAttributes/detailInformation</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Example error message</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Example error message.
	No links
GET
/api/archives

This call lists the ecoDMS archives with the corresponding archive ID.
Parameters

No parameters
Responses
Code	Description	Links
200	

Map with key = unique archive ID and value = name of archive. For example, the archive ID is used in /api/connect/{archiveName}.
Media type
Controls Accept header.
Examples

{
  "1": "Standard Archive"
}

Example Description

Example for the standard ecoDMS archive.
	No links
404	

This response is returned if

    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 Example error message</title>
</head>
<body><h2>HTTP ERROR 404 Example error message</h2>
<table>
<tr><th>URI:</th><td>/api/archives</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>Example error message</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Example error message.
	No links
GET
/api/apiStatistics

This call lists the current ecoDMS API statistics:

    uploadCount: Number of already archived or uploaded documents via the ecoDMS API in the current month
    maxCount: Available number of monthly API connects
    downloadCount: Number of already downloaded or retrieved documents via the ecoDMS API in the current month

Parameters

No parameters
Responses
Code	Description	Links
200	

Map with key = statistic name and value = current value of statistic.
Media type
Controls Accept header.

{
  "uploadCount": "3",
  "maxCount": "30",
  "downloadCount": "5"
}

	No links
401	

This response is returned if no user is connected or the user is not authorized to invoke this call.
Media type

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 401 Unauthorized</title>
</head>
<body><h2>HTTP ERROR 401 Unauthorized</h2>
<table>
<tr><th>URI:</th><td>/api/apiStatistics</td></tr>
<tr><th>STATUS:</th><td>401</td></tr>
<tr><th>MESSAGE:</th><td>Unauthorized</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

	No links
404	

This response is returned if

    the API user is not an admin (role ecoSIMSADMIN)
    an internal error occured while getting the result

Media type
Examples

<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
<title>Error 404 User is not permitted to exceute the action!</title>
</head>
<body><h2>HTTP ERROR 404 User is not permitted to exceute the action!</h2>
<table>
<tr><th>URI:</th><td>/api/apiStatistics</td></tr>
<tr><th>STATUS:</th><td>404</td></tr>
<tr><th>MESSAGE:</th><td>User is not permitted to exceute the action!</td></tr>
<tr><th>SERVLET:</th><td>ecoDMS Api Service</td></tr>
</table>

</body>
</html>

Example Description

Error message, if the user is not an admin (role ecoSIMSADMIN).
	No links
Schemas
EcoDMSSearchFilter{
description:	

EcoDMSSearchFilter is used in all searchDocument functions. With it, all standard attributes and custom classify attributes can be filtered. To get an overview of most of the attributes that can be used, call /api/classifyAttributes. The key (id) of the attribute is used for the filter.

For the operators ilike and not ilike, an asterisk is automatically added at the beginning and the end of the value. Example: invoice becomes *invoice*

Standard attributes
docart
The document type. To check, which values can be filtered here, call /api/types. The id of the document type is used for the filter.
Operators

    =
    !=

docid
The id of the document. Mind that for multiple classifications, more than one result can have the same docid.
Operators

    ilike
    not ilike
    >
    >=
    <
    <=
    =
    !=

defdate
Resubmission date of a document classification. The following date pattern is used for the value: yyyy-MM-dd Example: 2018-08-15
Operators

    >
    >=
    <
    <=
    =
    !=

changeid
Edited by field of a classification. User names are used for the value.
Operators

    ilike
    not ilike
    =
    !=

revision
Revision of the document classification.
Operators

    ilike
    not ilike
    >
    >=
    <
    <=
    =
    !=

folder
The folder, to which a classification is assigned. To get an overview of all folders, /api/folders may be called. The oId of the corresponding folder is used as value for searching. If this attribute is specified, all document classifications with the specified folder as well as its subfolders are returned.
Operators

    =
    !=

folderonly
The same as folder, except that subfolders of the corresponding folder are not returned in the result.
Operators

    =
    !=

cdate
Date of a document classification. The following date pattern is used for the value: yyyy-MM-dd Example: 2018-08-15
Operators

    >
    >=
    <
    <=
    =
    !=

bemerkung
Comment field of a classification.
Operators

    ilike
    not ilike
    =
    !=

ctimestamp
Last change timestamp of a document classification. Either a date pattern (yyyy-MM-dd; Example: 2018-08-15) or a timestamp pattern (yyyy-MM-dd HH:mm:ss; Example: 2018-08-15 23:59:59) may be used for the value.
Operators

    ilike
    not ilike
    >
    >=
    <
    <=
    =
    !=

mainfolder
The main folder, to which a classification is assigned. To get an overview of all folders, /api/folders may be called. The oId of the corresponding folder (with mainFolder = true) is used as value for searching. If this attribute is specified, all document classifications with the specified main folder as well as its subfolders are returned.
Operators

    =
    !=

mainfolderonly
The same as mainfolder, except that subfolders of the corresponding main folder are not returned in the result.
Operators

    =
    !=

status
Classification status. /api/status may be called to get an overview of all statuses. The status id is used as value for the filter.
Operators

    =
    !=

fulltext
This attribute is used to search for a text only in documents.
Placeholders

Wildcards

    Question mark (?): This character replaces a letter and is used if, for example, the notation is unclear. Example: Me?er. In this case, ecoDMS, for example, searches for words like Mejer, Meier, Meyer... .

    Asterisk (*): Enter the asterisk if more values are to follow the entered values. Example: Test*. In this case, ecoDMS searches for words starting with Test with any ending (e.g. testing, test-interval, tester...).

Fuzzy search

    Tilde character (~): Place the tilde character at the end of a word and perform a fuzzy search to search for words that are similar to the entry. Example: Meier~. The search now focuses on documents which, for example, contain words like Meier, Meyer, Maier.

Boolean operators

    OR: Connect two words with this command to search either for one or the other word. Example: Sample OR Demo. This search entry searches for files that contain either the word Sample or the word Demo.

    NOT / - : Use these commands if you want to search for a file which does not include a specified word. Use either the value NOT or the value -. Place the minus symbol directly before the word you want to exclude. Examples: Sample NOT Demo, Sample -Demo. These search entries search for files that contain the word Sample but not the word Demo.

    AND / + : These commands are used for an AND operation. The search terms connected with AND have to be contained in the file. You can either use the value AND or the value +. Place the plus symbol directly before the words you want to include in the search. Examples: Sample AND Demo, +Sample +Demo. This search entry searches for files that contain the word Sample and the word Demo.

Operators

    =

fulltext-ext
This attribute is used to search for a text in documents as well as in all classification attributes. The same placeholders as in fullext search may be used. If you only enter search terms, without using +, -, OR or AND, the search terms are connected with AND.
Operators

    =

Custom attributes
Custom classification attributes. The keys (ids) of the attributes all start with dyn_; Example: dyn_0_1628150116174
Text
Custom attribute of type Text.
Operators

    ilike
    not ilike
    =
    !=

Combobox
To get the possible values for combobox attributes, /api/classifyAttributes/detailInformation is called. The fieldID is used as attribute name and the values can be determined in classificationContent.
Operators

    ilike
    not ilike
    >
    >=
    <
    <=
    =
    !=

Checkbox
For custom checkbox attributes, 2 is always used as value. Checked attributes can be determined with operator =, not checked boxes with operator !=
Operators

    =
    !=

Date
The following date pattern is used for the value of the custom date attribute: yyyy-MM-dd Example: 2018-08-15
Operators

    >
    >=
    <
    <=
    =
    !=

Numeric
Mind that only comma separators are used to filter for numeric attributes. As comma separator, use .. Example: 6250.00
Operators

    ilike
    not ilike
    >
    >=
    <
    <=
    =
    !=

classifyAttribut*	string
example: docid

The classify attribute to search for. For the possible attributes, see schema description.
searchValue*	string
example: 5

The value of the attribute to search for. For the possible values, see schema description.
searchOperator*	string
example: <=

The search operator. For the corresponding attribute operators, see schema description.
Enum:
Array [ 8 ]
}
EcoDMSDocumentInformation{
description:	

In EcoDMSDocumentInformation, all information about a document classification is returned. It is used to return as well as create a new classification for a document in the inbox or the archive.
Archive
Archive documents are uploaded with /api/uploadFile or /api/uploadFileWithPdf. The returned docid can be used to get classification information for the uploaded document.
Get document info
To get the information about a document classification, one of these functions may be called:

    /api/searchDocuments
    /api/searchDocumentsExt
    /api/searchDocumentsExtv2
    /api/documentInfo

Create new classification revision
The output for a document classification of the function /api/documentInfo can be used and updated in order to create a new classification.

    Use /api/classifyDocument to create a new classification revision.

Note: To create an extra (multiple) classification for a document, use /api/createNewClassify
Inbox
Inbox documents are uploaded with /api/uploadFileToInbox. A unique id is returned (no docid since the document is not in the archive yet).

Mind that this id must be noted/stored in order to perform further operations!
Get document info
The get the classify info for an inbox document, use the unique id of the document and call:

    /api/getInboxClassifications

Create/update classification
To update/create a classification, use/update the output of the aforementioned function and call:

    /api/classifyInboxDocument

There are no revisions for inbox documents. The function call overwrites the previous classification of an inbox document.
docId*	integer($int64)
example: 5

The unique document id for one document.

Mind that a document could have multiple classifications.

For inbox documents, this field is used for the unique inbox document id. For template classifications, the value for this field is always -1.
clDocId*	integer($int64)
example: 7

The unique id for a document classification.

For inbox documents, this field is used for the unique inbox document classification id (or -1 for a new one). For template classifications, the value for this field is always -1.
archiveName*	string
example: 1

The id of the currently used archive.

The standard archive is 1.
classifyAttributes*	{
description:	

Map of classify attributes for the document. This map does not contain attributes, that were disabled/hidden in ecoDMS.

For template classifications, it does not contain attributes, that were not checked in the template (except attribute mainfolder, which always has the value -1 in this case).

Mind that for custom checkbox attributes, the value 2 is returned for a checked value, otherwise it is not checked.

Numeric custom classify attributes must be defined with a dot (.) as decimal separator and no thousands separator (e.g. 123456.789).
< * >:	[...]
}
example: OrderedMap { "docart": "10", "docid": "5#7", "defdate": "", "changeid": "ecoDMS", "revision": "1.3", "rechte": "W", "folder": "1.1", "cdate": "2018-08-15", "bemerkung": "Example document", "ctimestamp": "2018-08-15 11:54:22", "mainfolder": "1", "status": "3" }
editRoles	[
example: List [ "r_ecodms" ]

List of roles authorized to view and edit a document classification.
string]
readRoles	[
example: List [ "ecoSIMSUSER" ]

List of roles authorized to view a document classification.
string]
}
EcoDMSSearchData{
description:	

This schema is used for an advanced search of documents in the archive.
filter	[
minItems: 1
example: List [ OrderedMap { "classifyAttribut": "docid", "searchValue": "5", "searchOperator": "<=" }, OrderedMap { "classifyAttribut": "bemerkung", "searchValue": "", "searchOperator": "!=" } ]

List of search filters. The objects in the list are concatenated by AND.
EcoDMSSearchFilter{
description:	

EcoDMSSearchFilter is used in all searchDocument functions. With it, all standard attributes and custom classify attributes can be filtered. To get an overview of most of the attributes that can be used, call /api/classifyAttributes. The key (id) of the attribute is used for the filter.

For the operators ilike and not ilike, an asterisk is automatically added at the beginning and the end of the value. Example: invoice becomes *invoice*

Standard attributes
docart
The document type. To check, which values can be filtered here, call /api/types. The id of the document type is used for the filter.
Operators

    =
    !=

docid
The id of the document. Mind that for multiple classifications, more than one result can have the same docid.
Operators

    ilike
    not ilike
    >
    >=
    <
    <=
    =
    !=

defdate
Resubmission date of a document classification. The following date pattern is used for the value: yyyy-MM-dd Example: 2018-08-15
Operators

    >
    >=
    <
    <=
    =
    !=

changeid
Edited by field of a classification. User names are used for the value.
Operators

    ilike
    not ilike
    =
    !=

revision
Revision of the document classification.
Operators

    ilike
    not ilike
    >
    >=
    <
    <=
    =
    !=

folder
The folder, to which a classification is assigned. To get an overview of all folders, /api/folders may be called. The oId of the corresponding folder is used as value for searching. If this attribute is specified, all document classifications with the specified folder as well as its subfolders are returned.
Operators

    =
    !=

folderonly
The same as folder, except that subfolders of the corresponding folder are not returned in the result.
Operators

    =
    !=

cdate
Date of a document classification. The following date pattern is used for the value: yyyy-MM-dd Example: 2018-08-15
Operators

    >
    >=
    <
    <=
    =
    !=

bemerkung
Comment field of a classification.
Operators

    ilike
    not ilike
    =
    !=

ctimestamp
Last change timestamp of a document classification. Either a date pattern (yyyy-MM-dd; Example: 2018-08-15) or a timestamp pattern (yyyy-MM-dd HH:mm:ss; Example: 2018-08-15 23:59:59) may be used for the value.
Operators

    ilike
    not ilike
    >
    >=
    <
    <=
    =
    !=

mainfolder
The main folder, to which a classification is assigned. To get an overview of all folders, /api/folders may be called. The oId of the corresponding folder (with mainFolder = true) is used as value for searching. If this attribute is specified, all document classifications with the specified main folder as well as its subfolders are returned.
Operators

    =
    !=

mainfolderonly
The same as mainfolder, except that subfolders of the corresponding main folder are not returned in the result.
Operators

    =
    !=

status
Classification status. /api/status may be called to get an overview of all statuses. The status id is used as value for the filter.
Operators

    =
    !=

fulltext
This attribute is used to search for a text only in documents.
Placeholders

Wildcards

    Question mark (?): This character replaces a letter and is used if, for example, the notation is unclear. Example: Me?er. In this case, ecoDMS, for example, searches for words like Mejer, Meier, Meyer... .

    Asterisk (*): Enter the asterisk if more values are to follow the entered values. Example: Test*. In this case, ecoDMS searches for words starting with Test with any ending (e.g. testing, test-interval, tester...).

Fuzzy search

    Tilde character (~): Place the tilde character at the end of a word and perform a fuzzy search to search for words that are similar to the entry. Example: Meier~. The search now focuses on documents which, for example, contain words like Meier, Meyer, Maier.

Boolean operators

    OR: Connect two words with this command to search either for one or the other word. Example: Sample OR Demo. This search entry searches for files that contain either the word Sample or the word Demo.

    NOT / - : Use these commands if you want to search for a file which does not include a specified word. Use either the value NOT or the value -. Place the minus symbol directly before the word you want to exclude. Examples: Sample NOT Demo, Sample -Demo. These search entries search for files that contain the word Sample but not the word Demo.

    AND / + : These commands are used for an AND operation. The search terms connected with AND have to be contained in the file. You can either use the value AND or the value +. Place the plus symbol directly before the words you want to include in the search. Examples: Sample AND Demo, +Sample +Demo. This search entry searches for files that contain the word Sample and the word Demo.

Operators

    =

fulltext-ext
This attribute is used to search for a text in documents as well as in all classification attributes. The same placeholders as in fullext search may be used. If you only enter search terms, without using +, -, OR or AND, the search terms are connected with AND.
Operators

    =

Custom attributes
Custom classification attributes. The keys (ids) of the attributes all start with dyn_; Example: dyn_0_1628150116174
Text
Custom attribute of type Text.
Operators

    ilike
    not ilike
    =
    !=

Combobox
To get the possible values for combobox attributes, /api/classifyAttributes/detailInformation is called. The fieldID is used as attribute name and the values can be determined in classificationContent.
Operators

    ilike
    not ilike
    >
    >=
    <
    <=
    =
    !=

Checkbox
For custom checkbox attributes, 2 is always used as value. Checked attributes can be determined with operator =, not checked boxes with operator !=
Operators

    =
    !=

Date
The following date pattern is used for the value of the custom date attribute: yyyy-MM-dd Example: 2018-08-15
Operators

    >
    >=
    <
    <=
    =
    !=

Numeric
Mind that only comma separators are used to filter for numeric attributes. As comma separator, use .. Example: 6250.00
Operators

    ilike
    not ilike
    >
    >=
    <
    <=
    =
    !=

classifyAttribut*	string
example: docid

The classify attribute to search for. For the possible attributes, see schema description.
searchValue*	string
example: 5

The value of the attribute to search for. For the possible values, see schema description.
searchOperator*	string
example: <=

The search operator. For the corresponding attribute operators, see schema description.
Enum:
[ ilike, not ilike, >, >=, <, <=, =, != ]
}]
sortOrder	[
example: List [ OrderedMap { "classifyAttribut": "ctimestamp", "sortDirection": "desc" }, OrderedMap { "classifyAttribut": "docid", "sortDirection": "asc" } ]
default: List [ OrderedMap { "classifyAttribut": "docid", "sortDirection": "desc" } ]

List of sort orders for the result. Sorting is applied according to the order in the list.
EcoDMSSortOrder{
description:	

Schema for sorting a document search result.
classifyAttribut*	string
example: docid

Classify attribute for sorting. To get an overview of the attributes that can be used, call /api/classifyAttributes.
sortDirection	string
example: DESC
default: ASC

Direction of the sort.
Enum:
[ ASC, DESC ]
}]
personalDocumentsOnly	boolean
example: false
default: false

If set to true, only documents that are directly assigned to the user (via user role or a role the user is assigned to) are returned.
trashedDocuments	boolean
example: false
default: false

Specifies whether only trashed documents or only documents, that are not thrashed, should be searched for.
maxDocumentCount	integer($int32)
maximum: 1000
example: 50
default: 100

Maximum number of documents in the result.
readRoles	boolean
example: true
default: true

Determines, if editRoles and readRoles should be returned in the result. If set to false, empty lists are returned for the roles.
}
EcoDMSSortOrder{
description:	

Schema for sorting a document search result.
classifyAttribut*	string
example: docid

Classify attribute for sorting. To get an overview of the attributes that can be used, call /api/classifyAttributes.
sortDirection	string
example: DESC
default: ASC

Direction of the sort.
Enum:
[ ASC, DESC ]
}
PointF{
description:	

Starting point of a RecField (highlighted area) in a form template.
x*	number
example: 103.93258666992188

X coordinates on the page.
y*	number
example: 803.3707885742188

Y coordinates on the page.
}
RecField{
description:	

Field (rectangle), defined in a form template.
fieldId*	integer($int32)
example: 5

Internal id of the classification field, that is filled.
name*	string
example: Ordner

Name of the classification field, that is filled.
page*	integer($int32)
example: 0

Page of the document, the field was drawn on (The value 0 means page 1).
coords*	RectF{
description:	

Information about width and height of a RecField (highlighted area) in a form template.
x*	number
example: 0
default: 0

This value is always 0.
y*	number
example: 0
default: 0

This value is always 0.
width*	number
example: 1389.3258426966293

Width of the RecField.
height*	number
example: 100

Height of the RecField.
}
point*	PointF{
description:	

Starting point of a RecField (highlighted area) in a form template.
x*	number
example: 103.93258666992188

X coordinates on the page.
y*	number
example: 803.3707885742188

Y coordinates on the page.
}
type*	integer($int32)
example: 4

Type of the classification field. Possible types:

    0: Text
    1: Date
    2: CheckBox
    3: Numeric
    4: Folder

Enum:
[ 0, 1, 2, 3, 4 ]
hasOptions*	boolean
example: true

Indicates, if the field has additional options in order to identify the correct value.
options	string
nullable: true
example: invoice incoming invoice

Additional options that have to match the detected value in order for the template to be applied to the document.
barcode*	boolean
example: false

Specifies, whether the highlighted area is a barcode.
active*	boolean
example: true
default: true

States, if the highlighted area is active. This value is always set to true.
offset*	integer($int32)
maximum: 0
minimum: -1000
example: -1
default: 0

Negative page offset, starting from the last page. The offset is only applied, if pageIndex is set to 1. If the number of the last page minus the offset is negative, the first page is used.
pageIndex*	integer($int32)
example: 1
default: 0

Indicates, if the last page is used or not.

    0: Do not use last page
    1: Use last page

Enum:
[ 0, 1 ]
extData	string
nullable: true
example: falsefalsetrue

Additional field information. This value is only filled for folders (type 4).

If filled, it contains 3 flags, separated by the non-printable character "ByteOrderMark" ( {0xFE, 0xFF} ).

    First flag: Search in folder name
    Second flag: Search in external key of folder
    Third flag: Search in buzzwords of folder

}
RectF{
description:	

Information about width and height of a RecField (highlighted area) in a form template.
x*	number
example: 0
default: 0

This value is always 0.
y*	number
example: 0
default: 0

This value is always 0.
width*	number
example: 1389.3258426966293

Width of the RecField.
height*	number
example: 100

Height of the RecField.
}
ecoDMSTemplate{
description:	

Schema for a template created in ecoDMS.
name*	string
example: Invoice template

Name of the template.
keyWords	[
example: List [ "Invoice", "invoice amount", "amount" ]

Keywords to search for. The values are case insensitive (upper- or lower case does not matter).
string]
keySequenze	string
example:
default:

Key shortcut for the template. This always returns an empty String in the API (no matter if it is filled in ecoDMS Client).
recordFields	[

List of fields (rectangles), that were marked in the form template.
RecField{
description:	

Field (rectangle), defined in a form template.
fieldId*	integer($int32)
example: 5

Internal id of the classification field, that is filled.
name*	string
example: Ordner

Name of the classification field, that is filled.
page*	integer($int32)
example: 0

Page of the document, the field was drawn on (The value 0 means page 1).
coords*	RectF{
description:	

Information about width and height of a RecField (highlighted area) in a form template.
x*	number
example: 0
default: 0

This value is always 0.
y*	number
example: 0
default: 0

This value is always 0.
width*	number
example: 1389.3258426966293

Width of the RecField.
height*	number
example: 100

Height of the RecField.
}
point*	PointF{
description:	

Starting point of a RecField (highlighted area) in a form template.
x*	number
example: 103.93258666992188

X coordinates on the page.
y*	number
example: 803.3707885742188

Y coordinates on the page.
}
type*	integer($int32)
example: 4

Type of the classification field. Possible types:

    0: Text
    1: Date
    2: CheckBox
    3: Numeric
    4: Folder

Enum:
[ 0, 1, 2, 3, 4 ]
hasOptions*	boolean
example: true

Indicates, if the field has additional options in order to identify the correct value.
options	string
nullable: true
example: invoice incoming invoice

Additional options that have to match the detected value in order for the template to be applied to the document.
barcode*	boolean
example: false

Specifies, whether the highlighted area is a barcode.
active*	boolean
example: true
default: true

States, if the highlighted area is active. This value is always set to true.
offset*	integer($int32)
maximum: 0
minimum: -1000
example: -1
default: 0

Negative page offset, starting from the last page. The offset is only applied, if pageIndex is set to 1. If the number of the last page minus the offset is negative, the first page is used.
pageIndex*	integer($int32)
example: 1
default: 0

Indicates, if the last page is used or not.

    0: Do not use last page
    1: Use last page

Enum:
[ 0, 1 ]
extData	string
nullable: true
example: falsefalsetrue

Additional field information. This value is only filled for folders (type 4).

If filled, it contains 3 flags, separated by the non-printable character "ByteOrderMark" ( {0xFE, 0xFF} ).

    First flag: Search in folder name
    Second flag: Search in external key of folder
    Third flag: Search in buzzwords of folder

}]
autoKeyWords	string
example: Example company Jane Doe Example Street 1 Example-Document • Dummy GmbH • Suite 562 • 948 Janelle Ferry, North Wally, CO 14877-0581

Identified header- and footer keywords for a form template.
autoArchive*	integer($int32)
example: 1
default: -1

Indicates, if the documents should automatically be moved to the archive if a template was detected.

The values -1 and 0 correspond to false (do not move document to archive);

1 corresponds to true (move document to archive).
readUsers	[
example: List [ "ecoSIMSUSER" ]

List of roles that are only allowed to view the documents to which this template is applied.
string]
writeUsers	[
example: List [ "r_ecodms" ]

List of roles that can classify and view the documents to which this template is applied.
string]
regExList	[
example: List [ "\\b(invoice)\\b", "\\b(invoice amount:)\\b" ]

List of regular expression to search for in a document, defined in the keywords with REGEX:.
string]
notRegExList	[
example: List [ "\\b(outgoing invoice)\\b" ]

List of regular expression to exclude (if found in a document, do not apply this template), defined in the keywords with !REGEX:.
string]
barcodeList	[
example: List [ "ABCD123456" ]

List of barcodes to search for in a document, ņdefined in the keywords with BAR:.
string]
fieldActive	[
example: List [ OrderedMap { "docid": true }, OrderedMap { "mainfolder": true }, OrderedMap { "bemerkung": true }, OrderedMap { "status": false }, OrderedMap { "revision": true }, OrderedMap { "folder": false }, OrderedMap { "docart": false }, OrderedMap { "ctimestamp": true }, OrderedMap { "cdate": false }, OrderedMap { "changeid": true }, OrderedMap { "defdate": false } ]

Defines, which classification attributes will be set for a document, once the template is applied. The following standard attributes are always set to true and not visible in the template in ecoDMS:

    docid
    mainfolder
    revision
    ctimestamp
    changeid

The following attributes will be filled with a default value if they were not checked:

    mainfolder: 0 (if folder was not checked)
    status: 1
    folder: 0
    docart: 0
    cdate: current date

{
< * >:	boolean
}]
classifyDataList	[
example: List [ OrderedMap { "mainfolder": "0" }, OrderedMap { "bemerkung": "My example invoice" }, OrderedMap { "status": "1" }, OrderedMap { "folder": "0" }, OrderedMap { "docart": "0" }, OrderedMap { "cdate": "2000-08-15" }, OrderedMap { "defdate": "" } ]

List of classify attributes to be set in a document classification if this template is applied.
{
< * >:	string
}]
}
EcoDMSFolder{
description:	

Schema for creating, updating and read result of ecoDMS folders.
mainFolder	boolean
example: true
default: true

States, if the folder is a main folder.
foldername*	string
example: Invoices

Name of the folder.
externalKey	string
example:
default:

Optional external key of folder.
buzzwords	string
example:
default:

Optional buzzwords for folder.
active	boolean
example: true
default: true

Indicates, if the folder is active (displayed). If a folder is created, this value is ignored (always true). When editing a folder, it can be set to inactive.
dataString	string
example: 5Invoices﻿M﻿﻿0﻿19﻿U﻿

Data string for ecoDMS internal processing. When creating or editing a folder, the value of this attribute is ignored.
oId	string
example: 5

Unique identifier of folder. This attribute is required for editing a folder and is always returned when reading folders. If a folder is created, it is not needed since the new id of the created folder is returned.
}
EcoDMSDuplicate{
description:	

The schema represents a duplicate found in the ecoDMS archive.
docId*	integer($int64)
example: 5

Unique identifier of a document.
page*	integer($int64)
example: 1

Page number of the duplicate page.
version*	integer($int64)
example: 1

Version of document (If no version exists, 1 is returned as value).
matchValue*	number($float)
example: 91.79133

Percentage to which the document matches.
inputThumbId*	string
example: 0

Unique ID of input document thumbnail that matches the page of the document.
}
EcoDMSDuplicates{
description:	

Contains a list of duplicate documents in the ecoDMS archive as well as a list of thumbnails of the input document for which duplicates were found.
duplicates	[

List of duplicate documents (pages/versions of a document) in the ecoDMS archive. If no duplicates were found, this list is empty.
EcoDMSDuplicate{
description:	

The schema represents a duplicate found in the ecoDMS archive.
docId*	integer($int64)
example: 5

Unique identifier of a document.
page*	integer($int64)
example: 1

Page number of the duplicate page.
version*	integer($int64)
example: 1

Version of document (If no version exists, 1 is returned as value).
matchValue*	number($float)
example: 91.79133

Percentage to which the document matches.
inputThumbId*	string
example: 0

Unique ID of input document thumbnail that matches the page of the document.
}]
inputThumbs	{
description:	

Map of thumbnails for duplicate pages of the input document or empty map if no duplicate was found.

    key: Unique id of a page thumbnail of the input document
    value: Thumbnail encoded Base64 in image/jpeg format

< * >:	string

Map of thumbnails for duplicate pages of the input document or empty map if no duplicate was found.

    key: Unique id of a page thumbnail of the input document
    value: Thumbnail encoded Base64 in image/jpeg format

}
}
EcoDMSDocType{
description:	

Schema of an ecoDMS document type.
id*	integer($int32)
example: 2

Internal unique identifier of a document type.
name*	string
example: Incoming invoice

Name of the document type.
frist*	EcoDMSFrist{
description:	

Information about the retention period (minimum archiving period) of a document type. If the value 0 is set for years, month and days, the retention period is not checked.
jahre*	integer($int32)
maximum: 99
minimum: 0
example: 1
default: 0

Years, for which the document with the corresponding document type is kept.
monate*	integer($int32)
maximum: 99
minimum: 0
example: 2
default: 0

Months, for which the document with the corresponding document type is kept.
tage*	integer($int32)
maximum: 99
minimum: 0
example: 3
default: 0

Days, for which the document with the corresponding document type is kept.
type*	string
example: P

Indicates, if the retention period is checked before deleting.

    P: period is checked
    D: period is not checked

Enum:
[ P, D ]
}
}
EcoDMSFrist{
description:	

Information about the retention period (minimum archiving period) of a document type. If the value 0 is set for years, month and days, the retention period is not checked.
jahre*	integer($int32)
maximum: 99
minimum: 0
example: 1
default: 0

Years, for which the document with the corresponding document type is kept.
monate*	integer($int32)
maximum: 99
minimum: 0
example: 2
default: 0

Months, for which the document with the corresponding document type is kept.
tage*	integer($int32)
maximum: 99
minimum: 0
example: 3
default: 0

Days, for which the document with the corresponding document type is kept.
type*	string
example: P

Indicates, if the retention period is checked before deleting.

    P: period is checked
    D: period is not checked

Enum:
[ P, D ]
}
EcoDMSDocTypeClassification{
description:	

Configuration of a classify attribute for a document type.
docTypeId*	integer($int64)
example: 2

Unique document type identifier.
index*	integer($int32)
example: 5

Internal index of the classify attribute.
fieldId*	string
example: status

Classify attribute name.
hidden*	boolean
example: false

States, if the classify attribute should be hidden for this document type.
mandatory*	boolean
example: true

Indicates, if the classify attribute must be filled for this document type.
}
EcoDMSDocState{
description:	

Represents a state of a document.
id*	integer($int32)
example: 2

Unique identifier of a state.
name*	string
example: Resubmission

Name of state.
}
EcoDMSVersionFormatter{
description:	

Information about a document version in ecoDMS.
id*	integer($int64)
example: 3

Version number.
date*	string
pattern: yyyy-MM-dd HH:mm:ss
example: 2024-01-01 12:00:00

Date and time, on which the document version was added.
user*	string
example: ecodms

ID of user who created the document version.
file*	string
example: invoice_document_3.docx

Initial file name of the document for this version.
fixed*	boolean
example: false

Indicates, whether the document was finalised.
fixUser	string
example:

ID of user who finalised the document.
fixDate	[
pattern: yyyy-MM-dd HH:mm:ss
nullable: true
example: null

Date and time, on which the document was finalised.
string($date-time)]
comment	string
example: Invoice version 3

Optional comment for this document version.
pdfFile*	string
example: invoice_document_3.pdf

File name of the PDF document of this document version.
checkOutUser	string
example: ecodms

ID of user who locked the document.
checkOutDate	string
pattern: yyyy-MM-dd HH:mm:ss
nullable: true
example: 2024-08-15 14:15:16

Date and time, on which the document was checked out.
}
EcoDMSBarcodeInformation{
description:	

Data of a barcode in a document.
page*	number
example: 0

Number of the page, that contains the barcode ( 0 is the first page, 1 the second one and so on ... ).
type*	string
example: DMTX

Type of the barcode.
Enum:
[ DMTX, QRCODE, I2N, CODE39, CODE93, CODE128, AZTEC, CODABAR, MAXICODE, DATABAR, DATABAREXPANDED, EAN13, EAN8, PDF417, UPCA, UPCE, ALL ]
barcodeData*	string
example: ZWNvRE1TOmludm9pY2VleGFtcGxl

Identified barcode data, encoded in Base64.
}
EcoDMSBarcodeSearchResult{
description:	

Result of all detected barcodes on a document.
barcodeCount*	number
example: 3

Number of detected barcode in a document.
barcodes	[
example: List [ OrderedMap { "page": 0, "type": "DMTX", "barcodeData": "ZWNvRE1TOmludm9pY2VleGFtcGxl" }, OrderedMap { "page": 2, "type": "CODE39", "barcodeData": "UjEyMzQ1Njc=" }, OrderedMap { "page": 2, "type": "QRCode", "barcodeData": "aW52b2ljZSBjb2RlIGV4YW1wbGUgIzM0Mzk4MwpleGFtcGxlIGNvbXBhbnk=" } ]

Data of all detected barcodes in a document.
EcoDMSBarcodeInformation{
description:	

Data of a barcode in a document.
page*	number
example: 0

Number of the page, that contains the barcode ( 0 is the first page, 1 the second one and so on ... ).
type*	string
example: DMTX

Type of the barcode.
Enum:
[ DMTX, QRCODE, I2N, CODE39, CODE93, CODE128, AZTEC, CODABAR, MAXICODE, DATABAR, DATABAREXPANDED, EAN13, EAN8, PDF417, UPCA, UPCE, ALL ]
barcodeData*	string
example: ZWNvRE1TOmludm9pY2VleGFtcGxl

Identified barcode data, encoded in Base64.
}]
}
EcoDMSServerVersionInfo{
description:	

Information about the currently installed ecoDMS-Server version.
fullVersion*	string
example: 24.01

Complete version number.
version*	string
example: 24

Year of the release.
revision*	string
example: 01

Consecutive number, starting with 01 in a new year.
patchLevel*	string
example: 0

Patch level of release (not contained in fullVersion for the first one - 0).
}
EcoDMSClassifyField{
description:	

Detailed information about a classification attribute in ecoDMS.
fieldID*	string
example: bemerkung

unique identifier of classify field.
fieldName*	string
example: Comment

Name of classify field.
fieldValue	[
nullable: true
example: null

The value for this field is always null.
string]
fieldType*	string
example: eco_TextField

Type of the classify field.
Enum:
[ eco_TextField, eco_Numeric, eco_ComboBox, eco_CheckBox, eco_DateField, eco_Color, eco_Unknown ]
classificationContent	[
nullable: true
example: null

This value is only filled for custom added classify attributes of the following types:

    eco_TextField: Most recent 100 values
    eco_ComboBox: ComboBox choices

For all other types/classify attributes, the value is null.
string]
}
