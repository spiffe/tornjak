package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	agentapi "github.com/lumjjb/tornjak/tornjak-backend/api/agent"
	"github.com/pkg/errors"
	"github.com/spiffe/spire/cmd/spire-server/cli/run"
	"github.com/spiffe/spire/pkg/common/catalog"
	"github.com/urfave/cli/v2"
)

type cliOptions struct {
	genericOptions struct {
		configFile string
	}
	httpOptions struct {
		listenAddr string
		certPath   string
		keyPath    string
		tls        bool
		mtls       bool
	}
	dbOptions struct {
		dbString string
	}
}

func main() {
	var opt cliOptions
	app := &cli.App{
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:        "spire-config-file",
				Aliases:     []string{"c"},
				Value:       "",
				Usage:       "Config file path for spire server",
				Destination: &opt.genericOptions.configFile,
				Required:    true,
			},
			&cli.StringFlag{
				Name:        "agents-db-string",
				Value:       "./agentlocaldb",
				Usage:       "Db string for agents",
				Destination: &opt.dbOptions.dbString,
			},
		},
		Commands: []*cli.Command{
			{
				Name:  "http",
				Usage: "Run the tornjak http server",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:        "listen-addr",
						Value:       ":10000",
						Usage:       "listening address for server",
						Destination: &opt.httpOptions.listenAddr,
						Required:    false,
					},
					&cli.StringFlag{
						Name:        "cert",
						Value:       "",
						Usage:       "CA Cert path for TLS/mTLS",
						Destination: &opt.httpOptions.certPath,
						Required:    false,
					},
					&cli.StringFlag{
						Name:        "key",
						Value:       "",
						Usage:       "Key path for TLS/mTLS",
						Destination: &opt.httpOptions.keyPath,
						Required:    false,
					},
					&cli.BoolFlag{
						Name:        "tls",
						Value:       false,
						Usage:       "Enable TLS for http server",
						Destination: &opt.httpOptions.tls,
						Required:    false,
					},
					&cli.BoolFlag{
						Name:        "mtls",
						Value:       false,
						Usage:       "Enable mTLS for http server (overwrites tls flag)",
						Destination: &opt.httpOptions.mtls,
						Required:    false,
					},
				},

				Action: func(c *cli.Context) error {
					return runTornjakCmd("http", opt)
				},
			},
			{
				Name:  "serverinfo",
				Usage: "Get the serverinfo of the SPIRE server where tornjak resides",
				Action: func(c *cli.Context) error {
					return runTornjakCmd("serverinfo", opt)
				},
			},
		},
	}

	err := app.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}

func runTornjakCmd(cmd string, opt cliOptions) error {
	agentdb, err := agentapi.NewAgentsDB(opt.dbOptions.dbString)
	if err != nil {
		log.Fatalf("err: %v", err)
	}
	config, err := run.ParseFile(opt.genericOptions.configFile, false)
	if err != nil {
		// Hide internal error since it is specific to arguments of originating library
		// i.e. asks to set -config which is a different flag in tornjak
		return errors.New("Unable to parse the config file provided")
	}

	switch cmd {
	case "serverinfo":
		serverInfo, err := GetServerInfo(config)
		if err != nil {
			log.Fatalf("Error: %v", err)
		}
		fmt.Println(serverInfo)
	case "http":
		serverInfo, err := GetServerInfo(config)
		if err != nil {
			log.Fatalf("Error: %v", err)
		}

		apiServer := &agentapi.Server{
			SpireServerAddr: getSocketPath(config),
			ListenAddr:      opt.httpOptions.listenAddr,
			CertPath:        opt.httpOptions.certPath,
			KeyPath:         opt.httpOptions.keyPath,
			TlsEnabled:      opt.httpOptions.tls,
			MTlsEnabled:     opt.httpOptions.mtls,
			SpireServerInfo: serverInfo,
			Db:              agentdb,
		}
		apiServer.HandleRequests()
	default:
		return errors.New("Unrecognized command from helper func")
	}
	return nil

}

func GetServerInfo(config *run.Config) (agentapi.TornjakServerInfo, error) {
	if config.Plugins == nil {
		return agentapi.TornjakServerInfo{}, errors.New("config plugins map should not be nil")
	}

	pluginConfigs, err := catalog.PluginConfigsFromHCL(*config.Plugins)
	if err != nil {
		return agentapi.TornjakServerInfo{}, errors.Errorf("Unable to parse plugin HCL: %v", err)
	}

	serverInfo := ""
	serverInfo += "Plugin Info\n"
	pluginMap := map[string][]string{}
	for _, pc := range pluginConfigs {
		serverInfo += fmt.Sprintf("%v Plugin: %v\n", pc.Type, pc.Name)
		serverInfo += fmt.Sprintf("Data: %v\n\n", pc.Data)
		pluginMap[pc.Type] = append(pluginMap[pc.Type], pc.Name)
	}

	serverInfo += "\n\n"
	serverInfo += "Server Info"
	s, _ := json.MarshalIndent(config.Server, "", "\t")
	serverInfo += string(s)

	return agentapi.TornjakServerInfo{
		Plugins:       pluginMap,
		TrustDomain:   config.Server.TrustDomain,
		VerboseConfig: serverInfo,
	}, nil
}

func getSocketPath(config *run.Config) string {
	socketPath := config.Server.SocketPath
	if config.Server.DeprecatedRegistrationUDSPath != "" {
		socketPath = config.Server.DeprecatedRegistrationUDSPath
	}

	return "unix://" + socketPath
}
