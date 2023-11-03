package db

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/cenkalti/backoff/v4"
	_ "github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"

	"github.com/spiffe/tornjak/pkg/agent/types"
)

const (
	// agent table with fields spiffeid and plugin
	initAgentsTable = `CREATE TABLE IF NOT EXISTS agents 
                            (id INTEGER PRIMARY KEY AUTOINCREMENT, spiffeid TEXT, plugin TEXT, UNIQUE (spiffeid))`
	// cluster table with fields name, domainName, platformtype, managedby
	initClustersTable = `CREATE TABLE IF NOT EXISTS clusters 
                            (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, created_at TEXT, 
                            domain_name TEXT, platform_type TEXT, managed_by TEXT, UNIQUE (name))`
	// cluster - agent relation table specifying by clusterid and spiffeid
	//                                enforces uniqueness of spiffeid
	initClusterMemberTable = `CREATE TABLE IF NOT EXISTS cluster_memberships 
                            (id INTEGER PRIMARY KEY AUTOINCREMENT, agent_id int, cluster_id int,
                            FOREIGN KEY (agent_id) REFERENCES agents(id), 
                            FOREIGN KEY (cluster_id) REFERENCES clusters(id), UNIQUE (agent_id))`
)

type LocalSqliteDb struct {
	database   *sql.DB
	expBackoff *backoff.BackOff
}

func createDBTable(database *sql.DB, cmd string) error {
	statement, err := database.Prepare(cmd)
	if err != nil {
		return SQLError{cmd, err}
	}
	_, err = statement.Exec()
	if err != nil {
		return SQLError{cmd, err}
	}
	return nil
}

func NewLocalSqliteDB(driverName string, dbpath string, backOffParams backoff.BackOff) (AgentDB, error) {
	database, err := sql.Open(driverName, dbpath)
	if err != nil {
		return nil, errors.New("Unable to open connection to DB")
	}

	initTableList := []string{initAgentsTable, initClustersTable, initClusterMemberTable}

	for i := 0; i < len(initTableList); i++ {
		err = createDBTable(database, initTableList[i])
		if err != nil {
			return nil, err
		}
	}

	return &LocalSqliteDb{
		database:   database,
		expBackoff: &backOffParams,
	}, nil
}

// AGENT - SELECTOR/PLUGIN HANDLERS

func (db *LocalSqliteDb) CreateAgentEntry(sinfo types.AgentInfo) error {
	cmdInsert := `INSERT INTO agents (spiffeid, plugin) VALUES `
	cmdUpdate := ` ON CONFLICT(spiffeid) DO UPDATE SET plugin=`
	if len(sinfo.Plugin) > 0 {
		cmdInsert += `(?, ?)`
		cmdUpdate += `(?)`
	} else {
		cmdInsert += `(?, NULL)`
		cmdUpdate += `NULL`
	}
	cmd := cmdInsert + cmdUpdate
	statement, err := db.database.Prepare(cmd)
	if err != nil {
		return SQLError{cmd, err}
	}
	if len(sinfo.Plugin) > 0 {
		_, err = statement.Exec(sinfo.Spiffeid, sinfo.Plugin, sinfo.Plugin)
	} else {
		_, err = statement.Exec(sinfo.Spiffeid)
	}
	if err != nil {
		return SQLError{cmd, err}
	}
	return nil
}

func (db *LocalSqliteDb) GetAgentSelectors() (types.AgentInfoList, error) {
	cmd := `SELECT spiffeid, plugin FROM agents WHERE plugin IS NOT NULL`
	rows, err := db.database.Query(cmd)
	if err != nil {
		return types.AgentInfoList{}, SQLError{cmd, err}
	}

	sinfos := []types.AgentInfo{}
	var (
		spiffeid string
		plugin   string
	)
	for rows.Next() {
		if err = rows.Scan(&spiffeid, &plugin); err != nil {
			return types.AgentInfoList{}, SQLError{cmd, err}
		}

		sinfos = append(sinfos, types.AgentInfo{
			Spiffeid: spiffeid,
			Plugin:   plugin,
		})
	}

	return types.AgentInfoList{
		Agents: sinfos,
	}, nil
}

func (db *LocalSqliteDb) GetAgentPluginInfo(spiffeid string) (types.AgentInfo, error) {
	cmd := `SELECT spiffeid, plugin FROM agents WHERE spiffeid=?`
	row := db.database.QueryRow(cmd, spiffeid)

	sinfo := types.AgentInfo{}
	err := row.Scan(&sinfo.Spiffeid, &sinfo.Plugin)
	if err == sql.ErrNoRows {
		return types.AgentInfo{}, GetError{fmt.Sprintf("Agent %v has no assigned plugin", spiffeid)}
	} else if err != nil {
		return types.AgentInfo{}, SQLError{cmd, err}
	}
	return sinfo, nil
}

// CLUSTER HANDLERS

