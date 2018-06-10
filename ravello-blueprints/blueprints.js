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
const redis = require('redis');
const {promisify} = require('util');
const client = redis.createClient();
const setAsync = promisify(client.set).bind(client);
const saddAsync = promisify(client.sadd).bind(client);

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

        client.on('error', function (err) {
            console.error('REDIS ERROR: ' + err);
        });
    }

    /**
     * add key to redis
     *
     * @return {Boolean}
     */
    add(value = null, key = null) {
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
    sadd(value = null, key = null, map = null) {
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
    sinter(keys = []) {
        //TODO: implement this so we can search blueprints based off a query string
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

    /**
     * build an index of blueprint names to blueprint ids
     * 
     * @param {array} - array of blueprints
     * @return {array}
     */
    buildIndex(blueprints = []) {
        // create an empty map
        let index = new Map();
        return new Promise((resolve, reject) => {
            // check that blueprints is an array
            if(!Array.isArray(blueprints)) {
                reject(new Error('buildIndex requires an array of blueprints'));
            }
            // itereate through blueprints
            blueprints.map(x =>  {
                // add the blueprint name to redis
                this.add(x.name, x.id);
                // normalize the blueprint name
                const normWords = this.normalize(x.name);
                console.log('NORMWORDS: ', normWords);
                // iterate through the normalized words in the blueprint name
                normWords.map(word => {
                    console.log('EXAMINE: ' + word);
                    console.log('CURRENT INDEX for word: ' + index.get(word));
                    // check if word exists
                    if(index.has(word)) {
                        console.log('WORD EXISTS IN INDEX');
                        // get the current blueprint(s) associated with the index word
                        let blist = index.get(word);
                        blist.push(x.id);
                        index.set(word, blist);
                    } else {
                        index.set(word, [x.id]);
                    }
                });
            })
            // add data to redis
            index.forEach(this.sadd);
            client.quit();
            console.log('WERE DONE');
            resolve(index);
        }).catch((err) => {
            console.error(err);
            reject(err);
        });
    };

    /**
     * normalize the blueprint title
     *
     * @return {array}
     */
    normalize(s = null) {
        let normWords = [];
        // remove stop words
        // list of stopwords from YoastSEO.js https://github.com/Yoast/YoastSEO.js/blob/develop/src/config/stopwords.js
        const stopwords = [ "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "it", "it's", "its", "itself", "let's", "me", "more", "most", "my", "myself", "nor", "of", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "she'd", "she'll", "she's", "should", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "we'd", "we'll", "we're", "we've", "were", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "would", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves" ];
        s.toLowerCase().split(/[\s-_]+/).map(word => {
            console.log('MAP WORD: ' + word );
            // check if word is a stopword
            if (stopwords.includes(word)) 
                return;
            else
                normWords.push(word);
        });

        return normWords;
    };
}

module.exports = RavelloBlueprints;
