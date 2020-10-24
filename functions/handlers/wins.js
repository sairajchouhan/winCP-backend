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
};

module.exports.postOneWin = (req, res) => {
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
};
