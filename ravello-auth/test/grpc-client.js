const grpc = require('grpc');

const proto = grpc.load('../ravello-auth.proto');
const dotenv = require('dotenv').config();

const client = new proto.ravelloauth.RavelloAuth('0.0.0.0:50051', 
    grpc.credentials.createInsecure());

client.auth({
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    domain: process.env.DOMAIN
}, (error, response) => {
    if(!error) {
        console.log('Response: ', response);
    } else {
        console.log('Error: ', error.message);
    }
});