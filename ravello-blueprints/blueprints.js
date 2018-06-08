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

const r = require('ravello-js');
const dotenv = require('dotenv').config();

class RavelloBlueprints {
    constructor () {
        if (!process.env.USERNAME) {
            throw new Error('RavelloAuth.constructor Error: a username was not supplied');
        }
      
        if (!process.env.PASSWORD) {
            throw new Error('RavelloAuth.constructor Error: a password was not supplied');
        }

        if (!process.env.DOMAIN) {
            throw new Error('RavelloAuth.constructor Error: a domain was not supplied');
        }
        // build ravello-js conf
        const conf = {
            //Logger: (function() {}),
            credentials: {
                domain: process.env.DOMAIN,
                password: process.env.PASSWORD,
                username: process.env.USERNAME
            }
        };

        // may argument to this.argument
        Object.keys(conf.credentials).map(key => this[key] = conf.credentials[key]);
        r.configure(conf);
    }

    listBlueprints() {
        return new Promise((resolve, reject) => {
            r.listBlueprints().then((res) => {
                if(res) {
                    resolve(res);
                } else {
                    // no blueprints returned
                    reject(new Error('No blueprints returned'));
                }
            })
        }).catch((err) => {
            console.error(err);
            reject(err);
        });
    };
}

module.exports = RavelloBlueprints;
