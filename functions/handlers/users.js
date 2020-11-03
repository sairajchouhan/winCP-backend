const { db, admin } = require('../utils/admin');
const config = require('../utils/config');
const firebase = require('firebase');
const {
  validateLoginData,
  validateSignupData,
  reduceUserDetails,
} = require('../utils/helpers');
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

  if (!valid) return res.status(400).json({ errors });

  db.doc(`/users/${username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ errors: { username: 'Username is taken' } });
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
      console.log(err);
      if (err.code === 'auth/email-already-in-use') {
        return res
          .status(400)
          .json({ errors: { email: 'Email already exists' } });
      }
      if (err.code === 'auth/weak-password') {
        return res.status(400).json({
          errors: { password: 'Password should be at least 6 characters' },
        });
      } else {
        return res.status(500).json({
          errors: { message: 'Something went wrong, Please try again' },
        });
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
      console.log(err);
      if (err.code === 'auth/invalid-email') {
        return res
          .status(400)
          .json({ errors: { email: 'Enter a valid email adress' } });
      }
      return res.status(400).json({
        errors: { message: 'Invalid credentials' },
      });
    });
};

module.exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`users/${req.user.username}`)
    .get()
    .then((doc) => {
      userData.info = doc.data();
      return db
        .collection('likes')
        .where('username', '==', req.user.username)
        .get();
    })
    .then((data) => {
      userData.likes = [];
      data.forEach((doc) => {
        userData.likes.push(doc.data());
      });
      return db
        .collection('notifications')
        .where('recipient', '==', req.user.username)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
    })
    .then((data) => {
      userData.notifications = [];
      data.forEach((doc) => {
        userData.notifications.push({
          recipient: doc.data().recipient,
          sender: doc.data().sender,
          createdAt: doc.data().createdAt,
          winId: doc.data().winId,
          type: doc.data().type,
          read: doc.data().read,
          notificationId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      return res.status(500).json({ errors: err });
    });
};

module.exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);
  db.doc(`users/${req.user.username}`)
    .update(userDetails)
    .then(() => res.json({ message: 'User details added successfully' }))
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ errors: err });
    });
};

module.exports.getUserDetails = (req, res) => {
  let userData = {};
  db.doc(`users/${req.params.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.info = doc.data();
        return db
          .collection('wins')
          .where('username', '==', req.params.username)
          .get();
      } else {
        return res.status(404).json({ error: { message: 'user not found' } });
      }
    })
    .then((data) => {
      userData.wins = [];
      data.forEach((doc) => {
        userData.wins.push({
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          username: doc.data().username,
          likesCount: doc.data().likesCount,
          commentsCount: doc.data().commentsCount,
          winId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      return res.status(500).json({ error: { message: err.message } });
    });
};
