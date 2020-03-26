const Module = require('../models/module.model.js');
const PlatformPolicy = require('../models/policies/platform.policy.js');
const accessRights = require('../models/access-rights.definition.js');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function postModule (req, res) {
  if (!await PlatformPolicy.hasAccessRight(req.session.userId, accessRights.module.create)) {
    res
      .status(401)
      .send('Unauthorized');
    return;
  }
  // créer l'objet module et l'envoyer
  res.json(await Module.create(req.body));
}

module.exports = postModule;
