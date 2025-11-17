# DynamoDB Schema

This chat app uses **four tables**. All are provisioned in `serverless.yml` with `PAY_PER_REQUEST` billing (on-demand).

---

## 1. Connections Table

**Table name:** `${service}-${stage}-connections`  
**Purpose:** Track active WebSocket connections.

- **Primary key**
  - `connectionId` (string) – WebSocket connection ID from API Gateway.

- **Attributes**
  - `userId` (string) – logical user identifier (from JWT or fallback to connectionId).
  - `userName` (string) – display name.
  - `roomId` (string) – current room; we use `"global"` by default.
  - `connectedAt` (string, ISO timestamp).

- **GSI**
  - `roomIndex`
    - PK: `roomId` (string).
    - Projection: `ALL`.
    - Used by: `getConnectionsByRoom(roomId)` for broadcasting messages.

**Access patterns:**

- `PutItem` on `$connect`.
- `DeleteItem` on `$disconnect`.
- `GetItem` by `connectionId`.
- `Query` by `roomId` using GSI for broadcasting.

---

## 2. Messages Table

**Table name:** `${service}-${stage}-messages`  
**Purpose:** Store chat messages per room.

- **Primary key**
  - PK: `roomId` (string).
  - SK: `createdAt` (string; ISO timestamp).

- **Attributes**
  - `messageId` (string; UUID).
  - `userId` (string).
  - `userName` (string).
  - `content` (string).

**Access patterns:**

- `PutItem` on new message.
- `Query` (not shown in code but ready) by `roomId` with pagination on `createdAt`.

---

## 3. Rooms Table

**Table name:** `${service}-${stage}-rooms`  
**Purpose:** Represents chat rooms (currently we use only `global`).

- **Primary key**
  - `roomId` (string).

- **Attributes**
  - `name` (string).
  - `createdAt` (string, ISO timestamp).

**Access patterns:**

- `PutItem` to upsert room in `connect.js`.
- Potential future: `Scan` or `GetItem` for room directory.

---

## 4. Users Table

**Table name:** `${service}-${stage}-users`  
**Purpose:** Records of known users.

- **Primary key**
  - `userId` (string, from JWT `sub` or internal id).

- **Attributes**
  - `userName` (string).
  - `createdAt` (string, ISO timestamp).
  - Optional: `email`, etc.

**Access patterns:**

- `PutItem` upsert on connect (demo).
- Future: `GetItem` for user profiles, preferences, etc.

---

## Notes for Interview

1. **Why GSI on roomId?**  
   We broadcast to all connections in a room. That requires `Query` by `roomId`, so we design the primary key for fast `connectionId` lookups and GSI for room broadcast.

2. **Hot partitions?**  
   A very large single room (e.g., `global`) could become a hot partition. For extremely high scale, you’d introduce sharding or additional keys (e.g., `roomId#shard`), or break the room into logical segments.

3. **TTL**  
   We could add TTL on `Connections` and/or `Messages` to auto-expire old data.

4. **Strong vs eventual consistency**  
   Chat messages tolerate eventual consistency; we use default (eventual) reads.
