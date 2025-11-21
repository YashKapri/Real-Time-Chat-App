# Real-time Chat App (Serverless, AWS, React) 

Production-ready real-time chat application:

- **Frontend:** React (Vite) SPA, WebSocket client, minimal but clean UI.
- **Backend:** AWS Lambda handlers behind API Gateway WebSocket.
- **Database:** DynamoDB (Users, Rooms, Messages, Connections).
- **Storage:** S3 for frontend static files and user uploads.
- **Delivery:** CloudFront over S3 for global CDN + HTTPS.
- **CI/CD:** GitHub Actions pipeline for build, test, and deploy.
- **Auth:** JWT-aware design (optional); ready to integrate Cognito or any IdP.

> Region defaults to **ap-south-1 (Mumbai)** for Indian market.

---

## Architecture Overview

```txt
Browser (React + WebSocket client)
  |
  |  HTTPS (CloudFront)
  v
S3 (Frontend static hosting)
  |
  |  wss:// (API Gateway WebSocket)
  v
API Gateway WebSocket
  - $connect        -> Lambda: connect
  - $disconnect     -> Lambda: disconnect
  - $default        -> Lambda: default (sendMessage, etc.)
  |
  v
Lambda Functions
  - connect: Register connection in DynamoDB
  - disconnect: Cleanup connection
  - default: Persist messages, broadcast to room
  - generateUploadUrl (HTTP API): Pre-signed S3 upload URLs
  |
  v
DynamoDB Tables
  - Connections
  - Messages
  - Users
  - Rooms

S3 (Uploads bucket) for user file uploads through pre-signed URLs.


