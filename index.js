// Dieses Modul exportiert alle Nodes, die in diesem Paket enthalten sind
// Es dient als Einstiegspunkt für n8n, um die Nodes zu laden

module.exports = {
	// Nodes im dist-Ordner, werden von n8n genutzt
	// Diese Einträge müssen mit den Pfaden in package.json übereinstimmen
	get nodeTypes() {
		return [require('./dist/nodes/EcoDMS/EcoDMS.node.js')];
	},
	get credentialTypes() {
		return [require('./dist/credentials/EcoDmsApi.credentials.js')];
	},
};
