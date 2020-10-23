const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');
const express = require('express');
const app = express();
app.set(express.json());

// ********************** FIREBASE SETUP **********************
admin.initializeApp();
const db = admin.firestore();
const firebaseConfig = {
  apiKey: 'AIzaSyDfLs8CW5IXEv_KpHm0GX6TcAnLL2_0E-I',
  authDomain: 'wincp-9d49a.firebaseapp.com',
  databaseURL: 'https://wincp-9d49a.firebaseio.com',
  projectId: 'wincp-9d49a',
  storageBucket: 'wincp-9d49a.appspot.com',
  messagingSenderId: '596475602299',
  appId: '1:596475602299:web:6e1f9892bf401281e249de',
  measurementId: 'G-X6MJG1T4QY',
};
firebase.initializeApp(firebaseConfig);

app.get('/wins', (req, res) => {
  let wins = [];
  db.collection('wins')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      data.forEach((doc) => {
        wins.push({
          id: doc.id,
          body: doc.data().body,
          username: doc.data().body,
          createdAt: doc.data().createdAt,
          likesCount: doc.data().likesCount,
          commentsCount: doc.data().commentsCount,
        });
      });
      return res.json(wins);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: 'Server Error:' });
    });
});

app.post('/wins', (req, res) => {
  const { body, username } = req.body;
  const newWin = {
    username,
    body,
    createdAt: new Date().toISOString(),
    likesCount: 0,
    commentsCount: 0,
  };
  db.collection('wins')
    .add(newWin)
    .then((data) => {
      return res.json({
        message: 'Document created successfully',
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: 'Server Error', data: err.message });
    });
});

app.post('/signup', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  const newUser = { username, email, password, confirmPassword };
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((user) => {
      return res.status(201).json('user created sucessfully');
    })
    .catch((err) => {
      console.log(err.code);
      return res.status(500).json({ error: err.message });
    });
});

exports.api = functions.https.onRequest(app);
