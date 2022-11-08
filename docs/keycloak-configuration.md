# Setting Up and Running Keycloak Instance
There are many options to configure and run a Keycloak instance. For this guide, we will use Docker to run the Keycloak instance in a docker container. Make sure you have Docker installed before proceeding with this step. You can follow the instructions here for installation. After installing docker. On your terminal run the following command:

```
docker run -p 8080:8080 -e KEYCLOAK_ADMIN="username" -e KEYCLOAK_ADMIN_PASSWORD="password" quay.io/keycloak/keycloak:19.0.1 start-dev
```

By replacing "username" with a Keycloak admin username and by substituting "password" with a Keycloak admin password, one can set credentials for a Keycloak admin to run the Keycloak instance. This will run Keycloak in a Docker container making the server available on port 8080 locally.
Next, go to http://localhost:8080 and you should be able to access the Keycloak server. Here you can view the documentation as well as access the Administration Console.

Next click on the Administration Console. You will next be redirected to the console as you can see below and asked for the credentials to log in as a Keycloak admin.

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
- Give the realm a realm name - For example - "tornjak"
- Make sure "Enabled" is set to On, as a realm that is not enabled can not be used
- [Option 1]: The easiest way to create a realm is by using the import feature. To create the Tornjak realm download this (link for JSON file) file. And import to Keycloak by clicking on browse and import your resource file.
- If you imported all your resources using the above step skip to the appropraite section depending on which resources you already imported such as the clients, roles and groups together with the realm.
- Click on "Create"

## Creating and Configuring Client

For our Tornjak application, we will be creating one client for the frontend react application to talk to.

If you have not imported your client resource with the realm above, the easiest way to create the client is to import your client using a JSON file. To create the Tornjak client download this (link for JSON file) file. And import to Keycloak by clicking on Import client. This will send you to an Import client page, where you can browse locally and import.

After you open your file in the Keycloak console, you will be able to see all settings imported on your console including the JSON format.

If you follow the above steps to import your client skip to the Assigning Realm Roles and Client Roles section.

To create a client manually follow the steps below:

- Under Tornjak realm > Manage >
- Click on Clients > Clients list, as shown below
- Click on "Create Client"
- Here you can set the "Client type" - which can be "OpenID Connect" or "SAML"
- Select OpenID Connect for Tornjak client authentication
- Set "Client ID" as "Tornjak-React-auth" ["Client ID" specifies the ID referenced in URI and tokens.]
- You can optionally set "Name" as "Tornjak" [This is the display name of the client]
- You can set "Description" optionally to set the description of the client
- You can toggle "Always display in console" to ON, to display this client in the account console
- Click on Next

- You will then see the "Capability config". Here you can set the client authentication and authorization flows
- Keep "Client authentication" OFF - as the OIDC type is not confidential access. When set to OFF it is a public access type that we want for our front-end application, as it is a JavaScript-based browser application
- Keep "Authorization" to OFF - as we want fine-grained authorization support disabled for our client
- Under "Authentication flow" enable "Standard flow" and disable everything else
- Click Save

## Setting Client Access Settings

Stay on the newly created client "Clients" > "Tornjak-React-auth" panel, in the "Settings" tab:

Under the client Access settings sub-section:
Set your "Valid redirect URIs" - for example, http://localhost:3000/* - this is an access point to the Tornjak application. If the application is run locally such as on (minikube or kind) this will be localhost, but if the Tornjak runs on the server, it would be an ingress value of the service. [This is the URI you want Keycloak to redirect to after successful login]
Set your "Valid post logout redirect URIs" - for example, http://localhost:3000/* [This is the URI you want Keycloak to redirect to after successful logout]
Set "Web origins" as '*' (Wildcard to allow all origins)

This is the allowed CORS origins. You can explicitly assign such as where your application running - for example, http://localhost:3000
To permit all origins of Valid Redirect URIs, explicitly add '*'.
Click on Save

Disabling Full scope Enabled Feature
Stay on "Clients" > "Tornjak-React-auth" panel:
Switch to the Client scopes tab
And click on the Tornjak-React-auth-dedicated option

Figure 20: Client Scopes PageClick on the Scope tab
Toggle Full scope allowed to OFF

