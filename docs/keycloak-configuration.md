# Setting Up and Running Local Keycloak Instance
There are many options to configure and run a Keycloak instance. For this guide, we will use Docker to run the Keycloak instance in a docker container. Make sure you have Docker installed before proceeding with this step. You can follow the instructions here for installation. After installing docker. On your terminal run the following command:

```
docker run -p 8080:8080 -e KEYCLOAK_ADMIN="username" -e KEYCLOAK_ADMIN_PASSWORD="password" quay.io/keycloak/keycloak:19.0.1 start-dev
```

By replacing "username" with a Keycloak admin username and by substituting "password" with a Keycloak admin password, one can set credentials for a Keycloak admin to run the Keycloak instance. This will run Keycloak in a Docker container making the server available on port 8080 locally.

Next, go to http://localhost:8080 and you should be able to access the Keycloak server. Here you can view the documentation as well as access the Administration Console.


![Keycloak Server Access UI](/docs/rsrc/keycloak_diagrams/4-server-access-ui.jpg)

Next click on the Administration Console. You will next be redirected to the console as you can see below and asked for the credentials to log in as a Keycloak admin.

![Keycloak Server Login Page](/docs/rsrc/keycloak_diagrams/5-server-login-page.png)


```
Username: username
Password: password
```

Enter the credentials you used to create the Keycloak instance above and click sign in.

## Creating and Configuring Realm
Once you log in, you will see a Master Realm with the server info and features.

For our Tornjak Application, we will be creating a "Tornjak" realm.

To create a new realm follow the steps below:

- Click on the "Master" realm drop-down on the top left side of the console as you can see below
- Click on "Create Realm"

![Keycloak Administration Console](/docs/rsrc/keycloak_diagrams/6-admin-console.png)

- Give the realm a realm name - e.g. "Tornjak"
- Make sure "Enabled" is set to On, as a realm that is not enabled can not be used

![Create Realm Page](/docs/rsrc/keycloak_diagrams/7-create-realm-page.png)

- Click on Create
- Once the realm is created, you will see the realm name on the top left side of the console as you can see below. Here is where you can switch between different realms you created and visualize the Master Realm settings.

![Tornjak Realm Page](/docs/rsrc/keycloak_diagrams/8-realm-page.png)

# Option 1: Realm Import

- The easiest way to create a realm is by using the import feature. To create the Tornjak realm download [this](examples/Tornjak-keycloak-realm-import.json) file. 

- And import to Keycloak by going to Realm settings. 

![Tornjak Realm Settings Page](/docs/rsrc/keycloak_diagrams/9-realm-settings-page.png)

- Click on Partial Import, on the top right corner under Action.

![Tornjak Realm Import Page](/docs/rsrc/keycloak_diagrams/10-realm-import-page.png)

- Here, you can import your realm resources by clicking on browse and importing your resource file, as you can see below.

![Imported Tornjak Realm Json](/docs/rsrc/keycloak_diagrams/11-imported-realm-json.png)

- Edit any resource in the window present as a JSON format and select the resources you want to import by using the checkbox below the edit window. You can choose what to do if a specific resource already exists, such as Fail Import, Skip or Overwrite. 

- Click Import, and you will see the resources imported as "Added" under the Action column including the realm resource info such as the Type, Name, and ID of the resource imported.

![Imported Resources](/docs/rsrc/keycloak_diagrams/12-imported-resources-window.png)

- Click on Close, to close the window and check if all the resources are imported by going to the respective resource section.

- If you imported all your resources using the above step skip to the appropraite section depending on which resources you already imported such as the clients, roles and groups together with the realm.


# Option 2: Manual Realm Resource Configuration

## Creating and Configuring Client

For our Tornjak application, we will be creating one client for the frontend react application to talk to.

### Option 1: Client Import

If you have not imported your client resource with the realm above, the easiest way to create the client is to import your client using a JSON file. To create the Tornjak client download [this](/examples/tornjak-keycloak-client-import.json) file. And import to Keycloak by clicking on Import client. This will send you to an Import client page, where you can browse locally and import.

![Import Client Page](/docs/rsrc/keycloak_diagrams/13-import-client-page.png)

After you open your file in the Keycloak console, you will be able to see all settings imported on your console including the JSON format.

![Tornjak Imported Client Page](/docs/rsrc/keycloak_diagrams/14-imported-client-page.png)

If you follow the above steps to import your client skip to the Assigning Realm Roles and Client Roles section.

### Option 2: Manual Client Resource Configuration

To create a client manually follow the steps below:

- Under Tornjak realm > Manage >
- Click on Clients > Clients list, as shown below

![Create Client Page](/docs/rsrc/keycloak_diagrams/15-create-client-page.png)

- Click on "Create Client"
- Here you can set the "Client type" - which can be "OpenID Connect" or "SAML"

"OpenID Connect" allows Clients to verify the identity of the End-User based on the authentication performed by an Authorization Server.

