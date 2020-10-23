const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();
const db = admin.firestore();

app.get('/wins', (req, res) => {
  let wins = [];
  db.collection('wins')
    .get()
    .then((data) => {
      data.forEach((doc) => {
        wins.push(doc.data());
      });
      return res.json(wins);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: 'Server Error:' });
    });
});

exports.api = functions.https.onRequest(app);
