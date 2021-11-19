const functions = require('firebase-functions')
const express = require('express')
const basicAuth = require('basic-auth-connect')
const app = express()

app.all('/*', basicAuth(function(user, password) {
 return user === 'junki' && password === 'pass';
}));

app.use(express.static(__dirname + '/dist/'))

exports.app = functions.https.onRequest(app)