"SAML" enables web-based authentication and authorization scenarios including cross-domain single sign-on (SSO) and uses security tokens containing assertions to pass information.

- Select OpenID Connect for Tornjak client authentication
- Set "Client ID" as "Tornjak-React-auth" ["Client ID" specifies the ID referenced in URI and tokens.]
- You can optionally set "Name" as "Tornjak" [This is the display name of the client]
- You can set "Description" optionally to set the description of the client
- You can toggle "Always display in console" to ON, to display this client in the account console
- Click on Next

![Manually Create Client - Client General Settings Page](/docs/rsrc/keycloak_diagrams/16-client-general.png)

- You will then see the "Capability config". Here you can set the client authentication and authorization flows
- Keep "Client authentication" OFF - as the OIDC type is not confidential access. When set to OFF it is a public access type that we want for our front-end application, as it is a JavaScript-based browser application
- Keep "Authorization" to OFF - as we want fine-grained authorization support disabled for our client
- Under "Authentication flow" enable "Standard flow" and disable everything else

Standard flow enables standard OpenID Connect redirect-based authentication with an authorization code. In terms of OpenID Connect or OAuth2 specifications, this enables support of 'Authorization Code Flow' for this client.

Authorization flow with public access is chosen to support redirects after login and logout sessions.

With the authorization flow, the user is sent to the Keycloak login page when accessing the application and is allowed to log in with credentials or register for a new account.

- Click Save

![Manually Create Client - Client Capability Config Page](/docs/rsrc/keycloak_diagrams/17-client-capability-config.png)

## Setting Client Access Settings

Stay on the newly created client "Clients" > "Tornjak-React-auth" panel, in the "Settings" tab:

![Client Settings Page](/docs/rsrc/keycloak_diagrams/18-client-settings-page.png)

Under the client Access settings sub-section:
- Set your "Valid redirect URIs" - for example, http://localhost:3000/* - this is an access point to the Tornjak application. If the application is run locally such as on (minikube or kind) this will be localhost, but if the Tornjak runs on the server, it would be an ingress value of the service. [This is the URI you want Keycloak to redirect to after successful login]
- Set your "Valid post logout redirect URIs" - for example, http://localhost:3000/* [This is the URI you want Keycloak to redirect to after successful logout]
- Set "Web origins" as '*' (Wildcard to allow all origins)

This is the allowed CORS origins. You can explicitly assign such as where your application running - for example, http://localhost:3000
To permit all origins of Valid Redirect URIs, explicitly add '*'.

- Click on Save

![Client Access Settings Page](/docs/rsrc/keycloak_diagrams/19-client-access-settings.png)

## Disabling Full scope Enabled Feature
Stay on "Clients" > "Tornjak-React-auth" panel:

- Switch to the Client scopes tab
- And click on the Tornjak-React-auth-dedicated option

![Client Scopes Page](/docs/rsrc/keycloak_diagrams/20-client-scopes-page.png)

- Click on the Scope tab
- Toggle Full scope allowed to OFF

This will disable all restrictions and remove unnecessary information from the access token

![Full Scope Allowed - DISABLED](/docs/rsrc/keycloak_diagrams/21-full-scope-allowed.png)

## Assigning Realm Roles and Client Roles

Roles are special privileges given to a user to access your application. Realm roles are specific to your realm as client roles are specific to the client. But realm roles can be mapped to client roles to associate roles or allow inheritance. 


For our client, we will create two roles "Admin" and "Viewer" roles

- Viewer/ Non-Admin Users - Can not make changes or access exclusive information such as:
    - View Clusters page
    - View the Agents tab
    - View the Entries tab
    - View Tornjak ServerInfo tab
    - View the Tornjak Dashboard tab
    - Download entries to YAML
- Admin - Be granted administrative privileges and access information accordingly such as: 
    - Create and manage Clusters, such as editing and deleting clusters.
    - Create and manage Entries, such as such as editing and deleting workload entries.
    - Manage Agents, such as banning and deleting agents. 

For realm roles create two roles with the name:

```
tornjak-admin-realm-role
tornjak-viewer-realm-role
NOTE: Currently, the naming convention for these roles is a requirment for the backend.
```

For client roles create two roles with the name:

```
admin (map to tornjak-admin-realm-role)
viewer (map to tornjak-viewer-realm-role)
```

To create a Realm role:

- Under your realm (Tornjak) > Realm roles

![Realm Roles Page](/docs/rsrc/keycloak_diagrams/22-realm-roles-page.png)

- Click on Create role
- Give your role a "Role name" (e.g. tornjak-admin-realm-role)
- Give your role "Description" (Optional)
- Click Save

![Realm Create a Role Page](/docs/rsrc/keycloak_diagrams/23-realm-create-role.png)

Repeat the same to create the "tornjak-viewer-realm-role"

![Realm Created Roles Page](/docs/rsrc/keycloak_diagrams/24-realm-created-roles.png)

