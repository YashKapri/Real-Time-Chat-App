// frontend/src/api.js
// Small API helper for uploads and WebSocket management.

import { WS_ENDPOINT, UPLOAD_API_URL } from './config';

export function createWebSocketConnection(userName) {
  if (!WS_ENDPOINT) {
    console.warn('VITE_WS_ENDPOINT is not configured. WebSocket disabled.');
    return null;
  }

  const url = new URL(WS_ENDPOINT);
  // Attach userName as query param for demo auth (or token in real setups)
  if (userName) {
    url.searchParams.set('userName', userName);
  }

  const socket = new WebSocket(url.toString());
  return socket;
}

export async function requestUploadUrl({ filename, contentType, userId }) {
  if (!UPLOAD_API_URL) {
    throw new Error('UPLOAD_API_URL not configured');
  }

  const res = await fetch(UPLOAD_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filename, contentType, userId })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to get upload URL: ${errText}`);
  }

  return res.json();
}
