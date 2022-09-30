# **Proposed Oath2-inspired Protocol**
Currently, we are implementing [Standard Authorization Code Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow):
![standard](./rsrc/standard-auth-code-flow.png)
We will eventually be implementing the [Authorization Code Flow with PKCE](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce) to secure the backend with a public frontend application. This is necessary as the public frontend cannot store client secrets securely: 
![pkce](./rsrc/pkce-auth-code-flow.png)