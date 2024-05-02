# Integrate Upstream Identity Providers to Keycloak

Keycloak has the ability to integrate with upstream identity providers. This way users/ admins can use their existing IAMs and /or users database pool while securing Tornjak. 

![Upstream Architecture Diagram](diagrams/upstream-architecture-diagram.png)

> [!NOTE]
> As long as your upstream IAM uses `OAuth v2.0`, `OpenID Connect v1.0` or `SAML v2.0` you can integarte your IAM to keycloak. 

This documentation is a guide on how to connect some hand picked IAMs. For more IAM connection options, go to your keycloak console and head to the `Identity providers` section. There you can see multple options including: 

- Another Keycloak OpenID service
- SAML
- Google
- Microsoft Azure - Active Directories (AD)
- Openshift v3 and v4
- Github
- etc...

![Identity Providers Homepage](diagrams/identity-providers-homepage.png)

