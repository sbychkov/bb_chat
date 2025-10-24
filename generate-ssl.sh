#!/bin/bash

# Generate self-signed SSL certificates for development
# This script creates certificates for localhost

echo "Generating self-signed SSL certificates for Band of Blades Chat..."

# Create ssl directory if it doesn't exist
mkdir -p ssl

# Generate private key
echo "Generating private key..."
openssl genrsa -out ssl/key.pem 2048

# Generate certificate
echo "Generating certificate..."
openssl req -new -x509 -key ssl/key.pem -out ssl/cert.pem -days 365 \
    -subj "/C=US/ST=Development/L=Local/O=Band of Blades/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:0.0.0.0"

echo "SSL certificates generated successfully!"
echo ""
echo "Files created:"
echo "  - ssl/key.pem (private key)"
echo "  - ssl/cert.pem (certificate)"
echo ""
echo "You can now run: docker-compose up --build"
echo "Access the application at: https://localhost:8443"
echo ""
echo "Note: Browsers will show a security warning for self-signed certificates."
echo "Click 'Advanced' and 'Proceed to localhost' to continue."
