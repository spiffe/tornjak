package db

import (
	"fmt"
	"github.com/pkg/errors"
	"os"
	"testing"
	"time"

	"github.com/cenkalti/backoff/v4"

	"github.com/spiffe/tornjak/pkg/agent/types"
)

func cleanup() {
	os.Remove("./local-agentstest-db")
}

// TestSelectorDB checks correctness of functions dealing with Agent Selector table
// Uses functions NewLocalSqliteDB, db.CreateAgentsEntry, db.GetAgentSelectors, db.GetAgentPluginInfo
func TestSelectorDB(t *testing.T) {
	defer cleanup()
	expBackoff := backoff.NewExponentialBackOff()
	expBackoff.MaxElapsedTime = time.Second
	db, err := NewLocalSqliteDB("sqlite3", "./local-agentstest-db", expBackoff)
	if err != nil {
		t.Fatal(err)
	}

	// CHECK initial emptiness [GetAgentSelectors]
	sList, err := db.GetAgentSelectors()
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Agents) > 0 {
		t.Fatal("Agents list should initially be empty")
	}

	spiffeid := "spiffe://example.org/spire/agent/"
	spiffeidA := "spiffeA"
	sinfo := types.AgentInfo{
		Spiffeid: spiffeid,
		Plugin:   "Docker",
	}
	sinfoNew := types.AgentInfo{
		Spiffeid: spiffeid,
		Plugin:   "K8s",
	}
	sinfoANull := types.AgentInfo{
		Spiffeid: spiffeidA,
	}
	sinfoANotNull := types.AgentInfo{
		Spiffeid: spiffeidA,
		Plugin:   "K8s",
	}

	// ATTEMPT registration of agent plugin [CreateAgentEntry]]
	err = db.CreateAgentEntry(sinfo)
	if err != nil {
		t.Fatal(err)
	}

	// CHECK new agent plugin [GetAgentSelectors]
	sList, err = db.GetAgentSelectors()
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Agents) != 1 || !agentInfoCmp(sList.Agents[0], sinfo) {
		t.Fatal("Agents list should initially be empty")
	}

	// CHECK get agent plugin of existing agent [GetAgentPluginInfo]
	info, err := db.GetAgentPluginInfo(spiffeid)
	if err != nil {
		t.Fatal(err)
	}
	if !agentInfoCmp(info, sinfo) {
		t.Fatal("Wrong info obtained from GetAgentPluginInfo")
	}

	// CHECK get agent plugin of nonexisting agent [GetAgentPluginInfo]
	_, err = db.GetAgentPluginInfo("super secret agent")
	if err == nil {
		t.Fatal("Failed to report non-existing agent in GetAgentPluginInfo")
	}

	// ATTEMPT editing registration of agent plugin [CreateAgentEntry]
	err = db.CreateAgentEntry(sinfoNew)
	if err != nil {
		t.Fatal(err)
	}

	// CHECK new agent plugin [GetAgentSelectors]
	sList, err = db.GetAgentSelectors()
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Agents) != 1 {
		t.Fatal("There should only be one agent")
	}
	if !agentInfoCmp(sList.Agents[0], sinfoNew) {
		t.Fatalf(fmt.Sprintf("Wrong agent info stored after edit: wanted %v, got %v", sinfoNew, sList.Agents[0]))
	}

	// ATTEMPT adding new agent with no plugin [CreateAgentEntry]
	err = db.CreateAgentEntry(sinfoANull)
	if err != nil {
		t.Fatalf(fmt.Sprintf("Cannot add agent with no plugin, got error: %v", err))
	}

	// CHECK all agents with plugins; should only have 1 [GetAgentSelectors]
	sList, err = db.GetAgentSelectors()
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Agents) != 1 {
		t.Fatalf(fmt.Sprintf("There should only be one agent %v", sList.Agents))
	}
	if !agentInfoCmp(sList.Agents[0], sinfoNew) {
		t.Fatal("Wrong agent info stored after edit")
	}

	// ATTEMPT updating agent from NULL to new plugin [CreateAgentEntry]
	err = db.CreateAgentEntry(sinfoANotNull)
	if err != nil {
		t.Fatal("Cannot add agent with no plugin")
	}

	// CHECK all agents with plugins; should have 2 [GetAgentSelectors]
	sList, err = db.GetAgentSelectors()
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Agents) != 2 {
		t.Fatal("There should only be one agent")
	}

	// ATTEMPT updating agent from NOT NULL to NULL plugin [CreateAgentEntry]
	err = db.CreateAgentEntry(sinfoANull)
	if err != nil {
		t.Fatal("Cannot add agent with no plugin")
	}

	// CHECK all agents with plugins; should only have 1 [GetAgentSelectors]
	sList, err = db.GetAgentSelectors()
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Agents) != 1 {
		t.Fatal("There should only be one agent")
	}
	if !agentInfoCmp(sList.Agents[0], sinfoNew) {
		t.Fatal("Wrong agent info stored after edit")
	}

	// CHECK agent metadata [GetAgentsMetadata]
	req1 := types.AgentMetadataRequest{
		Agents: []string{"spiffeA"},
	}
	req2 := types.AgentMetadataRequest{
		Agents: []string{},
	}
	req3 := types.AgentMetadataRequest{
		Agents: []string{"nonexistent spiffe"},
	}
	sList, err = db.GetAgentsMetadata(req1)
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Agents) != 1 {
		t.Fatalf(fmt.Sprintf("We requested one agent, got: %v", sList))
	}
	sList, err = db.GetAgentsMetadata(req2)
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Agents) != 2 {
		t.Fatalf(fmt.Sprintf("We requested all agents, got: %v", sList))
	}
	sList, err = db.GetAgentsMetadata(req3)
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Agents) != 0 {
		t.Fatalf(fmt.Sprintf("We requested nonexistent agent, got: %v", sList))
	}
}

