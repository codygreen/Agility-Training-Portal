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

class BlueprintCache {
    constructor (port = null, host = null, options = {}) {
        // create redis client
        //TODO: THIS IS A PROBLEM, CAN'T EASILY STUB THIS
        this.client = redis.createClient(port, host, options);

        // use promises for set and sadd
        this.setAsync = promisify(this.client.set).bind(this.client);
        this.saddAsync = promisify(this.client.sadd).bind(this.client);
        
        // handle errors
        this.client.on('error', function (err) {
            console.error('REDIS ERROR: ' + err);
        });
    };

    add(value = null, key = null) {
        return new Promise((resolve, reject) => {
            // ensure we have required variables
            if(!value)
               return reject(new Error('add requires a value'));

            if(!key)
                return reject(new Error('add requires a key'));

            // add to redis
            return this.setAsync(key, value).then((res) => {
                console.log('REDIS ADD RES: ' + res);
                if(res === 'OK')
                    resolve(res);
                else 
                    reject(res);
            })
            .catch((err) => {
                console.error(err);
                reject(err);
            });
        });
    };

    addSet(value = null, key = null, map = null) {
        return new Promise((resolve, reject) => {
            if(!value) 
                return reject(new Error('sadd expects a value'));
            if(!key)
                return reject(new Error('sadd expects a key'));
            
            // iterate through values and create array of promises
            let promises = []
            if(Array.isArray(value)) {
                value.map(v => {
                    promises.push(this.saddAsync(key, v));
                });
            } else {
                promises.push(this.saddAsync(key, value));
            }
            Promise.all(promises)
            .then(res => {
                console.log('PROMISE RES:', res);
                // loop through the promise responses 
                let failed = false;
                res.map(x => {
                    console.log('PROMISE RES X: ', x);
                    if((x) === 'false') {
                        failed = true;
                    }
                });
                if(failed === true)
                    return reject(new Error('sadd failed on one of the promises: '+ res.toString()));
                resolve('OK');
            })
            .catch(err => {
                console.error(err);
                reject(err);
            });
        });
    };

    flushall() {this.client.flushall()};

    quit() {this.client.quit()};
};


module.exports = BlueprintCache;

// /**
//  * find intersection of keys
//  * @return {array}
//  */
// exports.sinter = function(keys = []) {
//     //TODO: implement this so we can search blueprints based off a query string
// }

// // exports.quit = function() {
// //     client.quit();
// // }