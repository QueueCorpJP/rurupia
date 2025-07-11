# Setting up GitHub Secrets for CI/CD

To enable automatic deployment to AWS, you need to configure the following secrets in your GitHub repository:

## Required Secrets

1. **AWS Credentials**
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

   These credentials should have permissions for S3 and CloudFront operations.

2. **Environment Variables**
   - `VITE_SUPABASE_URL`: `https://vvwkuqnotnilsbcswfqu.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2d2t1cW5vdG5pbHNiY3N3ZnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMjY4NjMsImV4cCI6MjA1NzcwMjg2M30.1iiE4PAwM1pf-xxKENPHjpQS48V-OPKVnJCBncfNQZM`
   - `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2d2t1cW5vdG5pbHNiY3N3ZnF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjEyNjg2MywiZXhwIjoyMDU3NzAyODYzfQ.8nBw2_MVOjojRhPqWHLFKVK6zfuQfQJy031kcKRK3bQ`
   - `VITE_TINYMCE_API_KEY`: `nn4binis9k4dzuafzo2wvdl6jobzmh8e4g6hfjvs62zroxvd`

## How to Add Secrets to GitHub Repository

1. Go to your GitHub repository (`https://github.com/QueueCorpJP/rurupia`)
2. Click on "Settings" tab
3. In the left sidebar, click on "Secrets and variables" → "Actions"
4. Click on "New repository secret" button
5. Add each secret with its corresponding name and value
6. Click "Add secret" to save

## Creating AWS IAM User with Required Permissions

For security best practices, create a dedicated IAM user for GitHub Actions:

1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach the following inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::therapist-connectivity-frontend-93b9faa0"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::therapist-connectivity-frontend-93b9faa0/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "arn:aws:cloudfront::536697269239:distribution/E2P3Q41GY0N3CJ"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:GetDistributionConfig",
        "cloudfront:UpdateDistribution"
      ],
      "Resource": "arn:aws:cloudfront::536697269239:distribution/E2P3Q41GY0N3CJ"
    },
    {
      "Effect": "Allow",
      "Action": [
        "acm:DescribeCertificate"
      ],
      "Resource": "arn:aws:acm:us-east-1:536697269239:certificate/a7a75270-922d-4506-921e-d37143a91ff1"
    },
    {
      "Effect": "Allow",
      "Action": [
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:GetFunction"
      ],
      "Resource": "arn:aws:lambda:ap-northeast-1:536697269239:function:rurupia-api"
    }
  ]
}
```

4. Get the access key and secret key for this user
5. Add these credentials to the GitHub repository secrets

## Verifying Deployment

After setting up the secrets and pushing to the main branch:

1. Go to the "Actions" tab in your GitHub repository
2. You should see the workflow running
3. Once completed successfully, verify the deployment at:
   - CloudFront URL: `https://dqv3ckdbgwb1i.cloudfront.net`
   - Custom domain (after DNS setup): `https://rupipia.jp` 