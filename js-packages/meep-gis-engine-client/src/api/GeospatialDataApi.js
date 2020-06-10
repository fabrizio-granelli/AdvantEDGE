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
 * This API allows to control geo-spatial behavior and simulation. <p>**Micro-service**<br>[meep-gis-engine](https://github.com/InterDigitalInc/AdvantEDGE/tree/master/go-apps/meep-gis-engine) <p>**Type & Usage**<br>Platform runtime interface to control geo-spatial behavior and simulation <p>**Details**<br>API details available at _your-AdvantEDGE-ip-address/api_
 *
 * OpenAPI spec version: 1.0.0
 * Contact: AdvantEDGE@InterDigital.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.4.9
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/GeoDataAsset', 'model/GeoDataAssetList'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/GeoDataAsset'), require('../model/GeoDataAssetList'));
  } else {
    // Browser globals (root is window)
    if (!root.AdvantEdgeGisEngineRestApi) {
      root.AdvantEdgeGisEngineRestApi = {};
    }
    root.AdvantEdgeGisEngineRestApi.GeospatialDataApi = factory(root.AdvantEdgeGisEngineRestApi.ApiClient, root.AdvantEdgeGisEngineRestApi.GeoDataAsset, root.AdvantEdgeGisEngineRestApi.GeoDataAssetList);
  }
}(this, function(ApiClient, GeoDataAsset, GeoDataAssetList) {
  'use strict';

  /**
   * GeospatialData service.
   * @module api/GeospatialDataApi
   * @version 1.0.0
   */

  /**
   * Constructs a new GeospatialDataApi. 
   * @alias module:api/GeospatialDataApi
   * @class
   * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the deleteGeoDataByName operation.
     * @callback module:api/GeospatialDataApi~deleteGeoDataByNameCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Delete geospatial data
     * Delete geospatial data for the given asset
     * @param {String} assetName Name of geospatial asset
     * @param {module:api/GeospatialDataApi~deleteGeoDataByNameCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.deleteGeoDataByName = function(assetName, callback) {
      var postBody = null;

      // verify the required parameter 'assetName' is set
      if (assetName === undefined || assetName === null) {
        throw new Error("Missing the required parameter 'assetName' when calling deleteGeoDataByName");
      }


      var pathParams = {
        'assetName': assetName
      };
      var queryParams = {
      };
      var collectionQueryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/geodata/{assetName}', 'DELETE',
        pathParams, queryParams, collectionQueryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getAssetData operation.
     * @callback module:api/GeospatialDataApi~getAssetDataCallback
     * @param {String} error Error message, if any.
     * @param {module:model/GeoDataAssetList} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get geospatial data
     * Get geospatial data for all assets present in database
     * @param {Object} opts Optional parameters
     * @param {String} opts.assetType Filter by asset type (i.e. UE, POA, POA-CELLULAR, EDGE, FOG, CLOUD)
     * @param {module:api/GeospatialDataApi~getAssetDataCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/GeoDataAssetList}
     */
    this.getAssetData = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'assetType': opts['assetType'],
      };
      var collectionQueryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = GeoDataAssetList;

      return this.apiClient.callApi(
        '/geodata', 'GET',
        pathParams, queryParams, collectionQueryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getGeoDataByName operation.
     * @callback module:api/GeospatialDataApi~getGeoDataByNameCallback
     * @param {String} error Error message, if any.
     * @param {module:model/GeoDataAsset} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get geospatial data
     * Get geospatial data for the given asset
     * @param {String} assetName Name of geospatial asset
     * @param {module:api/GeospatialDataApi~getGeoDataByNameCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/GeoDataAsset}
     */
    this.getGeoDataByName = function(assetName, callback) {
      var postBody = null;

      // verify the required parameter 'assetName' is set
      if (assetName === undefined || assetName === null) {
        throw new Error("Missing the required parameter 'assetName' when calling getGeoDataByName");
      }


      var pathParams = {
        'assetName': assetName
      };
      var queryParams = {
      };
      var collectionQueryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = GeoDataAsset;

      return this.apiClient.callApi(
        '/geodata/{assetName}', 'GET',
        pathParams, queryParams, collectionQueryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the updateGeoDataByName operation.
     * @callback module:api/GeospatialDataApi~updateGeoDataByNameCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Create/Update geospatial data
     * Create/Update geospatial data for the given asset
     * @param {String} assetName Name of geospatial asset
     * @param {module:model/GeoDataAsset} geoData Geospatial data
     * @param {module:api/GeospatialDataApi~updateGeoDataByNameCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.updateGeoDataByName = function(assetName, geoData, callback) {
      var postBody = geoData;

      // verify the required parameter 'assetName' is set
      if (assetName === undefined || assetName === null) {
        throw new Error("Missing the required parameter 'assetName' when calling updateGeoDataByName");
      }

      // verify the required parameter 'geoData' is set
      if (geoData === undefined || geoData === null) {
        throw new Error("Missing the required parameter 'geoData' when calling updateGeoDataByName");
      }


      var pathParams = {
        'assetName': assetName
      };
      var queryParams = {
      };
      var collectionQueryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json'];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/geodata/{assetName}', 'POST',
        pathParams, queryParams, collectionQueryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));
