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

chai.use(chaiAsPromised);
chai.should();

const Auth = require('../index.js');
let r = require('ravello-js');
const result = require('dotenv').config();

// variables used for testing
const username = 'bob.johnson@f5.com';
const password = '12334567897654';
const domain = '0998876';

describe('Test RavelloAuth Class', function () {
    after(function() {
        r.getCurrentUser.restore();
    });
    it('Test constructor', function () {
        (function () {
            const auth = new Auth();
          }).should.throw(Error);
        
        (function () {
            const auth = new Auth({ username });
        }).should.throw(Error);
    
        (function () {
            const auth = new Auth({ username, password });
        }).should.throw(Error);
    
        sinon.stub(r, 'getCurrentUser').resolves('12344');
        const auth = new Auth({ username, password, domain });
        // make sure required variables are set
        expect(auth.username).to.be.an('string');
        expect(auth.username).to.equal(username);
        expect(auth.password).to.be.an('string');
        expect(auth.password).to.equal(password);
        expect(auth.domain).to.be.an('string');
        expect(auth.domain).to.equal(domain);
        
        return auth.auth()
            .then(res => {
                // make sure we have a JWT token
                expect(res).to.be.an('object');
                expect(res.jwt).to.be.an('string');
                console.log(res);
            });
    });
});
describe('Test ravell-js promise reject', function () {
    it('Test empty JWT_SECRET', function () {
        const auth = new Auth({ username, password, domain });
        sinon.stub(r, 'getCurrentUser').rejects(new Error('test error'));
        return auth.auth()
            .should.be.rejectedWith(Error);
    });
    after(function() {
        r.getCurrentUser.restore();
    });
});
describe('Test ravell-js with empty response', function () {
    it('Test empty JWT_SECRET', function () {
        const auth = new Auth({ username, password, domain });
        sinon.stub(r, 'getCurrentUser').resolves(null);
        return auth.auth()
            .should.be.rejectedWith(Error);
    });
    after(function() {
        r.getCurrentUser.restore();
    });
});
describe('Test ravell-js promise reject', function () {
    it('Test empty JWT_SECRET', function () {
        sinon.stub(r, 'getCurrentUser').resolves('12344');
        const auth = new Auth({ username, password, domain });
        delete process.env.JWT_SECRET;
        return auth.auth()
            .should.rejectedWith(Error);
    });
    after(function() {
        r.getCurrentUser.restore();
    });
});