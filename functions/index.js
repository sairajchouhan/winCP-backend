const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// ********************** MIDDLEWARES AND CONFIGS **********************
const app = express();
app.set(express.json());
const whitelist = ['http://localhost:3000'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      // eslint-disable-next-line callback-return
      callback(null, true);
    } else {
      // eslint-disable-next-line callback-return
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors(corsOptions));
// ********************** MIDDLEWARES AND CONFIGS--END ******************

// ********************** FILE IMPORTS **********************
const { getAllWins, postOneWin } = require('./handlers/wins');
const { signup, login } = require('./handlers/users');
const { auth } = require('./middlewares/auth');
// ********************** FILE IMPORTS--END ******************

app.get('/wins', auth, getAllWins);
app.post('/wins', auth, postOneWin);
app.post('/signup', signup);
app.post('/login', login);

exports.api = functions.https.onRequest(app);
