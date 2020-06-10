/*
 * Copyright (c) 2020  InterDigital Communications, Inc
 *
 * Licensed under the Apache License, Version 2.0 (the \"License\");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an \"AS IS\" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * AdvantEDGE GIS Engine REST API
 *
 * This API allows to control geo-spatial behavior and simulation. <p>**Micro-service**<br>[meep-gis-engine](https://github.com/InterDigitalInc/AdvantEDGE/tree/master/go-apps/meep-gis-engine) <p>**Type & Usage**<br>Platform runtime interface to control geo-spatial behavior and simulation <p>**Details**<br>API details available at _your-AdvantEDGE-ip-address/api_
 *
 * API version: 1.0.0
 * Contact: AdvantEDGE@InterDigital.com
 * Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 */

package server

// List of geospatial data
type GeoDataAsset struct {
	Location *Point `json:"location,omitempty"`

	// Optional - Radius (in meters) around the location
	Radius float32 `json:"radius,omitempty"`

	Path *LineString `json:"path,omitempty"`

	// End-of-Path mode: <li>LOOP: When path endpoint is reached, start over from the beginning <li>REVERSE: When path endpoint is reached, return on the reverse path
	EopMode string `json:"eopMode,omitempty"`

	// Speed of movement along path in m/s
	Velocity float32 `json:"velocity,omitempty"`

	// Name of geospatial asset
	AssetName string `json:"assetName,omitempty"`
}
