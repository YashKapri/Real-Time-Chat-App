// backend/handlers/connect.js
// WebSocket $connect route handler.
// Registers the connection and basic user info in DynamoDB.

const { parseUserFromEvent } = require('../lib/auth');
const { saveConnection, upsertRoom, upsertUser } = require('../lib/dynamo');

const DEFAULT_ROOM_ID = 'global';

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  console.log('Connect event', JSON.stringify(event));

  const user = parseUserFromEvent(event);

  // Ensure default room exists
  await upsertRoom({ roomId: DEFAULT_ROOM_ID, name: 'Global Room' });

  // Optionally store user record
  await upsertUser({ userId: user.userId || connectionId, userName: user.userName });

  await saveConnection({
    connectionId,
    userId: user.userId || connectionId,
    userName: user.userName,
    roomId: DEFAULT_ROOM_ID
  });

  // Optionally return data to client on connection ack (not required for WS)
  return {
    statusCode: 200,
    body: 'Connected.'
  };
};
