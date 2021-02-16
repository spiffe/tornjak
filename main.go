package main

import (
	"fmt"
	"log"
	//"context"
	//grpc "google.golang.org/grpc"
	//agent "github.com/spiffe/spire/proto/spire/api/server/agent/v1"
	"encoding/json"
	"github.com/lumjjb/tornjak/api"
	"github.com/pkg/errors"
	"github.com/spiffe/spire/cmd/spire-server/cli/run"
	"github.com/spiffe/spire/pkg/common/catalog"
	"os"
	"os/exec"
)

/*
func main() {
    if len(os.Args) <  3 {
        log.Fatalf("Usage %v <unix://socket> [list|join]", os.Args[0])
    }
    var conn *grpc.ClientConn
	conn, err := grpc.Dial(os.Args[1], grpc.WithInsecure())
	if err != nil {
		log.Fatalf("did not connect: %s", err)
	}
	defer conn.Close()


    cmd := os.Args[2]
    client:= agent.NewAgentClient(conn)

    if cmd == "list" {

        resp, err := client.ListAgents(context.Background(), &agent.ListAgentsRequest{})
        if err != nil {
            log.Fatalf("can't list agents %s", err)
        }

        for _, v := range resp.Agents {
            fmt.Println(v)
        }
    } else if cmd == "join" {

        resp, err := client.CreateJoinToken(context.Background(), &agent.CreateJoinTokenRequest{Ttl: 6000})
        if err != nil {
            log.Fatalf("can't create join token %s", err)
        }
        fmt.Printf("Join token: %s\n", resp.Value)
    } else {
        log.Fatalf("Unrecognized command")
    }

    return
}
*/

func main() {
	if len(os.Args) < 3 {
		log.Fatalf("Usage %v <config file> [serverinfo|api|http]", os.Args[0])
	}

	config, err := run.ParseFile(os.Args[1], false)
	if err != nil {
		log.Fatalf("Unable to parse config file: %v", err)
	}

	cmd := os.Args[2]

	switch cmd {
	case "serverinfo":
		GetServerInfo(config)
	case "api":
		// default to spire-server binary
		RunSpireApi(config)
	case "http":
		apiServer := &api.Server{
			SpireServerAddr: "unix://" + config.Server.RegistrationUDSPath,
			// TODO: Add flag parse for args
			CertPath:    "cert.pem",
			KeyPath:     "key.pem",
			TlsEnabled:  false,
			MTlsEnabled: false,
		}
		apiServer.HandleRequests()
	default:
		log.Fatalf("Unrecognized command")
	}
	return

}

func GetServerInfo(config *run.Config) {

	if config.Plugins == nil {
		log.Fatalf("config plugins map should not be nil")
	}
	pluginConfigs, err := catalog.PluginConfigsFromHCL(*config.Plugins)
	if err != nil {
		log.Fatalf("Unable to parse plugin HCL: %v", err)
	}

	fmt.Println("Plugin Info")
	for _, pc := range pluginConfigs {
		fmt.Printf("%v Plugin: %v\n", pc.Type, pc.Name)
		fmt.Printf("Data: %v\n\n", pc.Data)
	}

	fmt.Println("\n\n")
	fmt.Println("Server Info")
	s, _ := json.MarshalIndent(config.Server, "", "\t")
	fmt.Println(string(s))
}

func RunSpireApi(config *run.Config) {
	spireBin := "/opt/spire/bin/spire-server"
	var args []string

	apiArgs := os.Args[3:]

	for _, check := range checkList {
		if err := check(apiArgs); err != nil {
			log.Fatal(err)
		}
	}

	args = append(args, apiArgs...)
	args = append(args, []string{"-registrationUDSPath", config.Server.RegistrationUDSPath}...)
	cmd := exec.Command(spireBin, args...)
	stdoutStderr, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("%s\n", stdoutStderr)
		log.Fatal(err)
	}
	fmt.Printf("%s\n", stdoutStderr)
}

// Policies
type checkFn func([]string) error

func denyTokenGenerate(args []string) error {
	if len(args) < 2 {
		return nil
	}

	if args[0] == "token" {
		return errors.New("Join token usage disabled for security reasons")
	}

	return nil
}

func noAdmin(args []string) error {
	for _, a := range args {
		if a == "-admin" {
			return errors.New("Not allowed to create -admin entries")
		}
	}

	return nil
}

var checkList []checkFn = []checkFn{
	denyTokenGenerate,
	noAdmin,
}
