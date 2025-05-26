# DNS Configuration for rurupia.jp

This guide explains how to set up DNS records for the Rurupia website.

## Required DNS Records

### 1. SSL Certificate Validation

First, you need to validate ownership of your domain for the SSL certificate:

```
Type: CNAME
Name: _3f57c5b25a3bf8bdee4378634d7025df.rurupia.jp
Value: _4883f03dca08670b110ed34d855bf404.xlfgrmvvlj.acm-validations.aws
TTL: 300 (or Auto)
```

This record is needed for AWS Certificate Manager to validate your domain ownership. Once validated (usually takes 30 minutes to a few hours), the certificate will be issued.

### 2. Domain to CloudFront

After the certificate is validated, add the following record to point your domain to CloudFront:

```
Type: CNAME
Name: rurupia.jp (or @ if your DNS provider supports it)
Value: dqv3ckdbgwb1i.cloudfront.net
TTL: 300 (or Auto)
```

## If Using Route 53

If you're using Amazon Route 53 for DNS, you can use an Alias record instead of CNAME for the root domain:

```
Type: A
Name: rurupia.jp (or @)
Value: Alias to CloudFront distribution (dqv3ckdbgwb1i.cloudfront.net)
```

## Verifying DNS Configuration

You can verify your DNS configuration with the following commands:

```bash
# Check certificate validation record
dig _3f57c5b25a3bf8bdee4378634d7025df.rurupia.jp CNAME

# Check domain to CloudFront record
dig rurupia.jp
```

## After DNS Setup

Once DNS is properly configured and the certificate is validated:

1. Go to the GitHub repository
2. Navigate to the "Actions" tab
3. Select the "Update CloudFront Certificate" workflow
4. Click "Run workflow"
5. Select "YES" for the "Confirm certificate is validated" prompt
6. Click "Run workflow" to update CloudFront with your custom domain

After a few minutes, your site should be accessible at https://rurupia.jp 