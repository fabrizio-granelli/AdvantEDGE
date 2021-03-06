/*
 * Copyright (c) 2020  InterDigital Communications, Inc
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

import { connect } from 'react-redux';
import React, { Component, createRef } from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import 'mapbox-gl';
import 'mapbox-gl-leaflet';
import '@geoman-io/leaflet-geoman-free';
import deepEqual from 'deep-equal';
import {
  updateObject,
  deepCopy
} from '../util/object-util';
import { execChangeTable } from '../state/exec';
import {
  cfgChangeTable,
  cfgElemUpdate,
  cfgElemEdit
} from '../state/cfg';
import {
  uiCfgChangeMapCfg,
  uiExecChangeSandboxCfg
} from '../state/ui';
import {
  TYPE_CFG,
  TYPE_EXEC,
  HOST_PATH,
  ELEMENT_TYPE_UE,
  ELEMENT_TYPE_POA,
  ELEMENT_TYPE_POA_CELL,
  ELEMENT_TYPE_FOG,
  ELEMENT_TYPE_EDGE,
  ELEMENT_TYPE_DC
} from '../meep-constants';
import {
  FIELD_NAME,
  FIELD_TYPE,
  FIELD_GEO_LOCATION,
  FIELD_GEO_PATH,
  FIELD_GEO_RADIUS,
  getElemFieldVal,
  getElemFieldErr,
  setElemFieldVal,
  setElemFieldErr
} from '../util/elem-utils';

const TYPE_UE = 'UE';
const TYPE_POA = 'POA';
const TYPE_COMPUTE = 'COMPUTE';

const OPACITY_UE = 0.8;
const OPACITY_UE_PATH = 0.6;
const OPACITY_POA = 0.6;
const OPACITY_POA_RANGE = 0.4;
const OPACITY_COMPUTE = 0.6;
const OPACITY_BACKGROUND = 0.35;
const OPACITY_TARGET = 1;

const DEFAULT_MAP_STYLE = 'Positron';
const DEFAULT_MAP_LATITUDE = 0;
const DEFAULT_MAP_LONGITUDE = 0;
const DEFAULT_MAP_ZOOM = 2;


class IDCMap extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.thisRef = createRef();
    this.configRef = createRef();
  }

  componentDidMount() {
    this.createMap();
  }

  componentWillUnmount() {
    this.destroyMap();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.sandbox !== this.props.sandbox) {
      this.destroyMap();
      this.createMap();
      this.updateMarkers();
    }
  }

  shouldComponentUpdate(nextProps) {
    // Map size update
    let width = this.thisRef.current.offsetWidth;
    let height = this.thisRef.current.offsetHeight;
    if ((width && this.width !== width) || (height && this.height !== height)) {
      this.width = width;
      this.height = height;
      // console.log('Map view resized to: ' + width + 'x' + height);
      this.map.invalidateSize();
      return true;
    }

    // Target element change
    if (nextProps.configuredElement !== this.props.configuredElement) {
      return true;
    }

    // Sandbox changed
    if (nextProps.sandbox !== this.props.sandbox) {
      return true;
    }

    // Map changed
    if (!deepEqual(this.getMap(nextProps), this.getMap(this.props))) {
      return true;
    }

    return false;
  }

  getMap(props) {
    return (this.props.type === TYPE_CFG) ? props.cfgPageMap : props.execPageMap;
  }

  getCfg() {
    return (this.props.type === TYPE_CFG) ? this.props.mapCfg : this.props.sandboxCfg[this.props.sandboxName];
  }

  updateCfg(cfg) {
    switch (this.props.type) {
    case TYPE_CFG:
      this.props.changeMapCfg(updateObject(this.getCfg(), cfg));
      break;
    case TYPE_EXEC:
      var sandboxCfg = updateObject({}, this.props.sandboxCfg);
      if (sandboxCfg[this.props.sandboxName]) {
        sandboxCfg[this.props.sandboxName] = updateObject(sandboxCfg[this.props.sandboxName], cfg);
        this.props.changeSandboxCfg(sandboxCfg);
      }
      break;
    default:
      break;
    }
  }

  changeTable(table) {
    switch (this.props.type) {
    case TYPE_CFG:
      this.props.changeCfgTable(table);
      break;
    case TYPE_EXEC:
      this.props.changeExecTable(table);
      break;
    default:
      break;
    }
  }

  editElement(name) {
    // Update selected nodes in table
    const table = updateObject({}, this.props.cfgTable);
    const elem = this.getElementByName(table.entries, name);
    table.selected = elem ? [elem.id] : [];
    this.changeTable(table);

    // Open selected element in element configuration pane
    if (this.props.type === TYPE_CFG) {
      this.props.onEditElement(elem ? elem : this.props.configuredElement);

      // Update target element name & reset controls on target change
      if (name !== this.targetElemName) {
        this.map.pm.disableDraw('Marker');
        this.map.pm.disableDraw('Line');
        if (this.map.pm.globalEditEnabled()) {
          this.map.pm.disableGlobalEditMode();
        }
        if (this.map.pm.globalDragModeEnabled()) {
          this.map.pm.toggleGlobalDragMode();
        }
        if (this.map.pm.globalRemovalEnabled()) {
          this.map.pm.toggleGlobalRemovalMode();
        }
      }
      this.targetElemName = name;
    }
  }

  getElementByName(entries, name) {
    for (var i = 0; i < entries.length; i++) {
      if (getElemFieldVal(entries[i], FIELD_NAME) === name) {
        return entries[i];
      }
    }
    return null;
  }

  createMap() {
    // Get stored configuration
    var cfg = this.getCfg();
    var lat = (cfg && cfg.center) ? cfg.center.lat : DEFAULT_MAP_LATITUDE;
    var lng = (cfg && cfg.center) ? cfg.center.lng : DEFAULT_MAP_LONGITUDE;
    var zoom = (cfg && cfg.zoom) ? cfg.zoom : DEFAULT_MAP_ZOOM;
    var baselayerName = (cfg && cfg.baselayerName) ? cfg.baselayerName : DEFAULT_MAP_STYLE;
 
    // Map bounds
    const corner1 = L.latLng(-90, -180);
    const corner2 = L.latLng(90, 180);
    const bounds = L.latLngBounds(corner1, corner2);
    
    // Create Map instance
    var domNode = ReactDOM.findDOMNode(this);
    this.map = L.map(domNode, {
      center: [lat,lng],
      zoom: zoom,
      minZoom: 2,
      maxZoom: 20,
      drawControl: true,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0
    });
    this.map.attributionControl.addAttribution('<a href="https://www.maptiler.com/copyright/?_ga=2.45788834.742970109.1593090041-1523068243.1593090041" target="_blank">© MapTiler</a>');
    this.map.attributionControl.addAttribution('<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>');

    // Create GL Baselayers
    var positronBaselayer = L.mapboxGL({style: HOST_PATH + '/map/styles/positron/style.json'});
    var darkBaselayer = L.mapboxGL({style: HOST_PATH + '/map/styles/dark-matter/style.json'});
    var klokBaselayer = L.mapboxGL({style: HOST_PATH + '/map/styles/klokantech-basic/style.json'});
    var osmBaselayer = L.mapboxGL({style: HOST_PATH + '/map/styles/osm-bright/style.json'});
    var baselayers = {
      'Positron': positronBaselayer,
      'Black Matter': darkBaselayer,
      'Klokantech': klokBaselayer,
      'OSM Bright': osmBaselayer
    };

    // Create Layer Group Overlays
    this.ueOverlay = L.layerGroup();
    this.uePathOverlay = L.layerGroup();
    this.poaOverlay = L.layerGroup();
    this.poaRangeOverlay = L.layerGroup();
    this.computeOverlay = L.layerGroup();
    var overlays = {
      'terminal': this.ueOverlay,
      'terminal-path': this.uePathOverlay,
      'poa': this.poaOverlay,
      'poa-coverage': this.poaRangeOverlay,
      'compute': this.computeOverlay
    };

    // Create Layer Controller
    this.layerCtrl = L.control.layers(baselayers, overlays);

    // Create popup
    this.popup = L.popup();

    // Initialize map & layers
    this.layerCtrl.addTo(this.map);
    this.ueOverlay.addTo(this.map);
    this.uePathOverlay.addTo(this.map);
    this.poaOverlay.addTo(this.map);
    this.poaRangeOverlay.addTo(this.map);
    this.computeOverlay.addTo(this.map);

    // Set default base layer
    var baselayer = baselayers[baselayerName] ? baselayers[baselayerName] : positronBaselayer;
    baselayer.addTo(this.map);    

    // Handlers
    var _this = this;
    this.map.on('zoomend', function() {_this.setZoom(this);});
    this.map.on('moveend', function() {_this.setCenter(this);});
    this.map.on('baselayerchange', function(e) {_this.setBaseLayer(e);});

    // Add asset markers
    this.updateMarkers();

    if (this.props.type === TYPE_CFG) {
      // Draw Controls -- add leaflet-geoman controls with some options to the map
      this.map.pm.addControls({
        position: 'topleft',
        drawMarker: false, // adds button to draw markers
        drawCircleMarker: false, // adds button to draw circle markers
        drawPolyline: false, // adds button to draw rectangle
        drawRectangle: false, // adds button to draw rectangle
        drawPolygon: false, // adds button to draw polygon
        drawCircle: false, // adds button to draw circle
        editMode: false, // adds button to toggle edit mode for all layers
        dragMode: false, // adds button to toggle drag mode for all layers
        cutPolygon: false, // adds button to cut a hole in a polygon
        removalMode: false, // adds a button to remove layers
        pinningOption: false,	// $$ adds a button to toggle the Pinning Option
        snappingOption:	false	// $$ adds a button to toggle the Snapping Option
      });

      // Map handlers
      this.map.on('pm:globaleditmodetoggled', e => this.onEditModeToggle(e));
      this.map.on('pm:globaldragmodetoggled', e => this.onDragModeToggle(e));
      this.map.on('pm:create', e => this.onLayerCreated(e));
    }
  }

  destroyMap() {
    if (this.map) {
      this.map.remove();
    }
  }

  setZoom(map) {
    this.updateCfg({zoom: map.getZoom()});
  }

  setCenter(map) {
    this.updateCfg({center: map.getCenter()});
  }

  setBaseLayer(event) {
    this.updateCfg({baselayerName: event.name});
  }

  setUeMarker(ue) {
    var latlng = L.latLng(L.GeoJSON.coordsToLatLng(ue.location.coordinates));
    var pathLatLngs = ue.path ? L.GeoJSON.coordsToLatLngs(ue.path.coordinates) : null;

    // Find existing UE marker
    var existingMarker;
    this.ueOverlay.eachLayer((marker) => {
      if (marker.options.meep.ue.id === ue.assetName){
        existingMarker = marker;
        return;
      }
    });

    if (existingMarker === undefined) {
      // Create path, if any
      var p = !pathLatLngs ? null : L.polyline(pathLatLngs, {
        meep: {
          path: {
            id: ue.assetName
          }
        },
        pmIgnore: (this.props.type === TYPE_CFG) ? false : true
      });

      // Create new UE marker
      var m = L.marker(latlng, {
        meep: {
          ue: {
            id: ue.assetName,
            path: p,
            eopMode: ue.eopMode,
            velocity: ue.velocity
          }
        },
        draggable: (this.props.type === TYPE_CFG) ? true : false,
        pmIgnore: (this.props.type === TYPE_CFG) ? false : true
      });
      m.bindTooltip(ue.assetName).openTooltip();

      // Handlers
      var _this = this;
      m.on('click', function() {_this.clickUeMarker(this);});

      // Add to map overlay
      m.addTo(this.ueOverlay);
      if (p) {
        p.addTo(this.uePathOverlay);
      }
      // console.log('UE ' + id + ' added @ ' + latlng.toString());
    } else {
      // Update UE position, , path, mode & velocity
      existingMarker.setLatLng(latlng);
      existingMarker.options.meep.ue.eopMode = ue.eopMode;
      existingMarker.options.meep.ue.velocity = ue.velocity;

      // Update, create or remove path
      if (pathLatLngs) {
        if (existingMarker.options.meep.ue.path) {
          existingMarker.options.meep.ue.path.setLatLngs(pathLatLngs);
        } else {
          var path = L.polyline(pathLatLngs, {
            meep: {
              path: {
                id: ue.assetName
              }
            },
            pmIgnore: (this.props.type === TYPE_CFG) ? false : true
          });
          existingMarker.options.meep.ue.path = path;
          path.addTo(this.uePathOverlay);
        }
      } else {
        if (existingMarker.options.meep.ue.path) {
          existingMarker.options.meep.ue.path.removeFrom(this.uePathOverlay);
          existingMarker.options.meep.ue.path = null;
        }
      }
    }
  }

  setPoaMarker(poa) {
    var latlng = L.latLng(L.GeoJSON.coordsToLatLng(poa.location.coordinates));

    // Find existing POA marker
    var existingMarker;
    this.poaOverlay.eachLayer((marker) => {
      if (marker.options.meep.poa.id === poa.assetName){
        existingMarker = marker;
        return;
      }
    });

    if (existingMarker === undefined) {
      // Create new POA marker & circle
      var c = L.circle(latlng, {
        meep: {
          range: {
            id: poa.assetName
          }
        },
        radius: poa.radius,
        opacity: OPACITY_POA_RANGE,
        pmIgnore: true
      });
      var m = L.marker(latlng, {
        meep: {
          poa: {
            id: poa.assetName,
            range: c
          }
        },
        opacity: OPACITY_POA,
        draggable: (this.props.type === TYPE_CFG) ? true : false,
        pmIgnore: (this.props.type === TYPE_CFG) ? false : true
      });
      m.bindTooltip(poa.assetName).openTooltip();

      // Handlers
      var _this = this;
      m.on('click', function() {_this.clickPoaMarker(this);});
      m.on('drag', e => _this.onPoaMoved(e));
      m.on('dragend', e => _this.onPoaMoved(e));

      // Add to map overlay
      m.addTo(this.poaOverlay);
      c.addTo(this.poaRangeOverlay);
      // console.log('PoA ' + id + ' added @ ' + latlng.toString());
    } else {
      // Update POA position & range
      existingMarker.setLatLng(latlng);
      existingMarker.options.meep.poa.range.setLatLng(latlng);
      if (Number.isInteger(poa.radius) && poa.radius >= 0) {
        existingMarker.options.meep.poa.range.setRadius(poa.radius);
      }
    }
  }

  setComputeMarker(compute) {
    var latlng = L.latLng(L.GeoJSON.coordsToLatLng(compute.location.coordinates));

    // Find existing COMPUTE marker
    var existingMarker;
    this.computeOverlay.eachLayer((marker) => {
      if (marker.options.meep.compute.id === compute.assetName){
        existingMarker = marker;
        return;
      }
    });

    if (existingMarker === undefined) {
      // Creating new COMPUTE marker
      var m = L.marker(latlng, {
        meep: {
          compute: {
            id: compute.assetName
          }
        },
        opacity: OPACITY_COMPUTE,
        draggable: (this.props.type === TYPE_CFG) ? true : false,
        pmIgnore: (this.props.type === TYPE_CFG) ? false : true
      });
      m.bindTooltip(compute.assetName).openTooltip();

      // Handlers
      var _this = this;
      m.on('click', function() {_this.clickComputeMarker(this);});

      // Add to map overlay
      m.addTo(this.computeOverlay);
      // console.log('Compute ' + id + ' added @ ' + latlng.toString());
    } else {
      // Update COMPUTE position
      existingMarker.setLatLng(latlng);
    }
  }

  // UE Marker Event Handler
  clickUeMarker(marker) {
    if (this.props.type === TYPE_CFG) {
      this.editElement(marker.options.meep.ue.id);
    } else {
      var latlng = marker.getLatLng();
      var msg = '<b>id: ' + marker.options.meep.ue.id + '</b><br>';
      msg += 'path-mode: ' + marker.options.meep.ue.eopMode + '<br>';
      msg += 'velocity: ' + marker.options.meep.ue.velocity + ' m/s<br>';
      msg += latlng.toString();
      this.showPopup(latlng, msg);
    }
  }

  // POA Marker Event Handler
  clickPoaMarker(marker) {
    if (this.props.type === TYPE_CFG) {
      this.editElement(marker.options.meep.poa.id);
    } else {
      var latlng = marker.getLatLng();
      var msg = '<b>id: ' + marker.options.meep.poa.id + '</b><br>';
      msg += 'radius: ' + marker.options.meep.poa.range.options.radius + ' m<br>';
      msg += latlng.toString();
      this.showPopup(latlng, msg);
    }
  }

  // UE Marker Event Handler
  clickComputeMarker(marker) {
    if (this.props.type === TYPE_CFG) {
      this.editElement(marker.options.meep.compute.id);
    } else {
      var latlng = marker.getLatLng();
      var msg = '<b>id: ' + marker.options.meep.compute.id + '</b><br>';
      msg += latlng.toString();
      this.showPopup(latlng, msg);
    }
  }

  // Show position popup
  showPopup(latlng, msg) {
    // console.log(msg);
    this.popup
      .setLatLng(latlng)
      .setContent(msg)
      .openOn(this.map);
  }

  updateTargetMarker(map) {
    const target = this.props.configuredElement;
    if (!target) {
      return;
    }

    const location = getElemFieldVal(target, FIELD_GEO_LOCATION);
    const locationErr = getElemFieldErr(target, FIELD_GEO_LOCATION);
    if (location && !locationErr) {
      var name = getElemFieldVal(target, FIELD_NAME);
      var type = getElemFieldVal(target, FIELD_TYPE);
      var geoDataAsset;

      switch (type) {
      case ELEMENT_TYPE_UE:
        for (let i = 0; i < map.ueList.length; i++) {
          if (map.ueList[i].assetName === name) {
            geoDataAsset = map.ueList[i];
            break;
          }
        }
        if (!geoDataAsset) {
          geoDataAsset = {assetName: name, assetType: TYPE_UE, subType: type};
          map.ueList.push(geoDataAsset);
        }
        geoDataAsset.location = {type: 'Point', coordinates: JSON.parse(location)};

        var path = getElemFieldVal(target, FIELD_GEO_PATH);
        var pathErr = getElemFieldErr(target, FIELD_GEO_PATH);
        geoDataAsset.path = (pathErr || !path) ? null : {type: 'LineString', coordinates: JSON.parse(path)};
        break;

      case ELEMENT_TYPE_POA:
      case ELEMENT_TYPE_POA_CELL:
        for (let i = 0; i < map.poaList.length; i++) {
          if (map.poaList[i].assetName === name) {
            geoDataAsset = map.poaList[i];
            break;
          }
        }
        if (!geoDataAsset) {
          geoDataAsset = {assetName: name, assetType: TYPE_POA, subType: type};
          map.poaList.push(geoDataAsset);
        }
        geoDataAsset.location = {type: 'Point', coordinates: JSON.parse(location)};
        geoDataAsset.radius = getElemFieldVal(target, FIELD_GEO_RADIUS);
        break;

      case ELEMENT_TYPE_FOG:
      case ELEMENT_TYPE_EDGE:
      case ELEMENT_TYPE_DC:
        for (let i = 0; i < map.computeList.length; i++) {
          if (map.computeList[i].assetName === name) {
            geoDataAsset = map.computeList[i];
            break;
          }
        }
        if (!geoDataAsset) {
          geoDataAsset = {assetName: name, assetType: TYPE_COMPUTE, subType: type};
          map.computeList.push(geoDataAsset);
        }
        geoDataAsset.location = {type: 'Point', coordinates: JSON.parse(location)};
        break;

      default:
        break;
      }
    }
  }

  updateMarkers() {
    if (!this.map) {
      return;
    }

    // Get copy of map data 
    var map = deepCopy(this.getMap(this.props));
    if (!map) {
      return;
    }

    // Update target marker geodata using configured element geodata, if any
    if (this.props.type === TYPE_CFG) {
      this.updateTargetMarker(map);
    }

    // Set COMPUTE markers
    var computeMap = {};
    if (map.computeList) {
      for (let i = 0; i < map.computeList.length; i++) {
        let compute = map.computeList[i];
        this.setComputeMarker(compute);
        computeMap[compute.assetName] = true;
      }
    }

    // Remove old COMPUTE markers
    this.computeOverlay.eachLayer((marker) => {
      if (!computeMap[marker.options.meep.compute.id]) {
        marker.removeFrom(this.computeOverlay);
      }
    });

    // Set POA markers
    var poaMap = {};
    if (map.poaList) {
      for (let i = 0; i < map.poaList.length; i++) {
        let poa = map.poaList[i];
        this.setPoaMarker(poa);
        poaMap[poa.assetName] = true;
      }
    }

    // Remove old POA markers
    this.poaOverlay.eachLayer((marker) => {
      if (!poaMap[marker.options.meep.poa.id]) {
        marker.options.meep.poa.range.removeFrom(this.poaRangeOverlay);
        marker.removeFrom(this.poaOverlay);
      }
    });

    // Set UE markers
    var ueMap = {};
    if (map.ueList) {
      for (let i = 0; i < map.ueList.length; i++) {
        let ue = map.ueList[i];
        this.setUeMarker(ue);
        ueMap[ue.assetName] = true;
      }
    }

    // Remove old UE markers
    this.ueOverlay.eachLayer((marker) => {
      if (!ueMap[marker.options.meep.ue.id]) {
        if (marker.options.meep.ue.path) {
          marker.options.meep.ue.path.removeFrom(this.uePathOverlay);
        }
        marker.removeFrom(this.ueOverlay);
      }
    });   
  }

  onEditModeToggle(e) {
    var targetElemName = getElemFieldVal(this.props.configuredElement, FIELD_NAME);
    if (e.enabled) {
      this.setTarget(targetElemName);
    } else {
      this.updateTargetGeoData(targetElemName, '', '');
    }
  }

  onDragModeToggle(e) {
    var targetElemName = getElemFieldVal(this.props.configuredElement, FIELD_NAME);
    if (e.enabled) {
      this.setTarget(targetElemName);
    } else {
      this.updateTargetGeoData(targetElemName, '', '');
    }
  }

  onLayerCreated(e) {
    var location = '';
    var path = '';

    // Get marker location or path & remove newly created layer
    if (e.shape === 'Marker') {
      location = JSON.stringify(L.GeoJSON.latLngToCoords(e.marker.getLatLng()));
      e.marker.removeFrom(this.map);
    } else if (e.shape === 'Line') {
      path = JSON.stringify(L.GeoJSON.latLngsToCoords(e.layer.getLatLngs()));
      e.layer.removeFrom(this.map);
    } else {
      return;
    }

    // Update configured element & refresh map to create the new marker or path
    var targetElemName = getElemFieldVal(this.props.configuredElement, FIELD_NAME);
    this.updateTargetGeoData(targetElemName, location, path);
  }

  onPoaMoved(e) {
    e.target.options.meep.poa.range.setLatLng(e.target.getLatLng());
  }

  updateConfiguredElement(name, val, err) {
    var updatedElem = updateObject({}, this.props.configuredElement);
    setElemFieldVal(updatedElem, name, val);
    setElemFieldErr(updatedElem, name, err);
    this.props.cfgElemUpdate(updatedElem);
  }

  updateTargetGeoData(targetElemName, location, path) {
    if (!targetElemName) {
      return;
    }

    // Get latest geoData from map, if any
    if (!location) {
      var markerInfo = this.getMarkerInfo(targetElemName);
      if (markerInfo && markerInfo.marker) {
        location = JSON.stringify(L.GeoJSON.latLngToCoords(markerInfo.marker.getLatLng()));
        if (!path && markerInfo.type === TYPE_UE && markerInfo.marker.options.meep.ue.path) {
          path = JSON.stringify(L.GeoJSON.latLngsToCoords(markerInfo.marker.options.meep.ue.path.getLatLngs()));
        }
      }
    }

    // Update configured element with map geodata
    this.updateConfiguredElement(FIELD_GEO_LOCATION, location, null);
    this.updateConfiguredElement(FIELD_GEO_PATH, path, null);
  }

  getMarkerInfo(name) {
    var marker;
    for (marker of this.ueOverlay.getLayers()) {
      if (marker.options.meep && (marker.options.meep.ue.id === name)) {
        return {marker: marker, type: TYPE_UE};
      }
    }
    for (marker of this.poaOverlay.getLayers()) {
      if (marker.options.meep && (marker.options.meep.poa.id === name)) {
        return {marker: marker, type: TYPE_POA};
      }
    }
    for (marker of this.computeOverlay.getLayers()) {
      if (marker.options.meep && (marker.options.meep.compute.id === name)) {
        return {marker: marker, type: TYPE_COMPUTE};
      }
    }
    return null;
  }

  setTarget(target) {
    // Disable changes on all markers except target
    this.ueOverlay.eachLayer((marker) => {
      var path = marker.options.meep.ue.path;
      if (marker.pm && (!target || marker.options.meep.ue.id !== target)) {
        marker.pm.disable();
        marker.setOpacity(target ? OPACITY_BACKGROUND : OPACITY_UE);
        if (path && path.pm) {
          path.pm.disable();
          path.setStyle({opacity: target ? OPACITY_BACKGROUND : OPACITY_UE_PATH});
        }
      } else {
        marker.setOpacity(OPACITY_TARGET);
        if (path) {
          path.setStyle({opacity: OPACITY_TARGET});
        }
      }
    });
    this.poaOverlay.eachLayer((marker) => {
      if (marker.pm && (!target || marker.options.meep.poa.id !== target)) {
        marker.pm.disable();
        marker.setOpacity(target ? OPACITY_BACKGROUND : OPACITY_POA);
        marker.options.meep.poa.range.setStyle({opacity: target ? OPACITY_BACKGROUND : OPACITY_POA_RANGE});
      } else {
        marker.setOpacity(OPACITY_TARGET);
        marker.options.meep.poa.range.setStyle({opacity: OPACITY_TARGET});
      }
    });
    this.computeOverlay.eachLayer((marker) => {
      if (marker.pm && (!target || marker.options.meep.compute.id !== target)) {
        marker.pm.disable();
        marker.setOpacity(target ? OPACITY_BACKGROUND : OPACITY_COMPUTE);
      } else {
        marker.setOpacity(OPACITY_TARGET);
      }
    });
  }

  updateEditControls() {
    if (this.props.type !== TYPE_CFG || !this.map) {
      return;
    }

    var drawMarkerEnabled = false;
    var drawPolylineEnabled = false;
    var editModeEnabled = false;
    var dragModeEnabled = false;
    var removalModeEnabled = false;

    // Update target element name & reset controls on target change
    var targetElemName = getElemFieldVal(this.props.configuredElement, FIELD_NAME);

    // Determine which controls to enable
    if (targetElemName) {
      var markerInfo = this.getMarkerInfo(targetElemName);
      if (markerInfo && markerInfo.marker) {
        // Enable path create/edit for UE only
        if (markerInfo.type === TYPE_UE) {
          if (!markerInfo.marker.options.meep.ue.path) {
            drawPolylineEnabled = true;
          }
          editModeEnabled = true;
        }
        dragModeEnabled = true;
        // removalModeEnabled = true;
      } else {
        // Enable marker creation
        drawMarkerEnabled = true;
      }
    }

    // Enable necessary controls
    this.map.pm.addControls({
      drawMarker: drawMarkerEnabled,
      drawPolyline: drawPolylineEnabled,
      editMode: editModeEnabled,
      dragMode: dragModeEnabled,
      removalMode: removalModeEnabled
    });

    // Disable draw, edit & drag modes if controls disabled
    if (!drawMarkerEnabled) {
      this.map.pm.disableDraw('Marker');
    } 
    if (!drawPolylineEnabled) {
      this.map.pm.disableDraw('Line');
    }
    if (!editModeEnabled) {
      if (this.map.pm.globalEditEnabled()) {
        this.map.pm.disableGlobalEditMode(); 
      }
    }
    if (!dragModeEnabled) {
      if (this.map.pm.globalDragModeEnabled()) {
        this.map.pm.toggleGlobalDragMode();
      }
    }

    // Set target element & disable edit on all other markers
    this.setTarget(targetElemName);
  }

  render() {
    this.updateMarkers();
    this.updateEditControls();
    return (
      <div ref={this.thisRef} style={{ height: '100%' }}>
        Map Component
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    cfgPageMap: state.cfg.map,
    execPageMap: state.exec.map,
    sandbox: state.ui.sandbox,
    sandboxCfg: state.ui.sandboxCfg,
    mapCfg: state.ui.mapCfg,
    cfgTable: state.cfg.table,
    execTable: state.exec.table,
    configuredElement: state.cfg.elementConfiguration.configuredElement
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeMapCfg: cfg => dispatch(uiCfgChangeMapCfg(cfg)),
    changeSandboxCfg: cfg => dispatch(uiExecChangeSandboxCfg(cfg)),
    changeExecTable: table => dispatch(execChangeTable(table)),
    changeCfgTable: table => dispatch(cfgChangeTable(table)),
    cfgElemUpdate: element => dispatch(cfgElemUpdate(element)),
    changeCfgElement: element => dispatch(cfgElemEdit(element))
  };
};

const ConnectedIDCMap = connect(
  mapStateToProps,
  mapDispatchToProps
)(IDCMap);

export default ConnectedIDCMap;
