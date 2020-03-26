const PostgresStore = require('../../utils/PostgresStore.js');
const Module = require('../module.model.js');
const ModuleUserRole = require('../module-user-role.model.js');
const RoleAccessRight = require('../role-access-right.model.js');
const PlatformPolicy = require('./platform.policy.js');

class ModulePolicy {
  /**
   * @param {Number} userId
   * @param {Number} moduleId
   * @param {String} right
   * @returns {Promise<Boolean>}
   */
  static async hasAccessRight (userId, moduleId, right) {
    // on vérifie d'abord que l'utilisateur n'a pas des droits sur toute la plateforme
    if (await PlatformPolicy.hasAccessRight(userId, right)) return true;
    // si l'utilisateur n'a pas des droits sur toute la plateforme, alors
    // on vérifie s'il a des droits spécifiquement sur le Module
    const result = await PostgresStore.client.query({
      text: `
      SELECT 1 FROM ${Module.tableName} AS m
        LEFT JOIN ${ModuleUserRole.tableName} AS r ON m.id = r.module_id
        LEFT JOIN ${RoleAccessRight.tableName} AS ar ON r.role_id = ar.role_id
      WHERE m.id = $1
        AND r.user_id = $2
        AND ar.access_right = $3
      LIMIT 1`,
      values: [moduleId, userId, right]
    });
    return !!result.rows.length;
  }
}

module.exports = ModulePolicy;
