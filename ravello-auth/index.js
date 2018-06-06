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
const jwt = require('jsonwebtoken');

class RavelloAuth {
    constructor({ username = null, password = null, domain = null } = {}) {
        if (!username) {
            throw new Error('RavelloAuth.constructor Error: a username was not supplied');
        }
      
        if (!password) {
            throw new Error('RavelloAuth.constructor Error: a password was not supplied');
        }

        if (!domain) {
            throw new Error('RavelloAuth.constructor Error: a domain was not supplied');
        }
        
        // map argument to this.argument
        Object.keys(arguments[0]).map(key => this[key] = arguments[0][key]);

        // build ravello-js conf 
        const conf = {
            //Logger: (function() {}),
            credentials: {
                domain,
                password,
                username
            }
        };
        r.configure(conf);
    }
    
    auth() {
        return new Promise((resolve, reject) => {
            r.getCurrentUser().then((res) => {
                if(res) {
                    // Authentication successful, create JWT
                    console.log('TEST' + process.env.JWT_SECRET + ':' + typeof(process.env.JWT_SECRET));
                    var JWTSecret = process.env.JWT_SECRET || null;
                    if(JWTSecret === null) {
                        reject(new Error('Ravello.createJWT: JWT secret not defined'));
                    }
                    // define the JWT payload
                    var JWTPayload = {
                        'username': this.username
                    };

                    // Sign the JWT payload
                    var token = jwt.sign(JWTPayload, JWTSecret, {
                        'expiresIn': 14400, // expires in 4 hours
                        'issuer': 'F5 Networks - Agility Labs',
                        'audience': 'F5 Labs'
                    });
                    resolve({'jwt': token});
                } 
            }).catch((err)=> {
                console.error('ERROR LOGGING IN');
                reject(err);
            });
        });
    }
}

module.exports = RavelloAuth;