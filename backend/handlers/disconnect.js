// backend/handlers/disconnect.js
// WebSocket $disconnect route handler.
// Cleans up the connection record from DynamoDB.

const { deleteConnection } = require('../lib/dynamo');

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  console.log('Disconnect event', JSON.stringify(event));

  try {
    await deleteConnection(connectionId);
  } catch (err) {
    console.error('Error deleting connection', connectionId, err);
  }

  return {
    statusCode: 200,
    body: 'Disconnected.'
  };
};
