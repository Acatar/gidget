var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'gidget', subTitle: 'A DSL for JavaScript SPAs and Node.js servers inspired by NancyFx and Sinatra' });
});

router.get('/require_sammy', function(req, res) {
  res.render('sammy_require', { title: 'gidget with the Sammy Bootstrapper and require.js' });
});

router.get('/sammy_hilary', function(req, res) {
  res.render('sammy_hilary', { title: 'gidget with the Sammy Bootstrapper and hilary' });
});

module.exports = router;