// TestClusterCreate checks edge cases involving CreateClusterEntry
// Uses functions NewLocalSqliteDB, db.GetClusters, db.CreateClusterEntry,
//
//	db.GetAgentClusterName, db.GetClusterAgents
func TestClusterCreate(t *testing.T) {
	cleanup()
	defer cleanup()
	expBackoff := backoff.NewExponentialBackOff()
	expBackoff.MaxElapsedTime = time.Second
	db, err := NewLocalSqliteDB("sqlite3", "./local-agentstest-db", expBackoff)
	if err != nil {
		t.Fatal(err)
	}

	// CHECKS no clusters initially present [GetClusters]
	cListObject, err := db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList := cListObject.Clusters
	if len(cList) > 0 {
		t.Fatal("Clusters list should initially be empty")
	}

	cluster1 := "cluster1"
	cluster2 := "cluster2"
	cluster3 := "cluster3"
	vms := "VMs"
	k8s := "Kubernetes"
	agent1 := "agent1"
	agent2 := "agent2"
	agent3 := "agent3"
	agent4 := "agent4"

	sinfo := types.AgentInfo{
		Spiffeid: agent1,
		Plugin:   "Docker",
	}

	cinfo1 := types.ClusterInfo{
		Name:         cluster1,
		PlatformType: vms,
		AgentsList:   []string{agent1, agent2},
	}
	cinfo1a := types.ClusterInfo{
		Name:         cluster1,
		PlatformType: k8s,
		AgentsList:   []string{agent1},
	}
	cinfo2 := types.ClusterInfo{
		Name:         cluster2,
		PlatformType: vms,
		AgentsList:   []string{agent2, agent4},
	}
	cinfo3 := types.ClusterInfo{
		Name:         cluster3,
		PlatformType: k8s,
		AgentsList:   []string{agent3},
	}

	// CHECK GetClusterAgents with nonexistent cluster [GetClusterAgents]
	_, err = db.GetClusterAgents(cluster1)
	if err == nil {
		t.Fatal("Cannot get agents from nonexistent cluster")
	}
	_, ok := err.(GetError)
	if !ok {
		t.Fatal("Non-get error")
	}

	// ATTEMPT Creating cluster [CreateClusterEntry, GetClusters]
	err = db.CreateClusterEntry(cinfo1)
	if err != nil {
		t.Fatal(err)
	}

	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList = cListObject.Clusters
	if len(cList) != 1 || !clusterEquality(cList[0], cinfo1) {
		t.Fatal("Clusters list after 1 insertion has incorrect cluster")
	}

	// ATTEMPT Create with already existing agent; should fail [CreateClusterEntry]
	err = db.CreateClusterEntry(cinfo1a)
	if err == nil {
		t.Fatal("Failure to report error on cluster create of existing cluster")
	}
	_, ok = err.(PostFailure)
	if !ok {
		t.Fatalf(fmt.Sprintf("Wrong error on cluster create of existing cluster: %v", err.Error()))
	}

	// ATTEMPT Create with no conflicting agent assignment [CreateClusterEntry, GetClusters]
	err = db.CreateClusterEntry(cinfo3)
	if err != nil {
		t.Fatal(err)
	}
	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	if clustersComp(cListObject, types.ClusterInfoList{Clusters: []types.ClusterInfo{cinfo1, cinfo3}}) != nil {
		t.Fatal("Clusters list after 2 good insertions does not have 2 correct clusters")
	}

	// ATTEMPT Create with conflicting agent assignment; should fail [CreateClusterEntry]
	err = db.CreateClusterEntry(cinfo2)
	if err == nil {
		t.Fatal("Failure to report failure to assign already assigned agent")
	}
	_, ok = err.(PostFailure)
	if !ok {
		t.Fatalf(fmt.Sprintf("Wrong error on agent assignment: %v", err.Error()))
	}
	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	if clustersComp(cListObject, types.ClusterInfoList{Clusters: []types.ClusterInfo{cinfo1, cinfo3}}) != nil {
		t.Fatal("Clusters list after 2 good insertions does not have 2 correct clusters")
	}

	// FINAL CHECK agent memberships; want 2 in cluster 1, 1 in cluster 2, 1 in cluster 3
	// [GetClusterAgents]
	agents1, err := db.GetClusterAgents(cluster1)
	if err != nil {
		t.Fatal(err)
	}
	_, err = db.GetClusterAgents(cluster2)
	if err == nil {
		t.Fatal("should not be able to get cluster agents of unsuccessfully assigned cluster")
	}
	agents3, err := db.GetClusterAgents(cluster3)
	if err != nil {
		t.Fatal(err)
	}
	err = agentListComp(agents1, []string{agent1, agent2})
	if err != nil {
		t.Fatalf(fmt.Sprintf("Error on basic registration of agents to cluster: %v", err))
	}
	err = agentListComp(agents3, []string{agent3})
	if err != nil {
		t.Fatalf(fmt.Sprintf("Error on basic registration of agents to cluster: %v", err))
	}

	// ATTEMPT editing registration of agent plugin [CreateAgentEntry]
	err = db.CreateAgentEntry(sinfo)
	if err != nil {
		t.Fatal(err)
	}

	// CHECK new agent plugin [GetAgentSelectors]
	sList, err := db.GetAgentSelectors()
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Agents) != 1 {
		t.Fatal("There should only be one agent")
	}
	if !agentInfoCmp(sList.Agents[0], sinfo) {
		t.Fatalf(fmt.Sprintf("Wrong agent info stored after edit: wanted %v, got %v", sinfo, sList.Agents[0]))
	}

	// FINAL CHECK agent memberships [GetAgentClusterName]
	agent1Cluster, err := db.GetAgentClusterName(agent1)
	if err != nil {
		t.Fatal(err)
	}
	agent2Cluster, err := db.GetAgentClusterName(agent2)
	if err != nil {
		t.Fatal(err)
	}
	agent3Cluster, err := db.GetAgentClusterName(agent3)
	if err != nil {
		t.Fatal(err)
	}
	agent4Cluster, err := db.GetAgentClusterName(agent4)
	if err == nil {
		t.Fatal("agent4 should not be assigned")
	}
	if agent1Cluster != cluster1 {
		t.Fatal("agent1 not in cluster1")
	}
	if agent2Cluster != cluster1 {
		t.Fatal("agent2 not in cluster1")
	}
	if agent3Cluster != cluster3 {
		t.Fatal("agent3 not in cluster3")
	}
	if agent4Cluster == cluster2 {
		t.Fatal("agent4 in cluster2")
	}

}

