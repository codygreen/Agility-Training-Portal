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

const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const dotenv = require('dotenv').config();

chai.use(chaiAsPromised);
chai.should();
const redis = require('redis');
const redisMock = require('redis-mock');
const BlueprintCache = require('../blueprint-cache');

const stubRedis = true;

describe('Test BlueprintCache add functions', function() {
    let cache = null;
    before(function() {
        if(stubRedis)
            sinon.stub(redis, 'createClient').returns(redisMock.createClient());  
        cache = new BlueprintCache();
    });
    it('Test add function', function() {
        return cache.add('test', 'test').should.eventually.equal('OK');
    });
    after(function() {
        cache.flushall();
        cache.quit();
        if(stubRedis)
            redis.createClient.restore();
    });
});
describe('Test BlueprintCache addSet functions', function() {
    let cache = null;
    before(function() {
        if(stubRedis)
            sinon.stub(redis, 'createClient').returns(redisMock.createClient()); 
        cache = new BlueprintCache(); 
    });
    it('Test sadd function', function() {
        return cache.addSet(['testsadd'], 'testsadd').should.eventually.equal('OK');
            //test with an array
        return cache.addSet(['testsaddarray'], 'testsaddarray').should.eventually.equal('OK');
    });
    after(function() {
        cache.flushall();
        cache.quit();
        if(stubRedis)
            redis.createClient.restore();
    });
});

describe('Test BlueprintCache add errors', function() {
    let cache = null;
    before(function() {
        if(stubRedis)
            sinon.stub(redis, 'createClient').returns(redisMock.createClient()); 
        cache = new BlueprintCache(); 
    });
    it('Test empty parameters', function() {
        return cache.add().should.eventually.rejectedWith(Error);
    })
    it('Test empty 2nd parameter', function() {
        return cache.add(1).should.eventually.rejectedWith(Error);
    })
    after(function() {
        cache.flushall();
        cache.quit();
        if(stubRedis)
            redis.createClient.restore();
    });
})

describe('Test BlueprintCache addSet errors', function() {
    let cache = null;
    before(function() {
        if(stubRedis)
            sinon.stub(redis, 'createClient').returns(redisMock.createClient()); 
        cache = new BlueprintCache(); 
    });
    it('Test empty parameters', function() {
        return cache.addSet().should.eventually.rejectedWith(Error);
    })
    it('Test empty 2nd parameter', function() {
        return cache.addSet(1).should.eventually.rejectedWith(Error);
    })
    after(function() {
        cache.flushall();
        cache.quit();
        if(stubRedis)
            redis.createClient.restore();
    });
})