const { db, admin } = require('../utils/admin');
const config = require('../utils/config');
const firebase = require('firebase');
const multer = require('multer');
const { validateLoginData, validateSignupData } = require('../utils/helpers');
firebase.initializeApp(config);

// eslint-disable-next-line consistent-return
module.exports.signup = (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  let userId = '';
  let token = '';
  const { valid, errors } = validateSignupData(
    username,
    email,
    password,
    confirmPassword
  );
  console.log('I am testing the validity of the valid', valid);

  if (!valid) return res.status(400).json({ errors });

  db.doc(`/users/${username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.json({ errors: { username: 'Username is taken' } });
      } else {
        return firebase.auth().createUserWithEmailAndPassword(email, password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((tok) => {
      token = tok;
      const newUser = {
        username,
        email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`users/${newUser.username}`).set(newUser);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      if (err.code === 'auth/email-already-in-use') {
        return res
          .status(400)
          .json({ errors: { email: 'Email already exists' } });
      } else {
        return res.status(500).json({ errors: err });
      }
    });
};

// eslint-disable-next-line consistent-return
module.exports.login = (req, res) => {
  const { email, password } = req.body;
  const { valid, errors } = validateLoginData(email, password);
  if (!valid) return res.status(400).json({ errors });

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((data) => data.user.getIdToken())
    .then((token) => res.json({ token }))
    .catch((err) => {
      if (err.code === 'auth/invalid-email') {
        return res
          .status(400)
          .json({ errors: { message: 'Enter a valid email adress' } });
      } else if (err.code === 'auth/user-not-found') {
        return res.status(400).json({
          errors: { message: 'User not found' },
        });
      } else if (err.code === 'auth/wrong-password') {
        return res.status(400).json({
          errors: { message: 'Invalid password' },
        });
      } else {
        return res.status(500).json(err);
      }
    });
};