To create an Admin Client Role:

- Click on Clients > (Tornjak-React-auth) option
- Go to the "Roles" tab:
- Click on "Create role"
- Give your role a "Role name" (e.g. admin)
- Give your role "Description" (Optional)
- Click Save

![Client Create Roles Page](/docs/rsrc/keycloak_diagrams/25-client-roles.png)

Repeat the same to create a "viewer" role.

![Client-Created Roles Page](/docs/rsrc/keycloak_diagrams/26-client-created-roles.png)

To Map Realm and client Roles

- After your client role is created
- Click on Action on the top right of the console

![Client Associate Roles to Realm Roles Page](/docs/rsrc/keycloak_diagrams/27-client-associated-roles.png)

- Under "Action", select "Add associated roles"
- Select the realm role to be mapped
- Map "tornjak-admin-realm-role" to "admin" role etc.
- Select Add to save

![List of Available Realm Roles to Map to Client Roles](/docs/rsrc/keycloak_diagrams/28-list-of-available-realm-roles.png)


## Creating Groups
Groups and Roles have a similar purpose. They both give users special and specific permissions or access to use the application in a certain way. Using Groups you can apply multiple roles to a user or group of users and make the role-assigning process efficient and easy. 

To create Groups:

- Under your realm (Tornjak) > Groups
- Click on Create group
- Give your group a "Name" (Admin-group)
- Click Save
- Repeat to create "Viewer-group"

![Create Group Page](/docs/rsrc/keycloak_diagrams/29-create-group.png)


- Select the group name from the list
- Under the "Role mapping" tab, map the role/s associated with the group using "Assign role"
- E.g. assign roles to the "Admin-group" account, select "tornjak-admin-realm-role"
- Press Assign

![Role Mapping to Group Page](/docs/rsrc/keycloak_diagrams/30-role-mapping.png)


![Created Groups Page](/docs/rsrc/keycloak_diagrams/31-created-groups.png)


Now one can assign these groups to users accordingly.


## Adjusting Optional Settings Under Realm Settings

There are some useful realm settings to adjust. For the selected Realm Tornjak, Select "Realm settings" under the "Configure" sub-section on the left side of the panel:

- Go to the Login tab
- Toggle ON User registration- which allows users to register through your application
- Toggle ON Forgot password- which allows users to reset and retrieve forgotten passwords
- Toggle ON Remember me- which helps users remember forgotten passwords
- Toggle ON Edit username - which allows the Keycloak admin to edit the username already set otherwise it is read-only

![Realm Settings Page](/docs/rsrc/keycloak_diagrams/32-realm-settings.png)


To set Default Groups and default roles to users when they register:

- Go to the User registrationtab under "Realm settings"
- Click on Default groups
- Add your default group [In our case add "Viewer-group" group as default] this will make viewer group default for all users

![User Registration Realm Settings Page](/docs/rsrc/keycloak_diagrams/33-user-registration.png)


# Creating And Registering Users

Users can register through the application if User registration is enabled under "Realm settings" > "Login". Another way users can be registered is by the Keycloak admin

To register a user:

- Select Tornjak realm
- Under "Users"
- Click on "Create new users"
- Give your user a "Username"
- Type in the user's "Email"
- Type in the user's "First name"
- Type in the user's "Last name"
- Make sure the user is enabled, by toggling the Enabled flag to ON (As a disabled user can not log in)

![Create User Page](/docs/rsrc/keycloak_diagrams/34-create-user.png)



- Assign a group, by clicking on Join Groups and selecting from available groups

![Select Group to Assign to User Page](/docs/rsrc/keycloak_diagrams/35-select-group.png)

- Click on Create

![Created Users Page](/docs/rsrc/keycloak_diagrams/36-created-users.png)


Then assign the password:

- Select the Credentials tab
- Click Set password
- Enter the password, adjust Temporary as needed
- Select Save to create

![User Credentials Page](/docs/rsrc/keycloak_diagrams/37-user-credentials.png)


![Assign Password to User Page](/docs/rsrc/keycloak_diagrams/38-assign-password.png)

Create two users and assign them to the following groups:

- adminuser - assigned to the "admin" group
- vieweruser - assigned to "viewer" group (if "viewer group is set to default under "Realm settings > "User registration" skip this step)


Now your application is ready to be secured and your identity is managed with Keycloak. Go to your application and you should be redirected to the Keycloak login page. You should see something like this.
For example, we can run the frontend locally exposing the application to port 3000 like this.

```
cd tornjak-frontend
REACT_APP_API_SERVER_URI=http://localhost:10000/ REACT_APP_AUTH_SERVER_URI=http://localhost:8080/ npm start
```

This will start your application on a separate browser on port 3000. And you should be able to see the application redirected to the Keycloak server (login page).

Sign in with the username and password you created as a Keycloak admin, and you should be able to access your application either as a viewer or tornjak admin depending on the user you signed in with.