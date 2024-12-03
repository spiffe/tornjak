package db

import (
	"database/sql"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"
	"github.com/spiffe/tornjak/pkg/manager/types"
)

// TO DO: Add DELETE servers option from the data base
const (
	initServersTable  = "CREATE TABLE IF NOT EXISTS servers (servername TEXT PRIMARY KEY, address TEXT, tls bool, mtls bool, ca varBinary, cert varBinary, key varBinary)"
	initClustersTable = `CREATE TABLE IF NOT EXISTS clusters 
		(id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT UNIQUE, name TEXT, domain_name TEXT, platform_type TEXT, managed_by TEXT, UNIQUE(name))`
)

type LocalSqliteDb struct {
	database *sql.DB
}

func BackfillClusterUIDs(db *sql.DB) error {
	rows, err := db.Query("SELECT id FROM clusters WHERE uid IS NULL")
	if err != nil {
		return err
	}
	defer rows.Close()

	updateCmd := `UPDATE clusters SET uid = ? WHERE id = ?`
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return err
		}
		uid := uuid.New().String()
		_, err := db.Exec(updateCmd, uid, id)
		if err != nil {
			return err
		}
	}
	return nil
}

func NewLocalSqliteDB(dbpath string) (ManagerDB, error) {
	database, err := sql.Open("sqlite3", dbpath)
	if err != nil {
		return nil, errors.New("Unable to open connection to DB")
	}

	// Initialize tables
	initTableList := []string{initServersTable, initClustersTable}

	for _, cmd := range initTableList {
		statement, err := database.Prepare(cmd)
		if err != nil {
			return nil, errors.Errorf("Unable to execute SQL query: %v", cmd)
		}
		_, err = statement.Exec()
		if err != nil {
			return nil, errors.Errorf("Unable to execute SQL query: %v", cmd)
		}
	}

	// Backfill UID for existing clusters
	err = BackfillClusterUIDs(database)
	if err != nil {
		return nil, errors.Errorf("Failed to backfill cluster UIDs: %v", err)
	}

	return &LocalSqliteDb{
		database: database,
	}, nil
}

// func (db *LocalSqliteDb) CreateClusterEntry(cinfo types.ClusterInfo) error {
// 	statement, err := db.database.Prepare("INSERT INTO clusters (uid, name, domain_name, platform_type, managed_by) VALUES (?, ?, ?, ?, ?)")
// 	if err != nil {
// 		return errors.Errorf("Unable to prepare SQL query: %v", err)
// 	}

// 	_, err = statement.Exec(cinfo.UID, cinfo.Name, cinfo.DomainName, cinfo.PlatformType, cinfo.ManagedBy)
// 	if err != nil {
// 		return errors.Errorf("Unable to execute SQL query: %v", err)
// 	}
// 	return nil
// }

// func (db *LocalSqliteDb) GetClusters() ([]types.ClusterInfo, error) {
// 	rows, err := db.database.Query("SELECT uid, name, domain_name, platform_type, managed_by FROM clusters")
// 	if err != nil {
// 		return nil, errors.New("Unable to execute SQL query")
// 	}

// 	clusters := []types.ClusterInfo{}
// 	var (
// 		uid          string
// 		name         string
// 		domainName   string
// 		platformType string
// 		managedBy    string
// 	)
// 	for rows.Next() {
// 		if err = rows.Scan(&uid, &name, &domainName, &platformType, &managedBy); err != nil {
// 			return nil, err
// 		}

// 		clusters = append(clusters, types.ClusterInfo{
// 			UID:          uid,
// 			Name:         name,
// 			DomainName:   domainName,
// 			PlatformType: platformType,
// 			ManagedBy:    managedBy,
// 		})
// 	}

// 	return clusters, nil
// }

// func (db *LocalSqliteDb) GetClusterByUID(uid string) (types.ClusterInfo, error) {
// 	row := db.database.QueryRow("SELECT uid, name, domain_name, platform_type, managed_by FROM clusters WHERE uid=?", uid)

// 	cinfo := types.ClusterInfo{}
// 	err := row.Scan(&cinfo.UID, &cinfo.Name, &cinfo.DomainName, &cinfo.PlatformType, &cinfo.ManagedBy)
// 	if err == sql.ErrNoRows {
// 		return types.ClusterInfo{}, errors.New("Cluster not found")
// 	} else if err != nil {
// 		return types.ClusterInfo{}, err
// 	}

// 	return cinfo, nil
// }

func (db *LocalSqliteDb) CreateServerEntry(sinfo types.ServerInfo) error {
	statement, err := db.database.Prepare("INSERT INTO servers (servername, address, tls, mtls, ca, cert, key) VALUES (?,?,?,?,?,?,?)")
	if err != nil {
		return errors.Errorf("Unable to execute SQL query: %v", err)
	}
	_, err = statement.Exec(sinfo.Name, sinfo.Address, sinfo.TLS, sinfo.MTLS, sinfo.CA, sinfo.Cert, sinfo.Key)

	return err
}

func (db *LocalSqliteDb) GetServers() (types.ServerInfoList, error) {
	rows, err := db.database.Query("SELECT servername, address, tls, mtls, ca, cert, key FROM servers")
	if err != nil {
		return types.ServerInfoList{}, errors.New("Unable to execute SQL query")
	}

	sinfos := []types.ServerInfo{}
	var (
		name    string
		address string
		tls     bool
		mtls    bool
		ca      []byte
		cert    []byte
		key     []byte
	)
	for rows.Next() {
		if err = rows.Scan(&name, &address, &tls, &mtls, &ca, &cert, &key); err != nil {
			return types.ServerInfoList{}, err
		}

		sinfos = append(sinfos, types.ServerInfo{
			Name:    name,
			Address: address,
			TLS:     tls,
			MTLS:    mtls,
			CA:      ca,
			Cert:    cert,
			Key:     key,
		})
	}

	return types.ServerInfoList{
		Servers: sinfos,
	}, nil
}

func (db *LocalSqliteDb) GetServer(name string) (types.ServerInfo, error) {
	row := db.database.QueryRow("SELECT servername, address, tls, mtls, ca, cert, key FROM servers WHERE servername=?", name)

	sinfo := types.ServerInfo{}
	err := row.Scan(&sinfo.Name, &sinfo.Address, &sinfo.TLS, &sinfo.MTLS, &sinfo.CA, &sinfo.Cert, &sinfo.Key)
	if err != nil {
		return types.ServerInfo{}, err
	}

	return sinfo, nil
}
