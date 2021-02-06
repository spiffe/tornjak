package db

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"github.com/pkg/errors"

	"github.com/lumjjb/tornjak/manager/types"
)

const (
	initServersTable = "CREATE TABLE IF NOT EXISTS servers (servername TEXT PRIMARY KEY, address TEXT)"
)

type LocalSqliteDb struct {
	database *sql.DB
}

func NewLocalSqliteDB(dbpath string) (ManagerDB, error) {
	database, err := sql.Open("sqlite3", dbpath)
	if err != nil {
		return nil, errors.New("Unable to open connection to DB")
	}

	statement, err := database.Prepare(initServersTable)
	if err != nil {
		return nil, errors.Errorf("Unable to execute SQL query :%v", initServersTable)
	}
	_, err = statement.Exec()
	if err != nil {
		return nil, errors.Errorf("Unable to execute SQL query :%v", initServersTable)
	}

	return &LocalSqliteDb{
		database: database,
	}, nil

}

func (db *LocalSqliteDb) CreateServerEntry(sinfo types.ServerInfo) error {
	statement, err := db.database.Prepare("INSERT INTO servers (servername, address) VALUES (?, ?)")
	if err != nil {
		return errors.New("Unable to execute SQL query")
	}
	_, err = statement.Exec(sinfo.Name, sinfo.Address)

	return err
}


func (db *LocalSqliteDb) GetServers () (types.ServerInfoList, error) {
    rows, err := db.database.Query("SELECT servername, address FROM servers")
	if err != nil {
		return types.ServerInfoList{}, errors.New("Unable to execute SQL query")
	}

    sinfos := []types.ServerInfo{}
    var name string
    var address string
    for rows.Next() {
        if err = rows.Scan(&name, &address); err != nil {
            return  types.ServerInfoList{}, err
        }

        sinfos = append(sinfos, types.ServerInfo{
            Name: name,
            Address: address,
        })
    }

	return types.ServerInfoList{
        Servers: sinfos,
    }, nil
}

func (db *LocalSqliteDb) GetServer (name string) (types.ServerInfo, error) {
    row := db.database.QueryRow("SELECT servername, address FROM servers WHERE servername=?", name)
	
    sinfo := types.ServerInfo{}
    err := row.Scan(&sinfo.Name, &sinfo.Address)
    if err != nil {
		return types.ServerInfo{}, err
	}

	return sinfo, nil
}
