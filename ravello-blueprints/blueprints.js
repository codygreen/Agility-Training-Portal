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
const client = redis.createClient();

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
    add(value, key) {
        //TODO: provide return values to test agains
        client.set(key, value, redis.print);
        return true;
    };

    /**
     * add map key to redis
     *
     * @return {Boolean}
     */
    sadd(value, key, map) {
        //TODO: provide return values to test agains
        if(typeof(value) == 'object') {
            value.map(v => {
                client.sadd(key, v, redis.print);
            })
        } else {
            client.sadd(key, value, redis.print);
        }

        return true;
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
     * @return {array}
     */
    buildIndex(blueprints = []) {
        // create an empty map
        let index = new Map();
        return new Promise((resolve, reject) => {
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
                        console.log('TYPE: ' + typeof(blist));
                        // if there is more than one, it will be an array
// TODO: this was never getting called so commented out for now but check back on this
                        if(typeof(blist) === 'object')
                             index.set(word, blist.push(x.id));
                        else
                            index.set(word, [blist, x.id]);
                    } else {
                        index.set(word, [x.id]);
                    }
                });
            })
            // add data to redis
            index.forEach(this.sadd);
            client.quit();
            console.log('WERE DONE');
            resolve();
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
