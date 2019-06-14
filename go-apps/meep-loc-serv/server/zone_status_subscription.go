/*
 * Location API
 *
 * The ETSI MEC ISG MEC012 Location API described using OpenAPI. The API is based on the Open Mobile Alliance's specification RESTful Network API for Zonal Presence
 *
 * API version: 1.1.1
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */

package server

// A type containing zone status subscription.
type ZoneStatusSubscription struct {
	ClientCorrelator string `json:"clientCorrelator,omitempty"`

	ResourceURL string `json:"resourceURL,omitempty"`

	CallbackReference CallbackReference `json:"callbackReference"`

	ZoneId string `json:"zoneId"`

	NumberOfUsersZoneThreshold uint32 `json:"numberOfUsersZoneThreshold,omitempty"`

	NumberOfUsersAPThreshold uint32 `json:"numberOfUsersAPThreshold,omitempty"`

	// List of operation status values to generate notifications for (these apply to all access points within a zone).
	OperationStatus []OperationStatus `json:"operationStatus,omitempty"`
}