// TestClusterEdit checks edge cases involving EditClusterEntry
// uses NewLocalSqliteDB, db.CreateClusterEntry, db.EditClusterEntry,
//
//	db.GetAgentClusterName, db.GetClusterAgents
func TestClusterEdit(t *testing.T) {
	defer cleanup()
	expBackoff := backoff.NewExponentialBackOff()
	expBackoff.MaxElapsedTime = time.Second
	db, err := NewLocalSqliteDB("sqlite3", "./local-agentstest-db", expBackoff)
	if err != nil {
		t.Fatal(err)
	}

	// CHECK initial emptiness of cluster list
	cListObject, err := db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList := cListObject.Clusters
	if len(cList) > 0 {
		t.Fatal("Clusters list should initially be empty")
	}

	cluster1 := "cluster1"
	cluster2 := "cluster2"
	cluster3 := "cluster3"
	cluster4 := "cluster4"
	vms := "VMs"
	k8s := "Kubernetes"
	agent1 := "agent1"
	agent2 := "agent2"
	agent3 := "agent3"
	agent4 := "agent4"

	cinfo1 := types.ClusterInfo{
		Name:         cluster1,
		EditedName:   cluster1,
		PlatformType: vms,
		AgentsList:   []string{agent1, agent2},
	}
	cinfo1New := types.ClusterInfo{
		Name:         cluster1,
		EditedName:   cluster1,
		PlatformType: k8s,
		ManagedBy:    "MaiaIyer",
		AgentsList:   []string{agent1, agent3},
	}
	cinfo2 := types.ClusterInfo{
		Name:         cluster2,
		EditedName:   cluster2,
		PlatformType: vms,
		AgentsList:   []string{agent2, agent4},
	}
	cinfo3to4 := types.ClusterInfo{
		Name:         cluster3,
		EditedName:   cluster4,
		PlatformType: k8s,
		AgentsList:   []string{agent2},
	}
	cinfo1to3 := types.ClusterInfo{
		Name:         cluster1,
		EditedName:   cluster3,
		PlatformType: k8s,
		AgentsList:   []string{agent1},
	}
	cinfo3to2 := types.ClusterInfo{
		Name:         cluster3,
		EditedName:   cluster2,
		PlatformType: k8s,
		AgentsList:   []string{agent1},
	}
	cinfo3 := types.ClusterInfo{
		Name:         cluster3,
		EditedName:   cluster3,
		PlatformType: k8s,
		AgentsList:   []string{agent1},
	}

	// ATTEMPT CreateClusterEntry [CreateClusterEntry, GetClusters]
	err = db.CreateClusterEntry(cinfo1)
	if err != nil {
		t.Fatal(err)
	}

	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList = cListObject.Clusters
	if len(cList) != 1 || !clusterEquality(cList[0], cinfo1) {
		t.Fatal("Clusters list after 1 insertion has incorrect cluster")
	}

	// CHECK [GetClusterAgents]
	agents, err := db.GetClusterAgents("cluster1")
	if err != nil {
		t.Fatal(err)
	}
	err = agentListComp(agents, []string{agent1, agent2})
	if err != nil {
		t.Fatalf(fmt.Sprintf("Error on basic registration of agents to cluster: %v", err))
	}

	// ATTEMPT normal EditClusterEntry [EditClusterEntry, GetClusters, GetClusterAgents]
	err = db.EditClusterEntry(cinfo1New)
	if err != nil {
		t.Fatal(err)
	}
	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	if clustersComp(cListObject, types.ClusterInfoList{Clusters: []types.ClusterInfo{cinfo1New}}) != nil {
		t.Fatal("Clusters list after 1 good insertion and edit does not have 1 correct cluster")
	}

	// ATTEMPT EditClusterEntry on non-existent cluster; should fail [EditClusterEntry]
	err = db.EditClusterEntry(cinfo2)
	if err == nil {
		t.Fatal("Failed to report edit of nonexisting cluster")
	}
	_, ok := err.(PostFailure)
	if !ok {
		t.Fatalf(fmt.Sprintf("Wrong error returned on editing nonexisting cluster: %v", err.Error()))
	}

	// ATTEMPT EditClusterEntry with already assigned agent; should fail [CreateClusterEntry, EditClusterEntry]
	err = db.CreateClusterEntry(cinfo2)
	if err != nil {
		t.Fatal(err)
	}
	err = db.EditClusterEntry(cinfo1)
	if err == nil {
		t.Fatal("Failed to report failure of agent assignment already taken")
	}
	_, ok = err.(PostFailure)
	if !ok {
		t.Fatalf(fmt.Sprintf("Wrong error on assignment of already assigned agent: %v", err.Error()))
	}
	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	if clustersComp(cListObject, types.ClusterInfoList{Clusters: []types.ClusterInfo{cinfo2, cinfo1New}}) != nil {
		t.Fatal("Clusters list does not have correct clusters")
	}

	// CHECK agent memberships; want cluster1 to have agents 1 and 3 and cluster2 to have agents 2 and 4
	// [GetAgentClusterName]
	agent1Cluster, err := db.GetAgentClusterName(agent1)
	if err != nil {
		t.Fatal(err)
	}
	agent2Cluster, err := db.GetAgentClusterName(agent2)
	if err != nil {
		t.Fatal(err)
	}
	agent3Cluster, err := db.GetAgentClusterName(agent3)
	if err != nil {
		t.Fatal(err)
	}
	agent4Cluster, err := db.GetAgentClusterName(agent4)
	if err != nil {
		t.Fatal(err)
	}
	if agent1Cluster != cluster1 {
		t.Fatal("agent1 not in cluster1")
	}
	if agent2Cluster != cluster2 {
		t.Fatal("agent2 not in cluster1")
	}
	if agent3Cluster != cluster1 {
		t.Fatal("agent3 not in cluster1")
	}
	if agent4Cluster != cluster2 {
		t.Fatal("agent4 not in cluster2")
	}

	// TEST Renaming of cluster that exists to cluster that does not exist; should succeed
	err = db.EditClusterEntry(cinfo1to3)
	if err != nil {
		t.Fatal(err)
	}
	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	if clustersComp(cListObject, types.ClusterInfoList{Clusters: []types.ClusterInfo{cinfo2, cinfo3}}) != nil {
		t.Fatal("Clusters list does not have correct clusters")
	}

	// TEST Renaming of cluster that exists with conflicting new agents; should fail
	err = db.EditClusterEntry(cinfo3to4)
	if err == nil {
		t.Fatal("Renamed edit cluster should throw error with conflicting new agents")
	}
	_, ok = err.(PostFailure)
	if !ok {
		t.Fatalf(fmt.Sprintf("Wrong error on assignment of already assigned agent: %v", err.Error()))
	}
	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	if clustersComp(cListObject, types.ClusterInfoList{Clusters: []types.ClusterInfo{cinfo2, cinfo3}}) != nil {
		t.Fatal("Clusters list does not have correct clusters")
	}

	// TEST Renaming of cluster that exists to cluster that exists; should fail
	err = db.EditClusterEntry(cinfo3to2)
	if err == nil {
		t.Fatal("Renamed edit cluster should throw error when renaming to cluster that exists")
	}
	_, ok = err.(PostFailure)
	if !ok {
		t.Fatalf(fmt.Sprintf("Wrong error on renaming to existing cluster: %v", err.Error()))
	}
	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	if clustersComp(cListObject, types.ClusterInfoList{Clusters: []types.ClusterInfo{cinfo2, cinfo3}}) != nil {
		t.Fatal("Clusters list does not have correct clusters")
	}

}

