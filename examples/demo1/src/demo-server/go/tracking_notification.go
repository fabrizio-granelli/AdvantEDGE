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
	"time"
)

// Zonal or User tracking notification - callback generated toward an ME app with a zonal or user tracking subscription
type TrackingNotification struct {

	// CallBackData if passed by the application during the associated Subscription (Zone or User Tracking) operation
	CallbackData string `json:"callbackData"`

	// Unique Identifier of a Location Zone
	ZoneId string `json:"zoneId,omitempty"`

	// Address of the user or device based on the connected access point - address = acr:<UE IP address>
	Address string `json:"address,omitempty"`

	// Details about the access point, geographical position, industry, etc.
	InterestRealm string `json:"interestRealm,omitempty"`

	UserEventType *UserEventType `json:"userEventType,omitempty"`

	// Unique identifier of a point of access
	CurrentAccessPointId string `json:"currentAccessPointId,omitempty"`

	// Unique identifier of a point of access
	PreviousAccessPointId string `json:"previousAccessPointId,omitempty"`

	// Indicates the time of day for zonal presence notification.
	Timestamp time.Time `json:"timestamp,omitempty"`
}