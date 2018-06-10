/**
 * Copyright 2016, 2017 F5 Networks, Inc.
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
'use strict';

const dotenv = require('dotenv').config();
const redis = require('redis');
const {promisify} = require('util');
const client = redis.createClient();
const setAsync = promisify(client.set).bind(client);
const saddAsync = promisify(client.sadd).bind(client);

/**
 * add key to redis
 *
 * @return {Boolean}
 */
exports.add = function(value = null, key = null) {
    return new Promise((resolve, reject) => {
        if(!value) {
            reject(new Error('add requires a value'));
            return;
        }
        if(!key) {
            reject(new Error('add requires a key'));
            return;
        }
        return setAsync(key, value).then((res) => {
            console.log('REDIS ADD RES: ' + res);
            resolve();
        })
        .catch((err) => {
            console.error(err);
            reject(err);
        });
    });
};

/**
 * add map key to redis
 *
 * @return {Boolean}
 */
exports.sadd = function (value = null, key = null, map = null) {
    return new Promise((resolve, reject) => {
        if(!value) {
            reject(new Error('sadd expects a value'));
            return;
        }
        if(!key) {
            reject(new Error('sadd expects a key'));
            return;
        }

        // iterate through values and create array of promises
        let promises = []
        if(Array.isArray(value)) {
            value.map(v => {
                promises.push(client.sadd(key, v));
            });
        }
        Promise.all(promises)
        .then(res => {
            resolve(res);
        })
        .catch(err => {
            console.error(err);
            reject(err);
        });
    });
};

/**
 * find intersection of keys
 * @return {array}
 */
exports.sinter = function(keys = []) {
    //TODO: implement this so we can search blueprints based off a query string
}

exports.quit = function() {
    client.quit();
}