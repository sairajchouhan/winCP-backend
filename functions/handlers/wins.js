const { db } = require('../utils/admin');

module.exports.getAllWins = (req, res) => {
  let wins = [];

  db.collection('wins')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      data.forEach((doc) => {
        wins.push({
          id: doc.id,
          body: doc.data().body,
          username: doc.data().username,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(wins);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: 'Server Error:' });
    });
};

module.exports.postOneWin = (req, res) => {
  const { body } = req.body;
  console.log(req.user.username);
  const newWin = {
    username: req.user.username,
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
};

module.exports.getWin = (req, res) => {
  let winData = {};
  db.doc(`/wins/${req.params.winId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Win not found' });
      }
      winData = doc.data();
      winData.winId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('winId', '==', req.params.winId)
        .get();
    })
    .then((data) => {
      winData.comments = [];
      data.forEach((doc) => {
        winData.comments.push(doc.data());
      });
      return res.json(winData);
    })
    .catch((err) => {
      return res.status(500).json({ error: 'Server Error', data: err.message });
    });
};