// TestClusterDelete checks edge cases on DeleteClusterEntry
// uses NewLocalSqliteDB, db.GetClusters, db.CreateClusterEntry, db.EditClusterEntry
//
//	db.DeleteClusterEntry, db.GetAgentClusterName, db.GetClusterAgents
func TestClusterDelete(t *testing.T) {
	defer cleanup()
	expBackoff := backoff.NewExponentialBackOff()
	expBackoff.MaxElapsedTime = time.Second
	db, err := NewLocalSqliteDB("sqlite3", "./local-agentstest-db", expBackoff)
	if err != nil {
		t.Fatal(err)
	}

	// CHECK initial emptiness of cluster list
	cListObject, err := db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList := cListObject.Clusters
	if len(cList) > 0 {
		t.Fatal("Clusters list should initially be empty")
	}

	cluster1 := "cluster1"
	cluster2 := "cluster2"
	vms := "VMs"
	k8s := "Kubernetes"
	agent1 := "agent1"
	agent2 := "agent2"
	agent3 := "agent3"
	agent4 := "agent4"

	cinfo1 := types.ClusterInfo{
		Name:         cluster1,
		EditedName:   cluster1,
		PlatformType: vms,
		AgentsList:   []string{agent1, agent2},
	}
	cinfo1New := types.ClusterInfo{
		Name:         cluster1,
		EditedName:   cluster1,
		PlatformType: vms,
		AgentsList:   []string{},
	}
	cinfo2 := types.ClusterInfo{
		Name:         cluster2,
		EditedName:   cluster2,
		PlatformType: k8s,
		AgentsList:   []string{agent3, agent4},
	}

	// ATTEMPT basic CreateClusterEntry [CreateClusterEntry, GetClusters]
	err = db.CreateClusterEntry(cinfo1)
	if err != nil {
		t.Fatal(err)
	}

	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList = cListObject.Clusters
	if len(cList) != 1 || cList[0].Name != cinfo1.Name {
		t.Fatal("Clusters list after 1 insertion should have 1 cluster")
	}

	// CHECK GetClusterAgents [GetClusterAgents]
	agents, err := db.GetClusterAgents(cluster1)
	if err != nil {
		t.Fatal(err)
	}
	err = agentListComp(agents, []string{agent1, agent2})
	if err != nil {
		t.Fatalf(fmt.Sprintf("Error on basic registration of agents to cluster: %v", err))
	}

	// TEST Edit with Removing Entries [EditClusterEntry, GetClusterAgents]
	err = db.EditClusterEntry(cinfo1New)
	if err != nil {
		t.Fatal(err)
	}
	agents, err = db.GetClusterAgents(cluster1)
	if err != nil {
		t.Fatal(err)
	}
	if len(agents) != 0 {
		t.Fatal("EditClusterEntry cannot remove all agents")
	}
	_, err = db.GetAgentClusterName(agent1)
	if err == nil {
		t.Fatal("Agent1 not successfully unassigned")
	}

	// TEST DeleteClusterEntry on nonexistent cluster [DeleteClusterEntry]
	err = db.DeleteClusterEntry(cluster2)
	if err == nil {
		t.Fatal("Failure to report cluster does not exist")
	}

	// SETUP cluster with agents [CreateClusterEntry]
	err = db.CreateClusterEntry(cinfo2)
	if err != nil {
		t.Fatal(err)
	}

	// TEST DeleteClusterEntry on existing cluster with no agents [DeleteClusterEntry, GetClusterAgents]
	err = db.DeleteClusterEntry(cluster1)
	if err != nil {
		t.Fatal(err)
	}
	_, err = db.GetClusterAgents(cluster1)
	if err == nil {
		t.Fatal("Failure to report cluster does not exist")
	}

	// TEST DeleteClusterEntry on existing cluster with agents [DeleteClusterEngry]
	err = db.DeleteClusterEntry(cluster2)
	if err != nil {
		t.Fatal(err)
	}
	// CHECK agent previously assigned is unassigned with GetError [GetAgentClusterName]
	agent3Cluster, err := db.GetAgentClusterName(agent3)
	if err == nil {
		t.Fatal("Failure to report cluster does not exist")
	}
	_, ok := err.(GetError)
	if !ok {
		t.Fatal("incorrect failure")
	}
	if agent3Cluster != "" {
		t.Fatal("Agent3 not successfully unassigned")
	}
	// FINAL CHECK should have no clusters [GetClusters]
	cListObject, err = db.GetClusters()
	if err != nil {
		t.Fatal(err)
	}
	cList = cListObject.Clusters
	if len(cList) != 0 {
		t.Fatal("Clusters list should be empty")
	}

}

