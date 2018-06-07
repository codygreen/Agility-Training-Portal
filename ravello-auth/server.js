/**
 * Copyright 2018 F5 Networks, Inc.
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
const grpc = require('grpc');
const proto = grpc.load('./ravello-auth.proto');
const server = new grpc.Server();
const RavelloAuth = require('./ravello');

function main () {
    server.addService(proto.ravelloauth.RavelloAuth.service, {
        auth: (call, callback) => {
            let a = null;
            try {
                a = new RavelloAuth({
                    username: call.request.username,
                    password: call.request.password,
                    domain: call.request.domain
                });
            } catch(err) {
                console.error(err);
                callback(err);
                return;
            };
            
            a.auth()
                .then(res => {
                    callback(null, { jwt: res });
                    return;
                })
                .catch(err => {
                    callback(err);
                    return;
                });
        }
    });
    
    server.bind('0.0.0.0:50051',
        grpc.ServerCredentials.createInsecure());
    console.log('Server running at http://0.0.0.0:50051');
    server.start();
}

main();