const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const { db } = require('./utils/admin');

// ********************** MIDDLEWARES AND CONFIGS **********************
const app = express();
app.set(express.json());
app.use(express.static(`${__dirname}/public`));
// const whitelist = ['http://localhost:3000'];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       // eslint-disable-next-line callback-return
//       callback(null, true);
//     } else {
//       // eslint-disable-next-line callback-return
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };
// app.use(cors(corsOptions));
app.use(cors());
// ********************** MIDDLEWARES AND CONFIGS--END ******************

// ********************** FILE IMPORTS **********************
const {
  getAllWins,
  postOneWin,
  getWin,
  commentOnWin,
  likeWin,
  unlikeWin,
  deleteWin,
} = require('./handlers/wins');
const {
  signup,
  login,
  addUserDetails,
  getAuthenticatedUser,
} = require('./handlers/users');
const { auth } = require('./middlewares/auth');
// ********************** FILE IMPORTS--END ******************

// wins routes
app.get('/wins', auth, getAllWins);
app.post('/wins', auth, postOneWin);
app.get('/win/:winId', auth, getWin);
app.post('/win/:winId/comment', auth, commentOnWin);
app.get('/win/:winId/like', auth, likeWin);
app.get('/win/:winId/unlike', auth, unlikeWin);
app.delete('/win/:winId', auth, deleteWin);

// user routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user', auth, addUserDetails);
app.get('/user', auth, getAuthenticatedUser);
app.post('/user', auth, addUserDetails);

app.get('/', (req, res) => {
  res.send('Cloud functions is working');
});

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
  .document('likes/{id}')
  .onCreate((snapshot) => {
    console.log(snapshot);
    console.log('I am In like notifcation trigger');
    db.doc(`wins/${snapshot.data().winId}`)
      .get()
      .then((doc) => {
        return db.collection('notifications').doc(snapshot.id).set({
          createdAt: new Date().toISOString(),
          recipient: doc.data().username,
          sender: snapshot.data().username,
          type: 'like',
          read: false,
          winId: doc.id,
        });
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.deleteNotificationOnUnlike = functions.firestore
  .document('likes/{id}')
  .onDelete((snapshot) => {
    db.doc(`notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnComment = functions.firestore
  .document('comments/{id}')
  .onCreate((snapshot) => {
    db.doc(`/wins/${snapshot.data().winId}`)
      .get()
      .then((doc) => {
        return db.doc(`notifications/${snapshot.id}`).set({
          createdAt: new Date().toISOString(),
          recipient: doc.data().username,
          sender: snapshot.data().username,
          type: 'comment',
          read: false,
          winId: doc.id,
        });
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
