```yaml
{
  "entries": [
    {
    "spiffe_id": { //required - must be a valid spiffe_id
      "trust_domain": "example.org",
      "path": "/sample_path1"
    },
    "parent_id": { //required - must be a valid parent_id
      "trust_domain": "example.org",
      "path": "/spire/agent/k8s_sat/demo-cluster/21b781e7-4c92-4fe9-8bb2-108756fa9de2"
    },
    "selectors": [ //required - must be a valid type:value format
      {
        "type": "k8s",
        "value": "container-image:ere"
      },
      {
        "type": "k8s",
        "value": "container-name:eww"
      },
      {
        "type": "k8s",
        "value": "node-name:qq"
      }
    ],
    "admin": true, //optional
    "ttl": 40, //optional
    "expires_at": 34, //optional
    "downstream": true, //optional
    "federates_with": [ //optional
      "example.org"
    ],
    "dns_names": [  //optional
      "example.org",
      "abc.com"
    ]
    }
  ]
}
```