/* eslint camelcase: 0 */
const PostgresStore = require('../utils/PostgresStore.js');

class Role {
  /** @type {Number} */
  id;
  /** @type {String} */
  name;
  /** @type {Date} */
  creation_date;
  /** @type {String[]} */
  access_rights;
  
  /**
   * @returns {Promise<Role[]>}
   */
  static async getAllWithAccessRights () {
    const RoleAccessRight = require('./role-access-right.model.js');
    const { rows: roles } = await PostgresStore.client.query({
      text: `SELECT * FROM ${Role.tableName}`
    });
    const { rows: accessRights } = await PostgresStore.client.query({
      text: `SELECT * FROM ${RoleAccessRight.tableName}`
    });
    roles.forEach(r => {
      r.access_rights = accessRights.filter(ar => ar.role_id === r.id);
    });
    return roles;
  }

  /**
   * @returns {Promise<Role[]>}
   */
  static async getAll () {
    const result = await PostgresStore.client.query({
      text: `SELECT * FROM ${Role.tableName} ORDER BY id`
    });
    return result.rows;
  }

  /**
    * @param {Number} id
    * @param {String} name */
  static async update (id, name) {
    await PostgresStore.client.query({
      text: `UPDATE ${Role.tableName} SET name = $2 WHERE id=$1`,
      values: [id, name]
    });
  }

  /** @param {{name: String}} params */
  static async create (params) {
    const result = await PostgresStore.client.query({
      text: `INSERT INTO ${Role.tableName} (name, creation_date) VALUES (name, creation_date)
        RETURNING *`,
      values: [params.name, new Date()]
    });
    return result.rows[0];
  }

  static toSqlTable () {
    return `
    CREATE TABLE ${Role.tableName} (
      id SERIAL PRIMARY KEY,
      name TEXT,
      creation_date TIMESTAMPTZ NOT NULL
    )`;
  }

  /**
   * Cette fonction initalise les différents rôles sur la plateforme
   * Les rôles créés par défaut sont ADMIN, TEACHER, et STUDENT
   * Cette fonction est appelée dans utils/PostgresStore.js
   */
  static async initScript () {
    const RoleAccessRight = require('./role-access-right.model.js');
    const accessRight = require('./access-rights.definition.js');
    const {
      rows: [adminRole, teacherRole, studentRole]
    } = await PostgresStore.client.query({
      text: `INSERT INTO ${Role.tableName} (name, creation_date)
        VALUES ($2, $1), ($3, $1), ($4, $1)
      RETURNING *`,
      values: [new Date(), 'ADMIN', 'TEACHER', 'STUDENT']
    });

    const studentRights = [
      accessRight.exercise.do,
      accessRight.exercise.view,
      accessRight.session.view,
      accessRight.session.do,
      accessRight.module.view,
      accessRight.module.participate
    ];

    const teacherRights = [
      ...studentRights,
      accessRight.exercise_attempt.delete,
      accessRight.module.edit,
      accessRight.user.see_dashboard
    ];

    const adminRights = [
      ...teacherRights,
      accessRight.module.delete,
      accessRight.module.create,
      accessRight.module.edit_admin,
      accessRight.user.view,
      accessRight.user.manage,
      accessRight.role.manage,
      accessRight.role.add_to_user
    ];

    await PostgresStore.client.query({
      text: `INSERT INTO ${RoleAccessRight.tableName} (role_id, access_right)
        VALUES ${adminRights.map((_, i) => `($1, $${i + 2})`).join(', ')}
      RETURNING *`,
      values: [adminRole.id, ...adminRights]
    });

    await PostgresStore.client.query({
      text: `INSERT INTO ${RoleAccessRight.tableName} (role_id, access_right)
        VALUES ${teacherRights.map((_, i) => `($1, $${i + 2})`).join(', ')}
      RETURNING *`,
      values: [teacherRole.id, ...teacherRights]
    });

    await PostgresStore.client.query({
      text: `INSERT INTO ${RoleAccessRight.tableName} (role_id, access_right)
        VALUES ${studentRights.map((_, i) => `($1, $${i + 2})`).join(', ')}
      RETURNING *`,
      values: [studentRole.id, ...studentRights]
    });
  }
}

/** @type {String} */
Role.tableName = 'role';

module.exports = Role;
