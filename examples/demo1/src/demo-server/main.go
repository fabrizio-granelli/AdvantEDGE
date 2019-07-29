/*
 * MEEP Demo App API
 *
 * This is the MEEP Demo App API
 *
 * API version: 0.0.1
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */

package main

import (
        sw "github.com/InterDigitalInc/AdvantEDGE/demoserver/go"
        "net/http"
	"log"
        "github.com/gorilla/handlers"
	"io/ioutil"
	"os"
	"strings"

	locServClient "github.com/InterDigitalInc/AdvantEDGE/locservapi"

)

var locServ *locServClient.APIClient

func init() {
        // Initialize App
        sw.Init()
}

func main() {
        log.Printf("DemoSvc App API Server started")

        router := sw.NewRouter()

        methods := handlers.AllowedMethods([]string{"OPTIONS", "DELETE", "GET", "HEAD", "POST", "PUT"})
        header := handlers.AllowedHeaders([]string{"content-type"})

	registerLocServ("ue2-ext")
	registerLocServ("ue1")

        http.ListenAndServe(":80", handlers.CORS(methods, header)(router))
}

func registerLocServ(ue string) {
	locServCfg := locServClient.NewConfiguration()
        locServCfg.BasePath = "http://meep-loc-serv/etsi-013/location/v1"

	locServ := locServClient.NewAPIClient(locServCfg)
	log.Printf("Created Location Service client before")

        if locServ == nil {
                log.Printf("Cannot find the Location Service API")
                return 
        }
        log.Printf("Created Location Service client")

	var subscription locServClient.UserTrackingSubscription
	subscription.ClientCorrelator = "001" //don't care
	subscription.Address = ue
	var userCriteria []locServClient.UserEventType
	userCriteria = append(userCriteria, "Entering")
	userCriteria = append(userCriteria, "Transferring")
	subscription.UserEventCriteria = userCriteria

        serviceName := os.Getenv("MGM_APP_ID")
        newString := strings.ToUpper(serviceName) + "_SERVICE_HOST"
        newString = strings.Replace(newString, "-", "_", -1)

        myPodIp := os.Getenv(newString)
	var cb locServClient.UserTrackingSubscriptionCallbackReference
	cb.NotifyURL = "http://" + myPodIp + "/v1"
	subscription.CallbackReference = &cb

	_, resp, err := locServ.SubscriptionsApi.UserTrackingSubPost(nil, subscription)
        if err != nil {
                log.Printf(err.Error())
        }
	defer resp.Body.Close()
	if resp != nil {
		if resp.StatusCode != http.StatusOK {
			log.Printf("Not OK status response")
		}		
		responseData, err := ioutil.ReadAll(resp.Body)
		
		if err == nil {
			responseString := string(responseData)
			log.Printf(responseString)
		} else {
			log.Printf("response decoding error, %s", err)
		}
		
        }

}
