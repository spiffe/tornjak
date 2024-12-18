## JSON Format for New Federation

```json
{
  "federation_relationships": [
    {
      "trust_domain": "server.org",
      "bundle_endpoint_url": "https://host.docker.internal:8440",
      "https_spiffe": {
        "endpoint_spiffe_id": "spiffe://server.org/spire/server"
      },
      "trust_domain_bundle": {
        "trust_domain": "server.org",
        "x509_authorities": [
          {
            "asn1": "MIID3TCCAsWg... (truncated)"
          },
          {
            "asn1": "MIID3TCCAsWg... (truncated)"
          },
          {
            "asn1": "MIID3TCCAsWg... (truncated)"
          }
        ],
        "jwt_authorities": [
          {
            "public_key": "MIIBIjANBgkqh... (truncated)",
            "key_id": "hZinOYBqM3jGnq...",
            "expires_at": 1734022841
          },
          {
            "public_key": "MIIBIjANBgkqh... (truncated)",
            "key_id": "3o0DnZN5clyzR...",
            "expires_at": 1734113731
          },
          {
            "public_key": "MIIBIjANBgkqh... (truncated)",
            "key_id": "ngoXDgR1SWATM...",
            "expires_at": 1734191531
          }
        ],
        "sequence_number": 18
      }
    }
  ]
}

```
