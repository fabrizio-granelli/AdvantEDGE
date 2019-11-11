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

  beforeEach(function() {
    instance = new MeepControllerRestApi.PodStatesApi();
  });

  describe('(package)', function() {
    describe('PodStatesApi', function() {
      describe('getStates', function() {
        it('should call getStates successfully', function(done) {
          // TODO: uncomment, update parameter values for getStates call and complete the assertions
          /*
          var opts = {};
          opts._long = "_long_example";
          opts.type = "type_example";

          instance.getStates(opts, function(error, data, response) {
            if (error) {
              done(error);
              return;
            }
            // TODO: update response assertions
            expect(data).to.be.a(MeepControllerRestApi.PodsStatus);
            {
              let dataCtr = data.podStatus;
              expect(dataCtr).to.be.an(Array);
              expect(dataCtr).to.not.be.empty();
              for (let p in dataCtr) {
                let data = dataCtr[p];
                expect(data).to.be.a(MeepControllerRestApi.PodStatus);
                expect(data.name).to.be.a('string');
                expect(data.name).to.be("");
                expect(data.namespace).to.be.a('string');
                expect(data.namespace).to.be("");
                expect(data.meepApp).to.be.a('string');
                expect(data.meepApp).to.be("");
                expect(data.meepOrigin).to.be.a('string');
                expect(data.meepOrigin).to.be("");
                expect(data.meepScenario).to.be.a('string');
                expect(data.meepScenario).to.be("");
                expect(data.phase).to.be.a('string');
                expect(data.phase).to.be("");
                expect(data.podInitialized).to.be.a('string');
                expect(data.podInitialized).to.be("");
                expect(data.podReady).to.be.a('string');
                expect(data.podReady).to.be("");
                expect(data.podScheduled).to.be.a('string');
                expect(data.podScheduled).to.be("");
                expect(data.podUnschedulable).to.be.a('string');
                expect(data.podUnschedulable).to.be("");
                expect(data.podConditionError).to.be.a('string');
                expect(data.podConditionError).to.be("");
                expect(data.containerStatusesMsg).to.be.a('string');
                expect(data.containerStatusesMsg).to.be("");
                expect(data.nbOkContainers).to.be.a('string');
                expect(data.nbOkContainers).to.be("");
                expect(data.nbTotalContainers).to.be.a('string');
                expect(data.nbTotalContainers).to.be("");
                expect(data.nbPodRestart).to.be.a('string');
                expect(data.nbPodRestart).to.be("");
                expect(data.logicalState).to.be.a('string');
                expect(data.logicalState).to.be("");
                expect(data.startTime).to.be.a('string');
                expect(data.startTime).to.be("");
              }
            }

            done();
          });
          */
          // TODO: uncomment and complete method invocation above, then delete this line and the next:
          done();
        });
      });
    });
  });

}));
