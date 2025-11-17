// backend/handlers/default.js
// WebSocket $default route handler.
// Handles incoming chat actions, e.g. sendMessage.

const crypto = require('crypto');
const {
  getConnection,
  getConnectionsByRoom,
  saveMessage
} = require('../lib/dynamo');
const { broadcastToRoom } = require('../lib/websocket');

const DEFAULT_ROOM_ID = 'global';

exports.handler = async (event) => {
  console.log('Default (message) event', JSON.stringify(event));

  const connectionId = event.requestContext.connectionId;
  const body = parseBody(event.body);

  const action = body.action || 'sendMessage';
  const content = (body.content || '').toString().trim();

  // Basic validation
  if (action === 'sendMessage' && !content) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Message content is required' })
    };
  }

  // Look up current connection to know userName and roomId
  const conn = await getConnection(connectionId);
  if (!conn) {
    console.warn('Connection not found for id', connectionId);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Connection not registered' })
    };
  }

  const roomId = conn.roomId || DEFAULT_ROOM_ID;

  switch (action) {
    case 'sendMessage':
      return await handleSendMessage(event, conn, roomId, content);
    default:
      console.warn('Unknown action', action);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Unknown action: ${action}` })
      };
  }
};

function parseBody(body) {
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch (err) {
    console.error('Failed to parse body', body, err);
    return {};
  }
}

async function handleSendMessage(event, conn, roomId, content) {
  const messageId = crypto.randomUUID();
  const message = await saveMessage({
    roomId,
    messageId,
    userId: conn.userId,
    userName: conn.userName,
    content
  });

  const connections = await getConnectionsByRoom(roomId);

  const payload = {
    type: 'NEW_MESSAGE',
    roomId,
    message: {
      id: message.messageId,
      createdAt: message.createdAt,
      userId: message.userId,
      userName: message.userName,
      content: message.content
    }
  };

  await broadcastToRoom(event, connections, payload);

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true })
  };
}