// GetClusterAgents takes in string cluster name and outputs array of spiffeids of agents assigned to the cluster
func (db *LocalSqliteDb) GetClusterAgents(name string) ([]string, error) {
	// search in clusterMemberships table
	cmdGetMemberships := `SELECT GROUP_CONCAT(agents.spiffeid) 
                        FROM clusters 
                        LEFT JOIN cluster_memberships ON clusters.id=cluster_memberships.cluster_id
                        LEFT JOIN agents ON cluster_memberships.agent_id=agents.id
                        WHERE clusters.name=? 
                        GROUP BY clusters.name`
	row := db.database.QueryRow(cmdGetMemberships, name)

	var spiffeidList []string
	var spiffeids sql.NullString

	err := row.Scan(&spiffeids)
	if err == sql.ErrNoRows {
		return nil, GetError{fmt.Sprintf("Cluster %v not registered", name)}
	} else if err != nil {
		return nil, SQLError{cmdGetMemberships, err}
	}
	if spiffeids.Valid {
		spiffeidList = strings.Split(spiffeids.String, ",")
	} else {
		spiffeidList = []string{}
	}

	return spiffeidList, nil

}

// GetAgentClusterName takes in string of spiffeid of agent and outputs the name of the cluster
func (db *LocalSqliteDb) GetAgentClusterName(spiffeid string) (string, error) {
	var clusterName sql.NullString
	cmdGetName := `SELECT clusters.name 
                 FROM agents 
                 LEFT JOIN cluster_memberships ON agents.id=cluster_memberships.agent_id
                 LEFT JOIN clusters ON cluster_memberships.cluster_id=clusters.id
                 WHERE agents.spiffeid=?`
	row := db.database.QueryRow(cmdGetName, spiffeid)
	err := row.Scan(&clusterName)
	if err == sql.ErrNoRows {
		return "", GetError{fmt.Sprintf("Agent %v unassigned to any cluster", spiffeid)}
	} else if err != nil {
		return "", SQLError{cmdGetName, err}
	}
	if clusterName.Valid {
		return clusterName.String, nil
	} else {
		return "", GetError{fmt.Sprintf("Agent %v assinged to unregistered cluster", spiffeid)}
	}
}

// GetAgentsMetadata takes a AgentMetadataRequest with a list of agent spiffeids
// outputs list of agentinfo objects, where spiffeids must be in the input list
// includes info on plugin and clustername
func (db *LocalSqliteDb) GetAgentsMetadata(req types.AgentMetadataRequest) (types.AgentInfoList, error) {
	spiffeids := req.Agents
	cmd := `SELECT agents.spiffeid, agents.plugin, clusters.name 
          FROM agents 
          LEFT JOIN cluster_memberships ON agents.id = cluster_memberships.agent_id
          LEFT JOIN clusters ON cluster_memberships.cluster_id = clusters.id`
	var err error
	var rows *sql.Rows
	if len(spiffeids) > 0 {
		cmd += ` WHERE agents.spiffeid IN (`
		vals := []interface{}{}
		for i := 0; i < len(spiffeids); i++ {
			cmd += "?,"
			vals = append(vals, spiffeids[i])
		}
		vals = append(vals, vals...)
		cmd = strings.TrimSuffix(cmd, ",") + ")"
		rows, err = db.database.Query(cmd, vals...)
	} else {
		rows, err = db.database.Query(cmd)
	}

	if err != nil {
		return types.AgentInfoList{}, SQLError{cmd, err}
	}

	ainfos := []types.AgentInfo{}
	var (
		spiffeid string
		plugin   sql.NullString
		cluster  sql.NullString
	)
	for rows.Next() {
		if err = rows.Scan(&spiffeid, &plugin, &cluster); err != nil {
			return types.AgentInfoList{}, SQLError{cmd, err}
		}

		newAgent := types.AgentInfo{
			Spiffeid: spiffeid,
			Plugin:   "",
			Cluster:  "",
		}
		if plugin.Valid {
			newAgent.Plugin = plugin.String
		}
		if cluster.Valid {
			newAgent.Cluster = cluster.String
		}

		ainfos = append(ainfos, newAgent)
	}

	return types.AgentInfoList{
		Agents: ainfos,
	}, nil
}

