/*
 * Copyright (c) 2019  InterDigital Communications, Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package cmd

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"

	"github.com/InterDigitalInc/AdvantEDGE/go-apps/meepctl/utils"

	"github.com/roymx/viper"
	"github.com/spf13/cobra"
)

type DeployData struct {
	codecov  bool
	gitdir   string
	workdir  string
	registry string
	tag      string
	coreApps []string
	depApps  []string
}

const deployDesc = `Deploy containers on the K8s cluster

AdvantEDGE is composed of a collection of micro-services (a.k.a the groups).

Deploy command starts a group of containers the in the K8s cluster.
Optional registry & tag parameters allows to specify a shared registry & tag for core images.
Default registry is configured in ~/.meepctl.yaml.
Defaut tag is: latest`

const deployExample = `  # Deploy AdvantEDGE dependencies
  meepctl deploy dep
  # Delete and re-deploy only AdvantEDGE core containers
  meepctl deploy core --force
  # Deploy AdvantEDGE version 1.0.0 from my.registry.com
  meepctl deploy core --registry my.registry.com --tag 1.0.0`

// deployCmd represents the deploy command
var deployCmd = &cobra.Command{
	Use:       "deploy <group>",
	Short:     "Deploy containers on the K8s cluster",
	Long:      deployDesc,
	Example:   deployExample,
	Args:      cobra.ExactValidArgs(1),
	ValidArgs: nil,
	Run:       deployRun,
}

var deployData DeployData

func init() {
	// Get targets from repo config file
	deployData.coreApps = utils.GetTargets("repo.core.go-apps", "deploy")
	deployData.depApps = utils.GetTargets("repo.dep", "deploy")

	// Configure the list of valid arguments
	deployCmd.ValidArgs = []string{"dep", "core"}

	// Add list of arguments to Example usage
	deployCmd.Example += "\n\nValid Targets:"
	for _, arg := range deployCmd.ValidArgs {
		deployCmd.Example += "\n  * " + arg
	}

	// Set deploy-specific flags
	deployCmd.Flags().BoolP("force", "f", false, "Deployed components are deleted and deployed")
	deployCmd.Flags().BoolVar(&deployData.codecov, "codecov", false, "Use when deploying code coverage binaries (dev. option)")
	deployCmd.Flags().StringP("registry", "r", "", "Override registry from config file")
	deployCmd.Flags().StringP("tag", "", "latest", "Repo tag to use")

	// Add command
	rootCmd.AddCommand(deployCmd)
}

func deployRun(cmd *cobra.Command, args []string) {
	if !utils.ConfigValidate("") {
		fmt.Println("Fix configuration issues")
		return
	}

	group := args[0]
	deployData.registry, _ = cmd.Flags().GetString("registry")
	deployData.tag, _ = cmd.Flags().GetString("tag")
	f, _ := cmd.Flags().GetBool("force")
	v, _ := cmd.Flags().GetBool("verbose")
	t, _ := cmd.Flags().GetBool("time")
	if v {
		fmt.Println("Deploy called")
		fmt.Println("[arg]  group:", group)
		fmt.Println("[arg]  registry:", deployData.registry)
		fmt.Println("[arg]  tag:", deployData.tag)
		fmt.Println("[flag] force:", f)
		fmt.Println("[flag] verbose:", v)
		fmt.Println("[flag] time:", t)
	}

	start := time.Now()

	// Retrieve registry from config file if not already set
	if deployData.registry == "" {
		deployData.registry = viper.GetString("meep.registry")
	}
	deployData.registry = strings.TrimSuffix(deployData.registry, "/")
	fmt.Println("Using docker registry:", deployData.registry)

	// Get config
	deployData.gitdir = strings.TrimSuffix(viper.GetString("meep.gitdir"), "/")
	deployData.workdir = strings.TrimSuffix(viper.GetString("meep.workdir"), "/")

	// Ensure local storage
	deployEnsureStorage(cmd)

	// Deploy microservices
	if group == "core" {
		deployCore(cmd)
	} else if group == "dep" {
		deployDep(cmd)
	}

	elapsed := time.Since(start)
	if t {
		fmt.Println("Took ", elapsed.Round(time.Millisecond).String())
	}
}

func deployEnsureStorage(cobraCmd *cobra.Command) {

	// Local storage structure
	cmd := exec.Command("mkdir", "-p", deployData.workdir)
	cmd.Args = append(cmd.Args, deployData.workdir+"/certs")
	cmd.Args = append(cmd.Args, deployData.workdir+"/couchdb")
	cmd.Args = append(cmd.Args, deployData.workdir+"/docker-registry")
	cmd.Args = append(cmd.Args, deployData.workdir+"/grafana")
	cmd.Args = append(cmd.Args, deployData.workdir+"/influxdb")
	cmd.Args = append(cmd.Args, deployData.workdir+"/tmp")
	cmd.Args = append(cmd.Args, deployData.workdir+"/virt-engine")
	cmd.Args = append(cmd.Args, deployData.workdir+"/omt")
	cmd.Args = append(cmd.Args, deployData.workdir+"/postgis")
	_, err := utils.ExecuteCmd(cmd, cobraCmd)
	if err != nil {
		err = errors.New("Error creating path [" + deployData.workdir + "]")
		fmt.Println(err)
	}
}

// Deploy core
func deployCore(cobraCmd *cobra.Command) {
	// Code coverage storage
	deployCodeCovStorage(cobraCmd)

	for _, app := range deployData.coreApps {
		chart := deployData.gitdir + "/" + utils.RepoCfg.GetString("repo.core.go-apps."+app+".chart")
		codecov := utils.RepoCfg.GetBool("repo.core.go-apps." + app + ".codecov")
		userFe := utils.RepoCfg.GetBool("repo.deployment.user.frontend")
		userSwagger := utils.RepoCfg.GetBool("repo.deployment.user.swagger")
		altServer := utils.RepoCfg.GetBool("repo.deployment.alt-server")
		flags := deployRunScriptsAndGetFlags(app, chart, cobraCmd)

		// Set core flags
		coreFlags := utils.HelmFlags(flags, "--set", "image.repository="+deployData.registry+"/"+app)
		coreFlags = utils.HelmFlags(coreFlags, "--set", "image.tag="+deployData.tag)
		if deployData.codecov && codecov {
			coreFlags = utils.HelmFlags(coreFlags, "--set", "codecov.enabled=true")
			coreFlags = utils.HelmFlags(coreFlags, "--set", "codecov.location="+deployData.workdir+"/codecov/"+app)
		}
		if userFe {
			coreFlags = utils.HelmFlags(coreFlags, "--set", "user.frontend.enabled=true")
			coreFlags = utils.HelmFlags(coreFlags, "--set", "user.frontend.location="+deployData.workdir+"/user/frontend")
		}
		if userSwagger {
			// deployment level flag - not all apps use it
			coreFlags = utils.HelmFlags(coreFlags, "--set", "user.swagger.enabled=true")
			coreFlags = utils.HelmFlags(coreFlags, "--set", "user.swagger.location="+deployData.workdir+"/user/swagger")
		}
		if altServer {
			// deployment level flag - not all apps use it
			coreFlags = utils.HelmFlags(coreFlags, "--set", "altService.enabled=true")
			coreFlags = utils.HelmFlags(coreFlags, "--set", "altIngress.enabled=true")
		}

		k8sDeploy(app, chart, coreFlags, cobraCmd)
	}
}

// Deploy dependencies
func deployDep(cobraCmd *cobra.Command) {
	altServer := utils.RepoCfg.GetBool("repo.deployment.alt-server")
	for _, app := range deployData.depApps {
		// exception
		if app == "meep-alt-ingress" && !altServer {
			continue
		}

		chart := deployData.gitdir + "/" + utils.RepoCfg.GetString("repo.dep."+app+".chart")
		flags := deployRunScriptsAndGetFlags(app, chart, cobraCmd)
		k8sDeploy(app, chart, flags, cobraCmd)
	}
}

func deployRunScriptsAndGetFlags(targetName string, chart string, cobraCmd *cobra.Command) [][]string {
	var flags [][]string

	nodeIp := viper.GetString("node.ip")
	userValueDir := deployData.workdir + "/user/values"

	userValueFile := userValueDir + "/" + targetName + ".yaml"
	if _, err := os.Stat(userValueFile); err == nil {
		// path/to/file exists
		// Note: according to https://helm.sh/docs/chart_template_guide/values_files/
		//       the order of precedence is: (lowest) default values.yaml
		//                                            then user value file
		//                                            then individual --set params (highest)
		//       Therefore, the --set flags inserted by meepctl may interfere with user overrides
		flags = utils.HelmFlags(flags, "-f", userValueFile)
	}

	switch targetName {
	case "meep-couchdb":
		flags = utils.HelmFlags(flags, "--set", "persistentVolume.location="+deployData.workdir+"/couchdb/")
	case "meep-open-map-tiles":
		deploySetOmtConfig(chart, cobraCmd)
		flags = utils.HelmFlags(flags, "--set", "persistentVolume.location="+deployData.workdir+"/omt/")
		altServer := utils.RepoCfg.GetBool("repo.deployment.alt-server")
		flags = utils.HelmFlags(flags, "--set", "altIngress.enabled="+strconv.FormatBool(altServer))
	case "meep-postgis":
		flags = utils.HelmFlags(flags, "--set", "persistence.location="+deployData.workdir+"/postgis/")
	case "meep-docker-registry":
		deployCreateRegistryCerts(chart, cobraCmd)
		flags = utils.HelmFlags(flags, "--set", "persistence.location="+deployData.workdir+"/docker-registry/")
	case "meep-grafana":
		deploySetGrafanaValues(chart, cobraCmd)
		flags = utils.HelmFlags(flags, "--set", "persistentVolume.location="+deployData.workdir+"/grafana/")
		flags = utils.HelmFlags(flags, "--values", deployData.workdir+"/tmp/grafana-values.yaml")
		altServer := utils.RepoCfg.GetBool("repo.deployment.alt-server")
		flags = utils.HelmFlags(flags, "--set", "altIngress.enabled="+strconv.FormatBool(altServer))
	case "meep-influxdb":
		flags = utils.HelmFlags(flags, "--set", "persistence.location="+deployData.workdir+"/influxdb/")
	case "meep-ingress":
		deployCreateIngressCerts(chart, cobraCmd)
		httpPort, httpsPort := deployGetPorts()
		// NOTE: here port!=80 means that NodePort is used
		// TODO: make the condition clearer & don't rely on port 80 value
		if httpPort != "80" {
			flags = utils.HelmFlags(flags, "--set", "controller.hostNetwork=false")
			flags = utils.HelmFlags(flags, "--set", "controller.dnsPolicy=ClusterFirst")
			flags = utils.HelmFlags(flags, "--set", "controller.daemonset.useHostPort=false")
			flags = utils.HelmFlags(flags, "--set", "controller.service.type=NodePort")
			flags = utils.HelmFlags(flags, "--set", "controller.service.nodePorts.http="+httpPort)
			flags = utils.HelmFlags(flags, "--set", "controller.service.nodePorts.https="+httpsPort)
		}
	case "meep-alt-ingress":
		values := deployData.gitdir + "/" + utils.RepoCfg.GetString("repo.dep."+targetName+".values")
		flags = utils.HelmFlags(flags, "--values", values)
	case "meep-mon-engine":
		monEngineTarget := "repo.core.go-apps.meep-mon-engine"
		flags = utils.HelmFlags(flags, "--set", "image.env.MEEP_DEPENDENCY_PODS="+getPodList(monEngineTarget+".dependency-pods"))
		flags = utils.HelmFlags(flags, "--set", "image.env.MEEP_CORE_PODS="+getPodList(monEngineTarget+".core-pods"))
		flags = utils.HelmFlags(flags, "--set", "image.env.MEEP_SANDBOX_PODS="+getPodList(monEngineTarget+".sandbox-pods"))
	case "meep-virt-engine":
		virtEngineTarget := "repo.core.go-apps.meep-virt-engine"
		flags = utils.HelmFlags(flags, "--set", "persistence.location="+deployData.workdir+"/virt-engine")
		flags = utils.HelmFlags(flags, "--set", "user.values.location="+deployData.workdir+"/user/values")
		flags = utils.HelmFlags(flags, "--set", "image.env.MEEP_SANDBOX_PODS="+getPodList(virtEngineTarget+".sandbox-pods"))
		flags = utils.HelmFlags(flags, "--set", "image.env.MEEP_HOST_URL=http://"+nodeIp)
		altServer := utils.RepoCfg.GetBool("repo.deployment.alt-server")
		flags = utils.HelmFlags(flags, "--set", "image.env.MEEP_ALT_SERVER=\""+strconv.FormatBool(altServer)+"\"")
	case "meep-webhook":
		cert, key, cabundle := deployCreateWebhookCerts(chart, cobraCmd)
		flags = utils.HelmFlags(flags, "--set", "sidecar.image.repository="+deployData.registry+"/meep-tc-sidecar")
		flags = utils.HelmFlags(flags, "--set", "sidecar.image.tag="+deployData.tag)
		flags = utils.HelmFlags(flags, "--set", "webhook.cert="+cert)
		flags = utils.HelmFlags(flags, "--set", "webhook.key="+key)
		flags = utils.HelmFlags(flags, "--set", "webhook.cabundle="+cabundle)
	}

	return flags
}

func k8sDeploy(app string, chart string, flags [][]string, cobraCmd *cobra.Command) {
	force, _ := cobraCmd.Flags().GetBool("force")

	// If release exist && --force, delete
	exist, _ := utils.IsHelmRelease(app, cobraCmd)
	if exist {
		if force {
			_ = utils.HelmDelete(app, cobraCmd)
		} else {
			fmt.Println("Skipping " + app + ": already deployed -- use [-f, --force] flag to force deployment")
			return
		}
	}

	// Deploy
	_ = utils.HelmInstall(app, chart, flags, cobraCmd)
}

func deployCodeCovStorage(cobraCmd *cobra.Command) {
	cmd := exec.Command("rm", "-rf", deployData.workdir+"/codecov-bak")
	_, _ = utils.ExecuteCmd(cmd, cobraCmd)
	cmd = exec.Command("mv", deployData.workdir+"/codecov", deployData.workdir+"/codecov-bak")
	_, _ = utils.ExecuteCmd(cmd, cobraCmd)
	cmd = exec.Command("mkdir", "-p", deployData.workdir+"/codecov")
	_, _ = utils.ExecuteCmd(cmd, cobraCmd)

	for _, app := range deployData.coreApps {
		if utils.RepoCfg.GetBool("repo.core.go-apps." + app + ".codecov") {
			cmd = exec.Command("mkdir", "-p", deployData.workdir+"/codecov/"+app)
			_, _ = utils.ExecuteCmd(cmd, cobraCmd)
		}
	}
}

func deployCreateWebhookCerts(chart string, cobraCmd *cobra.Command) (string, string, string) {
	certdir := deployData.workdir + "/certs"
	cmd := exec.Command("sh", "-c", chart+"/create-k8s-ca-signed-cert.sh --certdir "+certdir)
	_, _ = utils.ExecuteCmd(cmd, cobraCmd)
	cmd = exec.Command("sh", "-c", "cat "+certdir+"/server-cert.pem | base64 -w0")
	cert, _ := utils.ExecuteCmd(cmd, cobraCmd)
	cmd = exec.Command("sh", "-c", "cat "+certdir+"/server-key.pem | base64 -w0")
	key, _ := utils.ExecuteCmd(cmd, cobraCmd)
	cmd = exec.Command("kubectl", "config", "view", "--raw", "--minify", "--flatten",
		"-o=jsonpath='{.clusters[].cluster.certificate-authority-data}'")
	cabundle, _ := utils.ExecuteCmd(cmd, cobraCmd)
	return cert, key, cabundle
}

func deployCreateRegistryCerts(chart string, cobraCmd *cobra.Command) {
	certdir := deployData.workdir + "/certs"
	cmd := exec.Command("sh", "-c", chart+"/create-k8s-ca-signed-cert.sh --certdir "+certdir)
	_, _ = utils.ExecuteCmd(cmd, cobraCmd)
}

func deployCreateIngressCerts(chart string, cobraCmd *cobra.Command) {
	certdir := deployData.workdir + "/certs"
	cmd := exec.Command("sh", "-c", chart+"/create-self-signed-cert.sh --certdir "+certdir)
	_, _ = utils.ExecuteCmd(cmd, cobraCmd)
}

func deploySetGrafanaValues(chart string, cobraCmd *cobra.Command) {
	nodeIp := viper.GetString("node.ip")
	valuesGrafana := chart + "/values.yaml"
	tmpdir := deployData.workdir + "/tmp"

	cmd := exec.Command("mkdir", "-p", tmpdir)
	_, _ = utils.ExecuteCmd(cmd, cobraCmd)
	cmd = exec.Command("cp", valuesGrafana, tmpdir+"/grafana-values.yaml")
	_, _ = utils.ExecuteCmd(cmd, cobraCmd)
	str := "s/<CLUSTERIP>/" + nodeIp + "/g"
	cmd = exec.Command("sed", "-i", str, tmpdir+"/grafana-values.yaml")
	_, _ = utils.ExecuteCmd(cmd, cobraCmd)
}

func deploySetOmtConfig(chart string, cobraCmd *cobra.Command) {
	configOmt := chart + "/config.json"
	cmd := exec.Command("cp", configOmt, deployData.workdir+"/omt/config.json")
	_, _ = utils.ExecuteCmd(cmd, cobraCmd)
}

func deployGetPorts() (string, string) {
	ports := viper.GetString("meep.ports")
	p := strings.Split(ports, "/")
	return p[0], p[1]
}

func getPodList(target string) string {
	podListStr := ""
	podList := utils.RepoCfg.GetStringSlice(target)
	for _, pod := range podList {
		if podListStr != "" {
			podListStr += "\\,"
		}
		podListStr += pod
	}
	return podListStr
}
