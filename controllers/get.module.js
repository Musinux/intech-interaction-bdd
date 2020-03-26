const Module = require('../models/module.model.js');
const ModulePolicy = require('../models/policies/module.policy.js');
const accessRights = require('../models/access-rights.definition.js');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getModule (req, res) {
  const moduleId = parseInt(req.params.id);
  if (!await ModulePolicy.hasAccessRight(req.session.userId, moduleId, accessRights.module.participate)) {
    res
      .status(401)
      .send('Unauthorized');
    return;
  }
  // récupérer l'objet module et l'envoyer
  res.json(await Module.getById(moduleId));
}

module.exports = getModule;