// GetClusters outputs a list of ClusterInfo structs with information on currently registered clusters
func (db *LocalSqliteDb) GetClusters() (types.ClusterInfoList, error) {
	// BEGIN transaction
	cmd := `SELECT clusters.name, clusters.created_at, clusters.domain_name, clusters.managed_by, 
          clusters.platform_type, GROUP_CONCAT(agents.spiffeid) 
          FROM clusters 
          LEFT JOIN cluster_memberships ON clusters.id=cluster_memberships.cluster_id
          LEFT JOIN agents ON cluster_memberships.agent_id=agents.id
          GROUP BY clusters.name`

	rows, err := db.database.Query(cmd)
	if err != nil {
		return types.ClusterInfoList{}, SQLError{cmd, err}
	}

	sinfos := []types.ClusterInfo{}
	var (
		name                string
		createdAt           string
		domainName          string
		managedBy           string
		platformType        string
		agentsListConcatted sql.NullString
		agentsList          []string
	)
	for rows.Next() {
		if err = rows.Scan(&name, &createdAt, &domainName, &managedBy, &platformType, &agentsListConcatted); err != nil {
			return types.ClusterInfoList{}, SQLError{cmd, err}
		}

		if agentsListConcatted.Valid { // handle clusters with no assigned agents
			agentsList = strings.Split(agentsListConcatted.String, ",")
		} else {
			agentsList = []string{}
		}
		sinfos = append(sinfos, types.ClusterInfo{
			Name:         name,
			CreationTime: createdAt,
			DomainName:   domainName,
			ManagedBy:    managedBy,
			PlatformType: platformType,
			AgentsList:   agentsList,
		})
	}

	return types.ClusterInfoList{
		Clusters: sinfos,
	}, nil
}

// CreateClusterEntry takes in struct cinfo of type ClusterInfo.  If a cluster with cinfo.Name already registered, returns error.
func (db *LocalSqliteDb) createClusterEntryOp(cinfo types.ClusterInfo) error {
	// BEGIN transaction
	ctx := context.Background()
	tx, err := db.database.BeginTx(ctx, nil)
	if err != nil {
		return errors.Errorf("Error initializing context: %v", err)
	}
	txHelper := getTornjakTxHelper(ctx, tx)

	// INSERT cluster metadata
	err = txHelper.insertClusterMetadata(cinfo)
	if err != nil {
		return backoff.Permanent(txHelper.rollbackHandler(err))
	}

	// ADD agents to cluster
	err = txHelper.addAgentBatchToCluster(cinfo.Name, cinfo.AgentsList)
	if err != nil {
		return backoff.Permanent(txHelper.rollbackHandler(err))
	}
	return tx.Commit()
}

// EditClusterEntry takes in struct cinfo of type ClusterInfo.  If cluster with cinfo.Name does not exist, throws error.
func (db *LocalSqliteDb) editClusterEntryOp(cinfo types.ClusterInfo) error {
	// BEGIN transaction
	ctx := context.Background()
	tx, err := db.database.BeginTx(ctx, nil)
	if err != nil {
		return errors.Errorf("Error initializing context: %v", err)
	}
	txHelper := getTornjakTxHelper(ctx, tx)

	// UPDATE cluster metadata
	err = txHelper.updateClusterMetadata(cinfo)
	if err != nil {
		return backoff.Permanent(txHelper.rollbackHandler(err))
	}

	// REMOVE all currently assigned cluster agents
	err = txHelper.deleteClusterAgents(cinfo.EditedName)
	if err != nil {
		return backoff.Permanent(txHelper.rollbackHandler(err))
	}

	// ADD agents to cluster
	err = txHelper.addAgentBatchToCluster(cinfo.EditedName, cinfo.AgentsList)
	if err != nil {
		return backoff.Permanent(txHelper.rollbackHandler(err))
	}

	return tx.Commit()
}

// DeleteClusterEntry takes in string name of cluster and removes cluster information and agent membership of cluster from the database.  If not all agents can be removed from the cluster, cluster information remains in the database.
func (db *LocalSqliteDb) deleteClusterEntryOp(clusterName string) error {
	// BEGIN transaction
	ctx := context.Background()
	tx, err := db.database.BeginTx(ctx, nil)
	if err != nil {
		return errors.Errorf("Error initializing context: %v", err)
	}
	txHelper := getTornjakTxHelper(ctx, tx)

	// REMOVE all currently assigned cluster agents (requires metadata still entered)
	err = txHelper.deleteClusterAgents(clusterName)
	if err != nil {
		return backoff.Permanent(txHelper.rollbackHandler(err))
	}

	// REMOVE cluster metadata
	err = txHelper.deleteClusterMetadata(clusterName)
	if err != nil {
		return backoff.Permanent(txHelper.rollbackHandler(err))
	}

	return tx.Commit()
}

func (db *LocalSqliteDb) retryOp(operation func() error) error {
	err := backoff.Retry(operation, *db.expBackoff)
	if err != nil {
		if serr, ok := err.(*backoff.PermanentError); ok {
			return serr.Unwrap()
		}
	}
	return err
}

func (db *LocalSqliteDb) CreateClusterEntry(cinfo types.ClusterInfo) error {
	operation := func() error {
		return db.createClusterEntryOp(cinfo)
	}
	return db.retryOp(operation)
}

func (db *LocalSqliteDb) EditClusterEntry(cinfo types.ClusterInfo) error {
	operation := func() error {
		return db.editClusterEntryOp(cinfo)
	}
	return db.retryOp(operation)
}

func (db *LocalSqliteDb) DeleteClusterEntry(clustername string) error {
	operation := func() error {
		return db.deleteClusterEntryOp(clustername)
	}
	return db.retryOp(operation)
}
