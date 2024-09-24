# Server plugin: Datastore "SQL"

Note the Datastore is a required plugin, and currently, as the SQL datastore is the only supported instance of the datastore plugin, there must be a section configuring this upon Tornjak backend startup.

The configuration has the following key-value pairs:

| Key         | Description                  | Required            |
| ----------- | ---------------------------- | ------------------- |
| drivername  | Driver for SQL database      | True                |
| filename    | Location of database         | True                |

A sample configuration file for syntactic reference is below:

```hcl
    DataStore "sql" {
        plugin_data {
            issuer = "sqlite3"
            audience = "/run/spire/data/tornjak.sqlite3"
        }
    }
```
