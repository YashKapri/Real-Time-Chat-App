// backend/handlers/generateUploadUrl.js
// HTTP API endpoint to generate a pre-signed URL for S3 uploads.

const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const UPLOADS_BUCKET_NAME = process.env.UPLOADS_BUCKET_NAME;

exports.handler = async (event) => {
  console.log('generateUploadUrl event', JSON.stringify(event));

  if (!UPLOADS_BUCKET_NAME) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'UPLOADS_BUCKET_NAME not configured' })
    };
  }

  const body = parseBody(event.body);
  const filename = body.filename || 'upload.bin';
  const contentType = body.contentType || 'application/octet-stream';
  const userId = body.userId || 'anonymous';

  const key = `${userId}/${Date.now()}-${sanitizeFilename(filename)}`;

  const params = {
    Bucket: UPLOADS_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    Expires: 300 // 5 minutes
  };

  try {
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify({
        uploadUrl,
        fileUrl: `https://${UPLOADS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
      })
    };
  } catch (err) {
    console.error('Error generating pre-signed URL', err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify({ error: 'Failed to generate upload URL' })
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

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}
