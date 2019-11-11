/*
 * MEEP Controller REST API
 * Copyright (c) 2019  InterDigital Communications, Inc Licensed under the Apache License, Version 2.0 (the \"License\"); you may not use this file except in compliance with the License. You may obtain a copy of the License at      http://www.apache.org/licenses/LICENSE-2.0  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an \"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License. 
 *
 * OpenAPI spec version: 1.0.0
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
    // AMD.
    define(['expect.js', '../../src/index'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    factory(require('expect.js'), require('../../src/index'));
  } else {
    // Browser globals (root is window)
    factory(root.expect, root.MeepControllerRestApi);
  }
}(this, function(expect, MeepControllerRestApi) {
  'use strict';

  var instance;

  describe('(package)', function() {
    describe('Zone', function() {
      beforeEach(function() {
        instance = new MeepControllerRestApi.Zone();
      });

      it('should create an instance of Zone', function() {
        // TODO: update the code to test Zone
        expect(instance).to.be.a(MeepControllerRestApi.Zone);
      });

      it('should have the property id (base name: "id")', function() {
        // TODO: update the code to test the property id
        expect(instance).to.have.property('id');
        // expect(instance.id).to.be(expectedValueLiteral);
      });

      it('should have the property name (base name: "name")', function() {
        // TODO: update the code to test the property name
        expect(instance).to.have.property('name');
        // expect(instance.name).to.be(expectedValueLiteral);
      });

      it('should have the property type (base name: "type")', function() {
        // TODO: update the code to test the property type
        expect(instance).to.have.property('type');
        // expect(instance.type).to.be(expectedValueLiteral);
      });

      it('should have the property interFogLatency (base name: "interFogLatency")', function() {
        // TODO: update the code to test the property interFogLatency
        expect(instance).to.have.property('interFogLatency');
        // expect(instance.interFogLatency).to.be(expectedValueLiteral);
      });

      it('should have the property interFogLatencyVariation (base name: "interFogLatencyVariation")', function() {
        // TODO: update the code to test the property interFogLatencyVariation
        expect(instance).to.have.property('interFogLatencyVariation');
        // expect(instance.interFogLatencyVariation).to.be(expectedValueLiteral);
      });

      it('should have the property interFogThroughput (base name: "interFogThroughput")', function() {
        // TODO: update the code to test the property interFogThroughput
        expect(instance).to.have.property('interFogThroughput');
        // expect(instance.interFogThroughput).to.be(expectedValueLiteral);
      });

      it('should have the property interFogPacketLoss (base name: "interFogPacketLoss")', function() {
        // TODO: update the code to test the property interFogPacketLoss
        expect(instance).to.have.property('interFogPacketLoss');
        // expect(instance.interFogPacketLoss).to.be(expectedValueLiteral);
      });

      it('should have the property interEdgeLatency (base name: "interEdgeLatency")', function() {
        // TODO: update the code to test the property interEdgeLatency
        expect(instance).to.have.property('interEdgeLatency');
        // expect(instance.interEdgeLatency).to.be(expectedValueLiteral);
      });

      it('should have the property interEdgeLatencyVariation (base name: "interEdgeLatencyVariation")', function() {
        // TODO: update the code to test the property interEdgeLatencyVariation
        expect(instance).to.have.property('interEdgeLatencyVariation');
        // expect(instance.interEdgeLatencyVariation).to.be(expectedValueLiteral);
      });

      it('should have the property interEdgeThroughput (base name: "interEdgeThroughput")', function() {
        // TODO: update the code to test the property interEdgeThroughput
        expect(instance).to.have.property('interEdgeThroughput');
        // expect(instance.interEdgeThroughput).to.be(expectedValueLiteral);
      });

      it('should have the property interEdgePacketLoss (base name: "interEdgePacketLoss")', function() {
        // TODO: update the code to test the property interEdgePacketLoss
        expect(instance).to.have.property('interEdgePacketLoss');
        // expect(instance.interEdgePacketLoss).to.be(expectedValueLiteral);
      });

      it('should have the property edgeFogLatency (base name: "edgeFogLatency")', function() {
        // TODO: update the code to test the property edgeFogLatency
        expect(instance).to.have.property('edgeFogLatency');
        // expect(instance.edgeFogLatency).to.be(expectedValueLiteral);
      });

      it('should have the property edgeFogLatencyVariation (base name: "edgeFogLatencyVariation")', function() {
        // TODO: update the code to test the property edgeFogLatencyVariation
        expect(instance).to.have.property('edgeFogLatencyVariation');
        // expect(instance.edgeFogLatencyVariation).to.be(expectedValueLiteral);
      });

      it('should have the property edgeFogThroughput (base name: "edgeFogThroughput")', function() {
        // TODO: update the code to test the property edgeFogThroughput
        expect(instance).to.have.property('edgeFogThroughput');
        // expect(instance.edgeFogThroughput).to.be(expectedValueLiteral);
      });

      it('should have the property edgeFogPacketLoss (base name: "edgeFogPacketLoss")', function() {
        // TODO: update the code to test the property edgeFogPacketLoss
        expect(instance).to.have.property('edgeFogPacketLoss');
        // expect(instance.edgeFogPacketLoss).to.be(expectedValueLiteral);
      });

      it('should have the property meta (base name: "meta")', function() {
        // TODO: update the code to test the property meta
        expect(instance).to.have.property('meta');
        // expect(instance.meta).to.be(expectedValueLiteral);
      });

      it('should have the property userMeta (base name: "userMeta")', function() {
        // TODO: update the code to test the property userMeta
        expect(instance).to.have.property('userMeta');
        // expect(instance.userMeta).to.be(expectedValueLiteral);
      });

      it('should have the property networkLocations (base name: "networkLocations")', function() {
        // TODO: update the code to test the property networkLocations
        expect(instance).to.have.property('networkLocations');
        // expect(instance.networkLocations).to.be(expectedValueLiteral);
      });

    });
  });

}));
