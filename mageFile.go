// +build mage

package main

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"github.com/magefile/mage/mg" // mg contains helpful utility functions, like Deps
	"github.com/magefile/mage/sh" // mg contains helpful utility functions, like Deps
)

// Default target to run when none is specified
// If not set, running mage will list available targets
// var Default = Build

//  ============================== Production Deploy Scripts ============================== //

// *Only Command needed to prep for deployment
// Will install all packages, run the build for both backend and client and start
// both backend api's with pm2 plus reload caddy
func DeployProd() {
	fmt.Println("Starting Prod!")
	mg.Deps(StopProd)
	mg.Deps(Clean)
	mg.Deps(StartProd)
}

func StartProd() error {
	var err error
	// Check node version
	mg.Deps(CheckNVM)

	// !ORDER IMPORTANT FOR INSTALL CLIENT AND BACKEND
	// install client
	mg.Deps(InstallClient)

	// install backend
	mg.Deps(InstallBackend)

	// Build Client
	mg.Deps(BuildClient)

	// Build Backend
	mg.Deps(BuildBackend)

	// Post Build Steps
	mg.Deps(PostBuild)

	fmt.Println("Starting up Production...")
	os.Chdir("./backend")
	// err = sh.Run("pm2", "start", "npm", "--name", "'prod1'", "--", "run", "start")
	err = sh.Run("pm2 start npm --name 'prod1' -- run start")
	err = sh.Run("pm2 start npm --name 'prod2' -- run start1")
	// err = sh.Run("pm2", "start", "npm", "--name", "'prod2'", "--", "run", "start1")
	specialFmtForFrontend := fmt.Sprintf("frontend")
	os.Chdir("../client")
	err = sh.Run("pm2", "start", "npm", "--name", specialFmtForFrontend, "--", "run", "start")
	fmt.Println("Reloading Caddy...")
	err = sh.Run("caddy", "run", "--config", "../Caddyfile.prod")
	defer os.Chdir("..")
	return err
}

// *Stops and removes pm2 processes and stops caddy
func StopProd() error {
	var err error
	fmt.Println("Stopping and deleting pm2 processes")
	err = sh.Run("pm2", "stop", "all")
	err = sh.Run("pm2", "delete", "all")
	err = sh.Run("caddy", "stop")
	return err
}

// *Remove all node_modules from backend and client and removes build dirs and dist dirs
func Clean() error {
	var err error
	fmt.Println("Cleaning...")
	fmt.Println("deleteing all node_modules and build dir from client...")
	os.Chdir("./client")
	err = sh.Run("rm", "-rf", "node_modules")
	err = sh.Run("rm", "-rf", "build")
	os.Chdir("../backend")
	fmt.Println("deleteing all node_modules and dist dir from backend...")
	err = sh.Run("rm", "-rf", "node_modules")
	err = sh.Run("rm", "-rf", "dist")
	defer os.Chdir("..")
	return err
}

//  ============================== Testing Server No Load Balaqncer Scripts ============================== //

// Deploy Testing (must type name of server after command)
func DeployTesting() {
	server := os.Args[2]
	// fmt.Println("server: ", server)
	// fmt.Println("Deploying Code to Merlin Test Server")
	fmt.Printf("Deploying Code to %v Test Server", server)
	mg.Deps(StopTesting)
	mg.Deps(Clean)
	mg.Deps(ServerStart(server))
}

// Start Testing Server (must type name of server after command)
func ServerStart(server string) error {
	var err error
	msg := fmt.Sprintf("Starting %v Test Server", server)
	fmt.Println(msg)

	// Check node version
	mg.Deps(CheckNVM)

	// !ORDER IMPORTANT FOR INSTALL CLIENT AND BACKEND
	// install client
	mg.Deps(InstallClient)

	// install backend
	mg.Deps(InstallBackend)

	// Build Client
	mg.Deps(BuildClient)

	// Build Backend
	mg.Deps(BuildBackend)

	// Post Build Steps
	mg.Deps(PostBuild)

	// fmt.Println("Starting up Merlin Test Server...")
	fmt.Printf("Starting up %v Test Server...", server)
	os.Chdir("./backend")
	// err = sh.Run("pm2", "start", "npm", "--name", "'Merlin'", "--", "run", "start")
	specialFmt := fmt.Sprintf("'" + server + "'")
	// err = sh.Run("pm2", "start", "npm", "--name", specialFmt, "--", "run", "start")
	err = sh.Run("pm2 start npm --name 'prod' -- run start")
	specialFmtForFrontend := fmt.Sprintf("frontend")
	os.Chdir("../client")
	err = sh.Run("pm2", "start", "npm", "--name", specialFmtForFrontend, "--", "run", "start")
	fmt.Println("Reloading Caddy...")
	fileName := fmt.Sprintf("../Caddyfile.%v", server)
	// err = sh.Run("caddy", "run", "--config", "./Caddyfile.merlin")
	err = sh.Run("caddy", "run", "--config", fileName)
	defer os.Chdir("..")
	return err
}

