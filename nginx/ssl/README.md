# SSL Certificate Setup

This directory should contain your SSL certificate and private key files.

## Required Files

Place the following files in this directory:

- `cert.pem` - SSL certificate file (PEM format)
- `key.pem` - SSL private key file (PEM format)

## File Format

Both files should be in PEM format:

```
-----BEGIN CERTIFICATE-----
[Certificate content]
-----END CERTIFICATE-----
```

```
-----BEGIN PRIVATE KEY-----
[Private key content]
-----END PRIVATE KEY-----
```

## Generating Self-Signed Certificates (Development)

For development/testing purposes, you can generate self-signed certificates:

```bash
# Generate private key
openssl genrsa -out ssl/key.pem 2048

# Generate certificate
openssl req -new -x509 -key ssl/key.pem -out ssl/cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## Production Certificates

For production, use certificates from a trusted Certificate Authority (CA) such as:
- Let's Encrypt (free)
- Commercial CA providers
- Your organization's internal CA

## Security Notes

- Never commit private keys to version control
- Use strong key sizes (2048+ bits)
- Regularly renew certificates
- Keep private keys secure and restrict access
