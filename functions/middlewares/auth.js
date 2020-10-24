const { admin, db } = require('../utils/admin');

module.exports.auth = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split('Bearer ')[1];
  } else {
    return res.status(403).json({ errors: { message: 'Unauthorized' } });
  }
  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      req.user = decodedToken;
      return db
        .collection('users')
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.username = data.docs[0].data().username;
      return next();
    })
    .catch((err) => {
      if (err.code === 'auth/id-token-expired') {
        return res.status(400).json({ errors: { message: 'token expired' } });
      }
      if (err.code === 'auth/argument-error') {
        return res.status(400).json({ errors: { message: 'invalid token' } });
      }
      console.log('Errror during verifiying the token', err);
      return res.status(403).json(err);
    });
};
