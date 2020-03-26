const Module = require('../models/module.model.js');
const PlatformPolicy = require('../models/policies/platform.policy.js');
const accessRights = require('../models/access-rights.definition.js');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getModules (req, res, next) {
  try {
    // si l'utilisateur a le droit module.view sur toute la plateforme,
    // on lui retourne tous les modules
    if (PlatformPolicy.hasAccessRight(req.session.userId, accessRights.module.view)) {
      res.json(await Module.getAll());
      return;
    }

    // si l'utilisateur n'a pas de droits globaux, on lui retourne la liste
    // des modules pour lesquels ils a un rôle
    res.json(await Module.getByUserId(req.session.userId));
  } catch (err) {
    next(err);
  }
}

module.exports = getModules;
