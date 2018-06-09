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

const RavelloBlueprints = require('../blueprints');
const r = require('ravello-js');
const f = require('./fixtures/ravello');
const redis = require('redis');
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const domain = process.env.DOMAIN;

describe('Test RavelloBlueprint Class', function() {
    it('Test constructor', function() {
        (function () {
            delete process.env.USERNAME;
            const b = new RavelloBlueprints();
        }).should.throw(Error);
        process.env.USERNAME = username;

        (function () {
            delete process.env.PASSWORD;
            const b = new RavelloBlueprints();
        }).should.throw(Error);
        process.env.PASSWORD = password;
    
        (function () {
            delete process.env.DOMAIN;
            const  b = new RavelloBlueprints();
        }).should.throw(Error);
        process.env.DOMAIN = domain;

        const b = new RavelloBlueprints();
        expect(b).to.be.an('object');
        expect(b.username).to.be.an('string');
        expect(b.username === process.env.USERNAME);
        expect(b.password).to.be.an('string');
        expect(b.password === process.env.PASSWORD);
        expect(b.domain).to.be.an('string');
        expect(b.domain === process.env.DOMAIN);
    });
    after(function() {
        r.listBlueprints.restore();
    });
    it('Test listBlueprints method', function() {
        const b = new RavelloBlueprints();
        sinon.stub(r, 'listBlueprints').resolves(f.blueprints);
        return b.listBlueprints().then((res) => {
            expect(res).to.be.an('array');
         })
         .catch((err) => {
             console.error(err);
         });
    });
});
describe('Test Errors', function() {
    it('Test an empty blueprint', function() {
        const b = new RavelloBlueprints();
        sinon.stub(r, 'listBlueprints').resolves(null);
        return b.listBlueprints().should.be.rejectedWith(Error);
    });
    after(function() {
        r.listBlueprints.restore();
    });
});

describe('Test Indexing', function() {
    it('Test creation of an index', function() {
        const b = new RavelloBlueprints();
        sinon.stub(r, 'listBlueprints').resolves(f.blueprints);
        return b.listBlueprints().then((res) => {
            expect(res).to.be.an('array');
            console.log('BP: %j' + res[0]);
            return b.buildIndex(res);
        })
        // .then((res) => {
        //     console.log('RESULTS: ');
        // })
        .catch((err) => {
            console.error(err);
        });
    });
    after(function() {
        r.listBlueprints.restore();
    });
});

describe('Test redis functions', function() {
    it('sadd', function() {
        const b = new RavelloBlueprints();
        //TODO: how should we stub the redis client???
        b.sadd('test', 'test');
    });
    it('sinter', function() {
        const b = new RavelloBlueprints();
        b.sinter('agility', '2017');
    })
})
