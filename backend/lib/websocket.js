// backend/lib/websocket.js
// Helpers for posting messages to WebSocket connections via API Gateway.

const AWS = require('aws-sdk');

/**
 * Returns an ApiGatewayManagementApi client for the current request context.
 */
function getApiGatewayManagementApi(event) {
  const { domainName, stage } = event.requestContext;
  const endpoint = `${domainName}/${stage}`;

  return new AWS.ApiGatewayManagementApi({
    endpoint
  });
}

/**
 * Send a payload to a single connection.
 */
async function postToConnection(api, connectionId, payload) {
  try {
    await api
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(payload)
      })
      .promise();
  } catch (err) {
    if (err.statusCode === 410) {
      console.warn(`Stale connection, should delete: ${connectionId}`);
    } else {
      console.error('postToConnection error', err);
    }
    throw err;
  }
}

/**
 * Broadcast payload to all connections in a room.
 */
async function broadcastToRoom(event, connections, payload) {
  const api = getApiGatewayManagementApi(event);

  const tasks = connections.map((conn) =>
    api
      .postToConnection({
        ConnectionId: conn.connectionId,
        Data: JSON.stringify(payload)
      })
      .promise()
      .catch((err) => {
        if (err.statusCode === 410) {
          console.warn(`Found stale connection ${conn.connectionId}`);
        } else {
          console.error('Error broadcasting to connection', conn.connectionId, err);
        }
      })
  );

  await Promise.all(tasks);
}

module.exports = {
  getApiGatewayManagementApi,
  postToConnection,
  broadcastToRoom
};
