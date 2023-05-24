# Debugging, Hints and Tips for Solving Common Problems with Tornjak
Here is a collection of various tips and hints for debugging
deployment and runtime of Tornjak

The hints collection is grouped in the following sections:
* [Tornjak Deployment](#tornjak-deployment)
* [Tornjak Configuration](#tornjak-configuration)
* [User Management](#user-management)

<!-- the proposed format for each suggestion is:
---

**Problem:**

**Description:**

**Solution:**

---
-->


## Tornjak Deployment

---

**Problem:**
SPIRE with Tornjak pod does not start. 
Status is `CrashLoopBackOff`.
The _spire-server_ container log shows:

```
time="2022-11-11T22:47:23Z" level=info msg="Opening SQL database" db_type=sqlite3 subsystem_name=sql
time="2022-11-11T22:47:23Z" level=info msg="Running migrations..." schema=17 subsystem_name=sql version_info=1.1.5
time="2022-11-11T22:47:23Z" level=info msg="Migrating version" schema=17 subsystem_name=sql version_info=17
time="2022-11-11T22:47:23Z" level=error msg="Fatal run error" error="datastore-sql: migrating from schema version 17 requires a previous SPIRE release; please follow the upgrade strategy at doc/upgrading.md"
time="2022-11-11T22:47:23Z" level=error msg="Server crashed" error="datastore-sql: migrating from schema version 17 requires a previous SPIRE release; please follow the upgrade strategy at doc/upgrading.md"
```

**Description:**
The existing DB schema used by SPIRE is not compatible with the current SPIRE version.
The database is persisted on the host, even between SPIRE restarts.

**Solution:**
Simply stop the SPIRE server (remove it)
then delete the current DB on the host,
and restart SPIRE
so DB can be recreated with a correct version.

When _pvc_ is used to persist SPIRE data, delete it:

```console
kubectl -n spire-server get pvc
kubectl -n spire-server delete pvc spire-data-spire-server-0
```

The _pvc_ will get recreated on the next deployment

Otherwise,
you can use this simple [DB clean tool](https://github.com/IBM/trusted-service-identity/blob/main/utils/spire.db.clean.yaml) to attach to the SPIRE server
and remove the files manually:

Use the handy utility:
[https://github.com/IBM/trusted-service-identity/blob/main/utils/spire.db.clean.yaml](https://github.com/IBM/trusted-service-identity/blob/main/utils/spire.db.clean.yaml):

```console
kubectl -n spire-server create -f https://github.com/IBM/trusted-service-identity/blob/main/utils/spire.db.clean.yaml
kubectl -n spire-server exec -it spire-server-0 -- sh

# once inside: 
cd /run/spire/data/
rm *
exit

# delete the tool:
kubectl -n spire-server delete -f https://github.com/IBM/trusted-service-identity/blob/main/utils/spire.db.clean.yaml

# restart the SPIRE+Tornjak Deployment
```

---

**Problem:** 
Pod with Tornjak front-end fails to start.
Kubectl "Events" page shows the following:
```console
Startup probe failed: Get "http://172.17.0.3:3000/": context deadline exceeded (Client.Timeout exceeded while awaiting headers)
```
Above message is accessible by (assuming `spire` namespace, `[POD]` is a placeholder for the front-end Pod name):
```console
kubectl -n spire-server describe po [POD]
```

**Description:**

_(Often encountered using Minikube)_
Frontend does not compile in time.
Cluster environment may be too weak to satisfy the startup probe within the allotted time.

**Solution:**

Increase the `failureThreshold` in the Tornjak deployment file (look for _deployment.yaml_) under `startupProbe`:
```yaml 
failureThreshold: 15
```

---

**Problem:**

Agent log file shows an error:
```console
time="2021-10-01T15:26:14Z" level=info msg="SVID is not found. Starting node attestation" subsystem_name=attestor trust_domain_id="spiffe://openshift.com"
time="2021-10-01T15:26:44Z" level=error msg="Agent crashed" error="create attestation client: failed to dial dns:///spire-server-tornjak.9d995c4a8c7c5f281ce13d5467ff6a94-0000.us-east.containers.appdomain.cloud:443: context deadline exceeded: connection error: desc = \"transport: authentication handshake failed: x509svid: could not verify leaf certificate: x509: certificate signed by unknown authority (possibly because of \\\"crypto/rsa: verification error\\\" while trying to verify candidate authority certificate \\\"SPIFFE\\\")\""
```

**Description:**

Incorrect keys or certificates required for attestation.
Either `spire-bundle` needs to be refreshed or the `kubeconfigs`
secret updated on the SPIRE server.

**Solution:**
To update the "spire-bundle",
get the `spire-bundle` configmap from the SPIRE server, update the namespace to match the agent cluster, then deploy it agent namespace.

On the SPIRE server (assuming `spire-server` namespace):
```console
kubectl -n spire-server get configmap spire-bundle -oyaml | kubectl patch --type json --patch '[{"op": "replace", "path": "/metadata/namespace", "value":"spire"}]' -f - --dry-run=client -oyaml > spire-bundle.yaml
```

On the SPIRE agent cluster (assuming `spire` namespace):
```console
kubectl -n spire create -f spire-bundle.yaml
```

There is no need to restart the agents.
Once the updated `spire-bundle` is in place
the agents will pick up the changes on the next restart.

---



## Tornjak Configuration


## User Management

