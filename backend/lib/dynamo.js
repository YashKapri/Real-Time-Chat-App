// backend/lib/dynamo.js
// Small helper wrapper around DynamoDB DocumentClient.

const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;
const MESSAGES_TABLE = process.env.MESSAGES_TABLE;
const ROOMS_TABLE = process.env.ROOMS_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;

/**
 * Save a WebSocket connection.
 */
async function saveConnection({ connectionId, userId, userName, roomId }) {
  const item = {
    connectionId,
    userId: userId || connectionId, // fallback
    userName: userName || 'Guest',
    roomId: roomId || 'global',
    connectedAt: new Date().toISOString()
  };

  await dynamo
    .put({
      TableName: CONNECTIONS_TABLE,
      Item: item
    })
    .promise();

  return item;
}

/**
 * Delete WebSocket connection by connectionId.
 */
async function deleteConnection(connectionId) {
  await dynamo
    .delete({
      TableName: CONNECTIONS_TABLE,
      Key: { connectionId }
    })
    .promise();
}

/**
 * Get a connection by connectionId.
 */
async function getConnection(connectionId) {
  const result = await dynamo
    .get({
      TableName: CONNECTIONS_TABLE,
      Key: { connectionId }
    })
    .promise();

  return result.Item || null;
}

/**
 * Get all active connections in a room.
 */
async function getConnectionsByRoom(roomId) {
  const result = await dynamo
    .query({
      TableName: CONNECTIONS_TABLE,
      IndexName: 'roomIndex',
      KeyConditionExpression: 'roomId = :roomId',
      ExpressionAttributeValues: {
        ':roomId': roomId
      }
    })
    .promise();

  return result.Items || [];
}

/**
 * Save a chat message.
 */
async function saveMessage({ roomId, messageId, userId, userName, content }) {
  const createdAt = new Date().toISOString();
  const item = {
    roomId,
    createdAt,
    messageId,
    userId,
    userName,
    content
  };

  await dynamo
    .put({
      TableName: MESSAGES_TABLE,
      Item: item
    })
    .promise();

  return item;
}

/**
 * Create room if not exists (simple insert - last write wins).
 */
async function upsertRoom({ roomId, name }) {
  const item = {
    roomId,
    name: name || roomId,
    createdAt: new Date().toISOString()
  };

  await dynamo
    .put({
      TableName: ROOMS_TABLE,
      Item: item
    })
    .promise();

  return item;
}

/**
 * Save a user record (idempotent upsert).
 */
async function upsertUser({ userId, userName }) {
  if (!userId) return;
  const item = {
    userId,
    userName,
    createdAt: new Date().toISOString()
  };

  await dynamo
    .put({
      TableName: USERS_TABLE,
      Item: item
    })
    .promise();

  return item;
}

module.exports = {
  saveConnection,
  deleteConnection,
  getConnection,
  getConnectionsByRoom,
  saveMessage,
  upsertRoom,
  upsertUser
};

