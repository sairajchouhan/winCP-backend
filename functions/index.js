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

// ********************** FILE IMPORTS--END **********************

// ********************** FIREBASE SETUP **********************

// ********************** FIREBASE SETUP--END **********************

const isEmpty = (string) => {
  if (string.trim() === '') return true;
  else return false;
};

const isEmail = (email) => {
  const emailRegEx = /^(([^<>([\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  else return false;
};

app.get('/wins', getAllWins);
app.post('/wins', postOneWin);
app.post('/signup', signup);
app.post('/login', login);

app.get('/adsf', (req, res) => {
  res.send('asdf');
});

exports.api = functions.https.onRequest(app);
