package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/hashicorp/hcl"
	"github.com/pkg/errors"
	"github.com/spiffe/spire/pkg/common/catalog"
	agentapi "github.com/spiffe/tornjak/api/agent"
	"github.com/urfave/cli/v2"
)

type cliOptions struct {
	genericOptions struct {
		spireFile  string
		tornjakFile string
		expandEnv   bool
	}
}

func main() {
	var opt cliOptions
	app := &cli.App{
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:        "spire-config",
				Value:       "",
				Usage:       "Config file path for spire server",
				Destination: &opt.genericOptions.spireFile,
				Required:    false,
			},
			&cli.StringFlag{
				Name:        "tornjak-config",
				Value:       "",
				Usage:       "Config file path for tornjak server",
				Destination: &opt.genericOptions.tornjakFile,
				Required:    true,
			},
			&cli.BoolFlag{
				Name:        "expandEnv",
				Value:       false,
				Usage:       "Expansion of variables in config files",
				Destination: &opt.genericOptions.expandEnv,
				Required:    false,
			},
		},
		Commands: []*cli.Command{
			{
				Name:  "http",
				Usage: "Run the tornjak http server",
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
	// parse configs
	spire_config_file := opt.genericOptions.spireFile
	var serverInfo = agentapi.TornjakSpireServerInfo{}
	if spire_config_file != "" { // SPIRE config given
		configData, err := getConfigString(spire_config_file, false)
		if err != nil {
			return errors.Errorf("Could not find given SPIRE Config file: %v", err)
		}
		serverInfo, err = GetServerInfo(configData)
		if err != nil {
			log.Fatalf("Error: %v", err)
		}
	}

	tornjakConfigs, err := parseTornjakConfig(opt.genericOptions.tornjakFile, opt.genericOptions.expandEnv)
	if err != nil {
		return errors.Errorf("Unable to parse the tornjak config file provided %v", err)
	}

	switch cmd {
	case "serverinfo":
		if serverInfo.TrustDomain == "" {
			fmt.Println("No SPIRE config provided to Tornjak")
		} else {
			fmt.Println(serverInfo)
		}
		tornjakInfo, err := getConfigString(opt.genericOptions.tornjakFile, opt.genericOptions.expandEnv)
		if err != nil {
			log.Fatalf("Error: %v", err)
		}
		fmt.Println(tornjakInfo)
	case "http":

		apiServer := &agentapi.Server{
			SpireServerInfo: serverInfo,
			TornjakConfig:   tornjakConfigs,
		}
		apiServer.HandleRequests()
	default:
		return errors.New("Unrecognized command from helper func")
	}
	return nil

}

func GetServerInfo(configData string) (agentapi.TornjakSpireServerInfo, error) {
	// we extract TrustDomain and Plugin Info
	config, err := parseSPIREConfig(configData)
	if err != nil {
		return agentapi.TornjakSpireServerInfo{}, errors.Errorf("Could not parse SPIRE Config: %v", err)
	}


	if config.Plugins == nil {
		return agentapi.TornjakSpireServerInfo{}, errors.New("config plugins map should not be nil")
	}

	pluginConfigs, err := catalog.PluginConfigsFromHCLNode(config.Plugins)
	if err != nil {
		return agentapi.TornjakSpireServerInfo{}, errors.Errorf("Unable to parse plugin HCL: %v", err)
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
	serverInfo += configData

	return agentapi.TornjakSpireServerInfo{
		Plugins:       pluginMap,
		TrustDomain:   config.Server.TrustDomain,
		VerboseConfig: serverInfo,
	}, nil
}

func getConfigString(path string, expandEnv bool) (string, error) {
	if path == "" {
		return "", nil
	}

	// friendly error if file is missing
	byteData, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			absPath, err := filepath.Abs(path)
			if err != nil {
				msg := "could not determine CWD; config file not found at %s"
				return "", fmt.Errorf(msg, path)
			}
			msg := "could not find config file %s"
			return "", fmt.Errorf(msg, absPath)
		}
		return "", fmt.Errorf("unable to read configuration file at %q: %w", path, err)
	}
	data := string(byteData)

	// expand environment variables if flag is set
	if expandEnv {
		data = os.ExpandEnv(data)
	}

	return data, nil
}

// we use our own returned SPIRE Config type to extract information
// needed specifically by the frontend
func parseSPIREConfig(data string) (*agentapi.SPIREConfig, error) {
	c := &agentapi.SPIREConfig{}

	if err := hcl.Decode(&c, data); err != nil {
		return nil, fmt.Errorf("unable to decode SPIRE configuration: %w", err)
	}

	return c, nil
}

// below copied from spire/cmd/spire-server/cli/run/run.go, but with TornjakConfig
func parseTornjakConfig(path string, expandEnv bool) (*agentapi.TornjakConfig, error) {
	c := &agentapi.TornjakConfig{}

	if path == "" {
		return nil, nil
	}

	// friendly error if file is missing
	data, err := getConfigString(path, expandEnv)
	if err != nil {
		return nil, err
	}

	if err := hcl.Decode(&c, data); err != nil {
		return nil, fmt.Errorf("unable to decode tornjak configuration at %q: %w", path, err)
	}

	return c, nil
}
