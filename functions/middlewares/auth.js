const admin = require('firebase-admin');
const db = admin.firestore();

module.exports.auth = (req, res, next) => {
  console.log('middle ware request received');
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found');
    return res.status(403).json({ errors: { message: 'Unauthorized' } });
  }
  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      console.log(decodedToken);
      req.user = decodedToken;
      return db
        .collection('users')
        .where('username', '==', req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.username = data.docs[0].data().username;
      return next();
    })
    .catch((err) => {
      console.log('Errror during verifiying the token', err);
      return res.status(403).json(err);
    });
};
