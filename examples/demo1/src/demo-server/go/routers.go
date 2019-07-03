/*
 * MEEP Demo App API
 *
 * This is the MEEP Demo App API
 *
 * API version: 0.0.1
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */

package server

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

type Route struct {
	Name        string
	Method      string
	Pattern     string
	HandlerFunc http.HandlerFunc
}

type Routes []Route

func NewRouter() *mux.Router {
	router := mux.NewRouter().StrictSlash(true)
	for _, route := range routes {
		var handler http.Handler
		handler = route.HandlerFunc
		handler = Logger(handler, route.Name)

		router.
			Methods(route.Method).
			Path(route.Pattern).
			Name(route.Name).
			Handler(handler)
	}

	router.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("./static/"))))

	return router
}

func Index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World!")
}

var routes = Routes{
	Route{
		"Index",
		"GET",
		"/v1/",
		Index,
	},

	Route{
		"GetEdgeInfo",
		strings.ToUpper("Get"),
		"/v1/edge-app",
		GetEdgeInfo,
	},

	Route{
		"RcvTrackingNotification",
		strings.ToUpper("Post"),
		"/v1/location_notifications/{subscriptionId}",
		RcvTrackingNotification,
	},

	Route{
		"HandleEvent",
		strings.ToUpper("Post"),
		"/v1/mg/event",
		HandleEvent,
	},

	Route{
		"GetUeLocation",
		strings.ToUpper("Get"),
		"/v1/location/{ueId}",
		GetUeLocation,
	},

	Route{
		"CreateUeState",
		strings.ToUpper("Post"),
		"/v1/ue/{ueId}",
		CreateUeState,
	},

	Route{
		"DeleteUeState",
		strings.ToUpper("Delete"),
		"/v1/ue/{ueId}",
		DeleteUeState,
	},

	Route{
		"GetUeState",
		strings.ToUpper("Get"),
		"/v1/ue/{ueId}",
		GetUeState,
	},

	Route{
		"UpdateUeState",
		strings.ToUpper("Put"),
		"/v1/ue/{ueId}",
		UpdateUeState,
	},
}
