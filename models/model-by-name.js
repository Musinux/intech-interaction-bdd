const User = require('./user.model.js');
const Module = require('./module.model.js');
const Role = require('./role.model.js');
const PlatformRole = require('./platform-role.model.js');
const ModuleUserRole = require('./module-user-role.model.js');
const RoleAccessRight = require('./role-access-right.model.js');
/*
 * Ici, on exporte les modèles afin d'être capables de générer
 * de manière générique les tables dont ces modèles ont besoin
 * pour exister (cf la fonction dédiée dans utils/PostgresStore.js)
 * Ces modèles doivent être listés dans leur ordre de dépendance.
 */
module.exports = [
  User,
  Module,
  Role,
  PlatformRole,
  ModuleUserRole,
  RoleAccessRight
];
