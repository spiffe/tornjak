# Deployment of Keycloak to Support Tornjak User Management

## Deployment

Deploy the Keycloak instance to support Identity and Access Management (IAM) for Tornjak.

```console
kubectl create -f config.yaml
kubectl create -f statefulset.yaml
kubectl create -f service.yaml
```

Once the service is deployed, provide a local access to Keycloak service port:

```console
kubectl port-forward service/keycloak-service 8080:8080
```

Then access Keycloak via browser on [http://localhost:8080](http://localhost:8080)
and open the *Administration Console*

The credentials in this example have username and password both `admin`. You may configure this in `statefulset.yaml`

The Tornjak Realm has two users: `admin` and `viewer`. 