/**** HELPER SECTION ****/

func agentInfoCmp(agentInfo1 types.AgentInfo, agentInfo2 types.AgentInfo) bool {
	return agentInfo1.Spiffeid == agentInfo2.Spiffeid && agentInfo1.Plugin == agentInfo2.Plugin
}

func inList(elem string, list []string) bool {
	for i := 0; i < len(list); i++ {
		if elem == list[i] {
			return true
		}
	}
	return false
}

func agentListComp(correctList []string, resultList []string) error {
	if len(resultList) != len(correctList) {
		return errors.Errorf("Lists not the same: expected %v, got %v", correctList, resultList)
	} else {
		for i := 0; i < len(correctList); i++ {
			if !inList(correctList[i], resultList) {
				return errors.Errorf("Agent %v not in resulting agents list %v", correctList[i], resultList)
			}
		}
		return nil
	}
}

func clusterEquality(c1 types.ClusterInfo, c2 types.ClusterInfo) bool {
	if c1.Name != c2.Name || c1.DomainName != c2.DomainName ||
		c1.ManagedBy != c2.ManagedBy || c1.PlatformType != c2.PlatformType {
		return false
	}
	return agentListComp(c1.AgentsList, c2.AgentsList) == nil
}

func inClusterList(cluster types.ClusterInfo, list []types.ClusterInfo) bool {
	for i := 0; i < len(list); i++ {
		if clusterEquality(cluster, list[i]) {
			return true
		}
	}
	return false
}

func clustersComp(c1 types.ClusterInfoList, c2 types.ClusterInfoList) error {
	c1info := c1.Clusters
	c2info := c2.Clusters
	if len(c1info) != len(c2info) {
		return errors.New("Number of clusters incorrect")
	}
	for i := 0; i < len(c1info); i++ {
		if !inClusterList(c1info[i], c2info) {
			cname := c1info[i].Name
			return errors.Errorf("Error: first list contains cluster %v not in second list", cname)
		}
	}
	return nil
}

/**** END HELPER SECTION ****/
