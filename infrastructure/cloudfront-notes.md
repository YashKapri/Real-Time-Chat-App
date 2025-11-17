# CloudFront Configuration for Frontend

The stack creates an S3 bucket `${service}-${stage}-frontend` for static hosting.

To front it with CloudFront:

1. **Create Distribution**

   - Origin:
     - Type: S3 bucket.
     - Select the frontend bucket.
   - Origin access:
     - For simplicity in this template: bucket is public-read.
     - In real production, use Origin Access Control (OAC) and make bucket private.

2. **Default Cache Behavior**

   - Viewer protocol policy: Redirect HTTP to HTTPS.
   - Allowed HTTP methods: GET, HEAD.
   - Cache policy: CachingOptimized (or a custom one).
   - Compress objects automatically: Enabled.

3. **Default Root Object**

   - Set to `index.html`.

4. **Error Pages for SPA**

   - Custom error responses:
     - HTTP 403 → Response code 200, Response page path `/index.html`.
     - HTTP 404 → Response code 200, Response page path `/index.html`.

   This ensures React SPA routing works correctly.

5. **Domain & SSL (Optional)**

   - Use ACM to create a certificate (in `us-east-1` for CloudFront).
   - Attach the certificate and custom domain (e.g. `chat.yourdomain.in`).
   - Add CNAME record in Route 53 pointing to CloudFront distribution.

6. **CI/CD Invalidation**

   - After deploying frontend assets with `aws s3 sync`, run:

     ```bash
     aws cloudfront create-invalidation \
       --distribution-id <your-distribution-id> \
       --paths "/*"
     ```

   - The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) shows how to automate this.
