const PostgresStore = require('../../utils/PostgresStore.js');
const PlatformRole = require('../platform-role.model.js');
const RoleAccessRight = require('../role-access-right.model.js');

class PlatformPolicy {
  /**
   * @param {Number} userId
   * @param {String} right
   * @returns {Promise<Boolean>}
   */
  static async hasAccessRight (userId, right) {
    // ici, on vérifie de manière globale sur toute la plateforme si l'utilisateur a un rôle
    // qui correspond à un certain droit d'accès (right)
    const result = await PostgresStore.client.query({
      text: `SELECT 1 FROM ${PlatformRole.tableName} AS r
      LEFT JOIN ${RoleAccessRight.tableName} AS ar
        ON r.role_id=ar.role_id
      WHERE r.user_id=$1
        AND ar.access_right=$2
      LIMIT 1`,
      values: [userId, right]
    });
    return !!result.rows.length; // si aucune valeur n'est retournée, alors l'utilisateur n'a pas le droit
  }
}

module.exports = PlatformPolicy;
