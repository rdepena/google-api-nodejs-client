/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Request = require('./requests.js').Request;
var BatchRequest = require('./requests.js').BatchRequest;

/**
 * Constructs a new client with given API name and version.
 * @constructor
 *
 * @param {object} apiMeta Schema returned by Discovery API.
 */
function Client(apiMeta) {
  this.apiMeta = apiMeta;
  this.authClient = null;
  // generate helper methods
  this.registerHelpers_();
}

/**
 * Gets the API's name.
 * @return {String}
 */
Client.prototype.getName = function() {
  return this.apiMeta.name;
};

/**
 * Gets the API's version.
 * @return {String}
 */
Client.prototype.getVersion = function() {
  return this.apiMeta.version;
};

/**
 * @private
 * Registers request builders for existing API methods.
 */
Client.prototype.registerHelpers_ = function() {
  for (var i in this.apiMeta.methods) {
    var methodMeta = this.apiMeta.methods[i];
    this.extend_(this, methodMeta.id, this.generateHelper_(methodMeta));
  }
};

/**
 * @private
 * TODO(burcud): move to utils
 *
 * @param {?object} root Object to be extended.
 * @param {string} key Full key.
 * @param {?object} obj Object to extend root object with.
 * @return {object} Extended object.
 */
Client.prototype.extend_ = function(root, key, obj) {

  if (!root) root = {};
  var namespaceKeys = key.split('.');

  var chain = root;
  // avoid the client name
  for (var i = 1; i < namespaceKeys.length; i++) {
    var chainKey = namespaceKeys[i];

    // if this is the last key, put obj in it.
    if (i == namespaceKeys.length - 1) {
      chain[chainKey] = obj;
    } else if (!chain[chainKey]) {
      chain[chainKey] = {};
    }

    // move to the next key
    chain = chain[chainKey];
  }

  return root;
};

/**
 * @private
 * Generate a request builder helper.
 *
 * @param {object} methodMeta Method's schema returned by Discovery API.
 * @return {Function} Function generated by methodMeta.
 */
Client.prototype.generateHelper_ = function(methodMeta) {

  var that = this;

  // generates a function to make a request
  // to the resource on given method
  return function(params, resource) {
    return that.newRequest(methodMeta.id, params, resource);
  };
};

/**
 * Constructs a request to method with given parameters.
 *
 * @param {string} methodName Full name of the method.
 * @param {?object} params Parameters.
 * @param {object=} opt_resource Optional resource.
 *
 * @return {Request} New Request object constructed with given args.
 */
Client.prototype.newRequest = function(methodName, params, opt_resource) {
  return new Request(this.apiMeta, methodName, params, opt_resource)
    .withAuthClient(this.authClient);
};

/**
 * Adds global auth client.
 *
 * @param {auth.AuthClient} client An auth client instance.
 *
 * @return {Client} Returns itself.
 */
Client.prototype.withAuthClient = function(client) {
  this.authClient = client;
  return this;
};

/**
 * Exporting Client.
 */
module.exports = Client;
