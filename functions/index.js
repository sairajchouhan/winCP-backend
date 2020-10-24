const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
const express = require('express');
const app = express();
app.set(express.json());

// const { auth } = require('./middlewares/auth');

// ********************** FILE IMPORTS **********************

const { getAllWins, postOneWin } = require('./handlers/wins');
const { signup, login } = require('./handlers/users');
const { auth } = require('./middlewares/auth');

// ********************** FILE IMPORTS--END **********************

app.get('/wins', auth, getAllWins);
app.post('/wins', auth, postOneWin);
app.post('/signup', signup);
app.post('/login', login);

app.get('/adsf', (req, res) => {
  res.send('asdf');
});

exports.api = functions.https.onRequest(app);
