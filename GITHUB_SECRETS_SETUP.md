# Setting up GitHub Secrets for CI/CD

To enable automatic deployment to AWS, you need to configure OpenID Connect (OIDC) authentication for GitHub Actions:

## Required Secrets

1. **AWS OIDC Role**
   - `AWS_ROLE_TO_ASSUME`: The ARN of the AWS IAM role for GitHub Actions to assume (e.g., `arn:aws:iam::536697269239:role/github-actions-rurupia`)

2. **Environment Variables**
   - `VITE_SUPABASE_URL`: `https://vvwkuqnotnilsbcswfqu.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2d2t1cW5vdG5pbHNiY3N3ZnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMjY4NjMsImV4cCI6MjA1NzcwMjg2M30.1iiE4PAwM1pf-xxKENPHjpQS48V-OPKVnJCBncfNQZM`
   - `VITE_TINYMCE_API_KEY`: `nn4binis9k4dzuafzo2wvdl6jobzmh8e4g6hfjvs62zroxvd`

## How to Add Secrets to GitHub Repository

1. Go to your GitHub repository (`https://github.com/QueueCorpJP/rurupia`)
2. Click on "Settings" tab
3. In the left sidebar, click on "Secrets and variables" → "Actions"
4. Click on "New repository secret" button
5. Add each secret with its corresponding name and value
6. Click "Add secret" to save

## Setting up AWS IAM Role for GitHub Actions OIDC

For enhanced security, create a dedicated IAM role for GitHub Actions using OIDC:

1. Go to AWS IAM Console
2. Create a new IAM role with the following trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::536697269239:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:QueueCorpJP/rurupia:*"
        }
      }
    }
  ]
}
```

3. Attach the following inline policy to the role:

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
    }
  ]
}
```

4. Add the role ARN as the `AWS_ROLE_TO_ASSUME` secret in GitHub

## Setting up OIDC Provider in AWS

If you haven't already configured GitHub as an OIDC provider in AWS:

1. Go to AWS IAM Console → Identity Providers
2. Click "Add Provider"
3. Select "OpenID Connect"
4. For Provider URL, enter: `https://token.actions.githubusercontent.com`
5. For Audience, enter: `sts.amazonaws.com`
6. Click "Add provider"

## Verifying Deployment

After setting up the secrets and pushing to the main branch:

1. Go to the "Actions" tab in your GitHub repository
2. You should see the workflow running
3. Once completed successfully, verify the deployment at:
   - CloudFront URL: `https://dqv3ckdbgwb1i.cloudfront.net`
   - Custom domain (after DNS setup): `https://rupipia.jp` 