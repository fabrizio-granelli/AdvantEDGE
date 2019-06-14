/*
 * MEEP Location Service - Notification Callback
 *
 * This is MEEP Location Services Notification Callback API
 *
 * API version: 0.0.0
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */

package client
// OperationStatus : The operation status of the access point
type OperationStatus string

// List of OperationStatus
const (
	SERVICEABLE_OperationStatus OperationStatus = "Serviceable"
	UNSERVICEABLE_OperationStatus OperationStatus = "Unserviceable"
	UNKNOWN_OperationStatus OperationStatus = "Unknown"
)
