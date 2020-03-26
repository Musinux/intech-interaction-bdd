var express = require('express');
var router = express.Router();

const postLogin = require('../controllers/post.login.js');
const getModules = require('../controllers/get.modules.js');
const getModule = require('../controllers/get.module.js');
const postModule = require('../controllers/post.module.js');

async function isAuthenticated (req, res, next) {
  if (req.session.userId) {
    next(); // appeler next() appelle la prochaine fonction dans la liste des middlewares
    return;
  }
  res.status(401).send('unauthorized(1)');
}

router.post('/users/login', postLogin);
// on rajoute le middleware d'authentification, qui vérifie que l'utilisateur est authentifié
// si l'utilisateur n'est pas authentifié, getModules et getModule ne peuvent pas être appelés
router.get('/modules', isAuthenticated, getModules);
router.post('/module', isAuthenticated, postModule);
router.get('/module/:id', isAuthenticated, getModule);

module.exports = router;