This will disable all restrictions and remove unnecessary information from the access token
Figure 21: Full Scope Allowed - DISABLEDAssigning Realm Roles and Client Roles
Roles are special privileges given to a user to access your application. Realm roles are specific to your realm as client roles are specific to the client. But realm roles can be mapped to client roles to associate roles or allow inheritance. To learn more about Roles check this link.
For our client, we will create two roles "Admin" and "Viewer" roles
Viewer/ Non-Admin Users - Can not make changes or access exclusive information
Admin - Be granted administrative privileges and access information accordingly

For realm roles create two roles with the name:
tornjak-admin-realm-role
tornjak-viewer-realm-role
NOTE: Currently, the naming convention for these roles is a requirment for the backend.
For client roles create two roles with the name:
admin (map to tornjak-admin-realm-role)
viewer (map to tornjak-viewer-realm-role)
To create a Realm role:
Under your realm (Tornjak) > Realm roles

Figure 22: Realm Roles PageClick on Create role
Give your role a "Role name" (e.g. tornjak-admin-realm-role)
Give your role "Description" (Optional)
Click Save

Figure 23: Realm Create a Role PageRepeat the same to create the "tornjak-viewer-realm-role"
Figure 24: Realm Created Roles PageTo create an Admin Client Role:
Click on Clients > (Tornjak-React-auth) option
Go to the "Roles" tab:
Click on "Create role"
Give your role a "Role name" (e.g. admin)
Give your role "Description" (Optional)
Click Save

Figure 25: Client Create Roles PageRepeat the same to create a "viewer" role.
Figure 26: Client-Created Roles PageTo Map Realm and client Roles
After your client role is created
Click on Action on the top right of the console

Figure 27: Client Associate Roles to Realm Roles PageUnder "Action", select "Add associated roles"
Select the realm role to be mapped
Map "tornjak-admin-realm-role" to "admin" role etc.
Select Add to save

Figure 28: List of Available Realm Roles to Map to Client RolesCreating Groups
Groups and Roles have a similar purpose. They both give users special and specific permissions or access to use the application in a certain way. Using Groups you can apply multiple roles to a user or group of users and make the role-assigning process efficient and easy. To learn more about Groups check this link.
To create Groups:
Under your realm (Tornjak) > Groups
Click on Create group
Give your group a "Name" (Admin-group)
Click Save
Repeat to create "Viewer-group"

Figure 29: Create Group PageSelect the group name from the list
Under the "Role mapping" tab, map the role/s associated with the group using "Assign role"
E.g. assign roles to the "Admin-group" account, select "tornjak-admin-realm-role"
Press Assign

Figure 30: Role Mapping to Group PageFigure 31 Created Groups PageNow one can assign these groups to users accordingly.
Adjusting Optional Settings Under Realm Settings
There are some useful realm settings to adjust. For the selected Realm Tornjak, Select "Realm settings" under the "Configure" sub-section on the left side of the panel:
Go to the Login tab
Toggle ON User registration- which allows users to register through your application
Toggle ON Forgot password- which allows users to reset and retrieve forgotten passwords
Toggle ON Remember me- which helps users remember forgotten passwords
Toggle ON Edit username - which allows the Keycloak admin to edit the username already set otherwise it is read-only

Figure 32: Realm Settings PageTo set Default Groups and default roles to users when they register:
Go to the User registrationtab under "Realm settings"
Click on Default groups
Add your default group [In our case add "Viewer-group" group as default] this will make viewer group default for all users

Figure 33: User Registration Realm Settings PageCreating And Registering Users
Users can register through the application if User registration is enabled under "Realm settings" > "Login". Another way users can be registered is by the Keycloak admin
To register a user:
Select Tornjak realm
Under "Users"
Click on "Create new users"
Give your user a "Username"
Type in the user's "Email"
Type in the user's "First name"
Type in the user's "Last name"
Make sure the user is enabled, by toggling the Enabled flag to ON (As a disabled user can not log in)

Figure 34: Create User PageAssign a group, by clicking on Join Groups and selecting from available groups

Figure 35: Select Group to Assign to User PageClick onCreate

Figure 36: Created Users  PageThen assign the password:
Select theCredentials tab
ClickSet password
Enter the password, adjust Temporary as needed
Select Save to create

Figure 37: User Credentials PageFigure 37: Assign Password to User PageCreate two users and assign them to the following groups:
adminuser - assigned to the "admin" group
vieweruser - assigned to "viewer" group (if "viewer group is set to default under "Realm settings > "User registration" skip this step)