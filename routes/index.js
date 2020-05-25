var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Yet Another chat-app' });
});
router.get('/chat', function (req, res, next) {
  const { username } = req.query;
  res.render('chat', { title: 'Yet Another chat-app', username });
});
module.exports = router;
