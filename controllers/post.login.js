const User = require('../models/user.model.js');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function postLogin (req, res) {
  // si l'utilisateur est déjà connecté, alors on lui retourne Unauthorized
  if (req.session.userId) {
    res.status(401)
      .send('Already authenticated');
    return;
  }
  // on vérifie l'email et le mot de passe de l'utilisateur
  const user = await User.verifyUser(req.body.email, req.body.password);

  // si on a trouvé un utilisateur correspondant, alors on sauvegarde son ID
  // dans l'objet req.session
  if (user) {
    req.session.userId = user.id;
    res.json(user);
    return;
  }

  // si on n'a pas trouvé d'utilisateur, alors on retourne une erreur 401 (unauthorized)
  res.status(401)
    .send('Unknown email or password');
}

module.exports = postLogin;
