const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const { db } = require('./utils/admin');

// ********************** MIDDLEWARES AND CONFIGS **********************
const app = express();
app.set(express.json());
app.use(express.static(`${__dirname}/public`));
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
  markNotificationsAsRead,
  deleteAComment,
  editAComment,
  getAllWinsOfAUser,
} = require('./handlers/wins');
const {
  signup,
  login,
  resetPassword,
  updateUserDetails,
  getAuthenticatedUser,
  getUserDetails,
} = require('./handlers/users');
const { auth } = require('./middlewares/auth');
// ********************** FILE IMPORTS--END ******************

// wins routes
app.get('/wins', auth, getAllWins);
app.get('/wins/:username', auth, getAllWinsOfAUser);
app.get('/win/:winId', auth, getWin);
app.get('/win/:winId/unlike', auth, unlikeWin);
app.get('/win/:winId/like', auth, likeWin);
app.post('/wins', auth, postOneWin);
app.post('/win/:winId/comment', auth, commentOnWin);
app.put('/win/:winId/:commentId', auth, editAComment);
app.delete('/win/:winId', auth, deleteWin);
app.delete(`/win/:winId/:commentId`, auth, deleteAComment);

// auth routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/reset-password', resetPassword);

// user routes
app.post('/user', auth, updateUserDetails);
app.get('/user', auth, getAuthenticatedUser);
app.get('/user/:username', auth, getUserDetails);
app.post('/notifications', markNotificationsAsRead);

app.get('/', (req, res) => {
  res.send('Cloud functions is working');
});

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
  .document('likes/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`wins/${snapshot.data().winId}`)
      .get()
      .then((doc) => {
        // eslint-disable-next-line promise/always-return
        if (doc.exists && doc.data().username !== snapshot.data().username) {
          return db.collection('notifications').doc(snapshot.id).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().username,
            sender: snapshot.data().username,
            type: 'like',
            read: false,
            winId: doc.id,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.deleteNotificationOnUnlike = functions.firestore
  .document('likes/{id}')
  .onDelete((snapshot) => {
    return db
      .doc(`notifications/${snapshot.id}`)
      .delete()
      .catch((err) => console.error(err));
  });

exports.createNotificationOnComment = functions.firestore
  .document('comments/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/wins/${snapshot.data().winId}`)
      .get()
      .then((doc) => {
        // eslint-disable-next-line promise/always-return
        if (doc.exists && doc.data().username !== snapshot.data().username) {
          return db.doc(`notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().username,
            sender: snapshot.data().username,
            type: 'comment',
            read: false,
            winId: doc.id,
          });
        }
      })
      .catch((err) => console.error(err));
  });
