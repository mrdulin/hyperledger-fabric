const Fabric_Client = require('fabric-client');
const path = require('path');

const fabric_client = new Fabric_Client();
const store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:' + store_path);

Fabric_Client.newDefaultKeyValueStore({ path: store_path }).then(state_store => {
  fabric_client.setStateStore(state_store);

  const crypto_suite = Fabric_Client.newCryptoSuite();
});
