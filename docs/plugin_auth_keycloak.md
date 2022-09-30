**Proposed Oath2-inspired Protocol**
Currently, we are implementing [Standard Authorization Code Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow):
![standard](https://user-images.githubusercontent.com/30640956/188904695-54bc40c8-422b-4759-954b-7d107088a4a6.png)
​
We will eventually be implementing the [Authorization Code Flow with PKCE](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce) to secure the backend with a public frontend application. This is necessary as the public frontend cannot store client secrets securely: 
![pkce](https://user-images.githubusercontent.com/30640956/188899260-fab8013f-b545-437c-853f-d632f2f553b6.png)