func StopTesting() error {
	var err error
	fmt.Println("Stopping and deleting pm2 processes")
	err = sh.Run("pm2", "stop", "all")
	err = sh.Run("pm2", "delete", "all")
	err = sh.Run("caddy", "stop")
	return err
}

// Rebuild front and backend, with no installs
func RebuildBoth() error {
	var err error
	mg.Deps(RebuildFrontend)
	mg.Deps(RebuildBackend)
	return err
}

// Rebuilds frontend when there are changes to just frontend
// (!no installs happen here)
func RebuildFrontend() error {
	var err error
	fmt.Println("Rebuilding Frontend")

	mg.Deps(CheckNVM)

	// Build Client
	mg.Deps(BuildClient)
	// Post Build Steps
	mg.Deps(PostBuild)

	fmt.Println("Finished Rebuilding Frontend")
	return err
}

// Rebuilds only backend when there are changes to just backend
// (!no installs happen here)
func RebuildBackend() error {
	var err error
	fmt.Println("Rebuilding Backend")
	mg.Deps(CheckNVM)

	// Build Backend
	mg.Deps(BuildBackend)

	// Post Build Steps
	mg.Deps(PostBuild)

	fmt.Println("Finished Rebuilding Backend")
	return err
}

//  ============================== Dependency Funcs ============================== //

// runs and displays your node version. insert it without the v for now, will
// stop if it's not a match with the .nvmrc
func CheckNVM() error {
	rescueStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	sh.Run("node", "-v") // print node version to console
	w.Close()
	out, _ := ioutil.ReadAll(r)
	os.Stdout = rescueStdout

	input := string(out[1:])                // remove the v
	input = strings.TrimSuffix(input, "\n") // remove the \n so the bytes are a match further down

	b, err := ioutil.ReadFile(".nvmrc")
	if err != nil {
		fmt.Println("err reading .nvmrc", err)
		return err
	}
	str := string(b)
	fmt.Println("Checking Node Version for match with .nvmrc", str+"=="+input+"?")

	if str != input {
		fmt.Println("You need to change your node version before continuing...")
		return errors.New("Cancel!")
	}
	return err
}

// install npm packages for client
func InstallClient() error {
	fmt.Println("Installing packages for client...")
	var err error
	os.Chdir("./client")
	defer os.Chdir("..")
	err = sh.Run("npm", "install")
	return err
}

// Install Backend npm packages
func InstallBackend() error {
	var err error
	fmt.Println("Installing packages for backend...")
	os.Chdir("./backend")
	defer os.Chdir("..")
	err = sh.Run("npm", "install")
	return err
}

// build client
func BuildClient() error {
	fmt.Println("running npm run build for client...")
	os.Chdir("./client")
	defer os.Chdir("..")
	err := sh.Run("npm", "run", "build")
	return err
}

// build backend
func BuildBackend() error {
	fmt.Println("running npm run build for backend...")
	os.Chdir("./backend")
	defer os.Chdir("..")
	err := sh.Run("npm", "run", "build")
	return err
}

// Moves types and .env files for deployement
func PostBuild() error {
	var err error
	fmt.Println("running postBuild step... moving dirs around to prep for deployment...")
	err = sh.Run("cp", "-r", "./backend/graphql/types/", "./backend/dist/graphql/")
	err = sh.Run("cp", "-r", "./backend/.env", "./backend/dist")
	return err
}

// *************************** DEVELOPMENT COMMANDS ***************************

// Start BE Dev Server...
func BEDev() error {
	// mg.Deps(PostBuild)
	fmt.Println("Starting up Backend Development...")
	os.Chdir("./backend")
	defer os.Chdir("..")
	err := sh.Run("npm", "run", "dev")
	return err
}

// Start FE Dev Server...
func FEDev() error {
	// mg.Deps(PostBuild)
	fmt.Println("Starting up Frontend Development...")
	os.Chdir("./client")
	defer os.Chdir("..")
	err := sh.Run("npm", "start")
	return err
}

// add library to frontend
func AddFE() {
	args := os.Args[2:]
	fmt.Println("Install to FE")
	os.Chdir("./client")
	defer os.Chdir("..")
	for _, p := range args {
		fmt.Println("p", p)
		sh.Run("npm", "install", "--save", p)
	}
}

// add library to frontend dev dep
func AddDFE() {
	args := os.Args[2:]
	fmt.Println("Install to FE")
	os.Chdir("./client")
	defer os.Chdir("..")
	for _, p := range args {
		fmt.Println("p", p)
		sh.Run("npm", "install", "--save-dev", p)
	}
}

// add library to backend
func AddBE() {
	args := os.Args[2:]
	fmt.Println("Install to BE")
	os.Chdir("./backend")
	defer os.Chdir("..")
	for _, p := range args {
		sh.Run("npm", "install", "--save", p)
	}
}

// add library to backend dev dep
func AddDBE() {
	args := os.Args[2:]
	fmt.Println("Install to BE")
	os.Chdir("./backend")
	defer os.Chdir("..")
	for _, p := range args {
		sh.Run("npm", "install", "--save-dev", p)
	}
}
