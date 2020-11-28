const { db } = require('../utils/admin');

module.exports.markNotificationsAsRead = (req, res) => {
  const { notificationId } = req.body;
  db.doc(`/notifications/${notificationId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(400).json({ error: 'notification not found' });
      } else if (doc.data().recipient !== req.user.username) {
        return res.status(400).json({ error: 'unauthorised' });
      } else if (doc.data().read === true) {
        return res
          .status(400)
          .json({ error: 'notification already marked as read' });
      } else {
        return doc.ref.update({ read: true });
      }
    })
    .then(() => {
      return res.json({ message: 'notification marked as read' });
    })
    .catch((err) => {
      console.log(err);
      return res.json({ err });
    });
};
