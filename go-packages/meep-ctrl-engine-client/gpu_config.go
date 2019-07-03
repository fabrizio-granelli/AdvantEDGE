/*
 * MEEP Controller REST API
 *
 * Copyright (c) 2019 InterDigital Communications, Inc. All rights reserved. The information provided herein is the proprietary and confidential information of InterDigital Communications, Inc.
 *
 * API version: 1.0.0
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */

package client

// GPU configuration object
type GpuConfig struct {

	// Requested GPU type
	Type_ string `json:"type,omitempty"`

	// Number of GPUs requested
	Count int32 `json:"count,omitempty"`
}
