// frontend/src/components/UploadButton.jsx

import { useRef, useState } from 'react';
import { requestUploadUrl } from '../api';

export default function UploadButton({ currentUserName, userId = 'anonymous' }) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null);

  const handleClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus(`Preparing upload for "${file.name}" ...`);

    try {
      const res = await requestUploadUrl({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        userId
      });

      setStatus('Uploading to S3...');
      await fetch(res.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        }
      });

      setStatus(`Uploaded! Public URL: ${res.fileUrl}`);
    } catch (err) {
      console.error(err);
      setStatus('Upload failed. Check console for details.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <button type="button" className="upload-button" onClick={handleClick}>
        📎 Attach file
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {status && <div className="upload-status">{status}</div>}
    </div>
  );
}
