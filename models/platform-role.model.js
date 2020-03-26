/* eslint camelcase: 0 */
const PostgresStore = require('../utils/PostgresStore.js');
const Role = require('./role.model.js');

/**
 * Roles that apply to the whole platform
 * Mainly necessary to be able to manage modules and users
 */
class PlatformRole {
  /** @type {Number} */
  user_id;
  /** @type {Number} */
  role_id;

  /**
   * @param {Number} userId
   * @return {Promise<{ id: Number, name: String }>}
   */
  static async getUserRole (userId) {
    const result = await PostgresStore.client.query({
      text: `SELECT role.id as id, role.name as name FROM ${Role.tableName} as role
        LEFT JOIN ${PlatformRole.tableName} AS pr
          ON pr.role_id = role.id
        WHERE pr.user_id = $1
        LIMIT 1`,
      values: [userId]
    });
    return result.rows[0];
  }

  /**
   * @param {Number} userId
   */
  static async remove (userId) {
    await PostgresStore.client.query({
      text: `DELETE FROM ${PlatformRole.tableName} WHERE user_id=$1`,
      values: [userId]
    });
  }

  /**
   * @param {Number} userId
   * @param {Number} roleId
   */
  static async add (userId, roleId) {
    await PostgresStore.client.query({
      text: `INSERT INTO ${PlatformRole.tableName} (user_id, role_id) VALUES ($1, $2)
        ON CONFLICT (user_id, role_id)
        DO UPDATE
         SET role_id = $2
      `,
      values: [userId, roleId]
    });
  }

  static toSqlTable () {
    const User = require('./user.model.js');
    return [`
      CREATE TABLE ${PlatformRole.tableName} (
        user_id INTEGER REFERENCES ${User.tableName}(id),
        role_id INTEGER REFERENCES ${Role.tableName}(id)
      )`,
      `ALTER TABLE ${PlatformRole.tableName} ADD UNIQUE(user_id, role_id)`
    ];
  }
}

/** @type {String} */
PlatformRole.tableName = 'platform_role';

module.exports = PlatformRole;
