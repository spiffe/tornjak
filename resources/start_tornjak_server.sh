#!/bin/bash

cd docs/quickstart
cp server-statefulset-examples/backend-sidecar-server-statefulset.yaml server-statefulset.yaml

kubectl apply -f spire-namespace.yaml \
    -f server-account.yaml \
    -f spire-bundle-configmap.yaml \
    -f tornjak-configmap.yaml \
    -f server-cluster-role.yaml \
    -f server-configmap.yaml \
    -f server-statefulset.yaml \
    -f server-service.yaml

sleep 5s

kubectl get statefulset --namespace spire

kubectl apply \
    -f agent-account.yaml \
    -f agent-cluster-role.yaml \
    -f agent-configmap.yaml \
    -f agent-daemonset.yaml

sleep 5s

kubectl get daemonset --namespace spire

kubectl exec -n spire -c spire-server spire-server-0 -- \
    /opt/spire/bin/spire-server entry create \
    -spiffeID spiffe://example.org/ns/spire/sa/spire-agent \
    -selector k8s_psat:cluster:demo-cluster \
    -selector k8s_psat:agent_ns:spire \
    -selector k8s_psat:agent_sa:spire-agent \
    -node

kubectl exec -n spire -c spire-server spire-server-0 -- \
    /opt/spire/bin/spire-server entry create \
    -spiffeID spiffe://example.org/ns/default/sa/default \
    -parentID spiffe://example.org/ns/spire/sa/spire-agent \
    -selector k8s:ns:default \
    -selector k8s:sa:default

sleep 5s

kubectl apply -f client-deployment.yaml

kubectl exec -it $(kubectl get pods -o=jsonpath='{.items[0].metadata.name}' \
   -l app=client)  -- /opt/spire/bin/spire-agent api fetch -socketPath /run/spire/sockets/agent.sock

sleep 5s

kubectl -n spire describe pod spire-server-0 | grep "Image:"

kubectl -n spire port-forward spire-server-0 10000:10000