/* eslint camelcase: 0 */
const PostgresStore = require('../utils/PostgresStore.js');
const debug = require('debug')('hephaistos:module.model.js');
const ModuleUserRole = require('./module-user-role.model.js');

class Module {
  /** @type {Number} */
  id;
  /** @type {String} */
  name;
  /** @type {Date} */
  creation_date;
  
  /**
   * @param {Number} id
   * @returns {Promise<Module>}
   */
  static async getById (id) {
    const result = await PostgresStore.client.query({
      text: `SELECT * FROM ${Module.tableName} WHERE id=$1`,
      values: [id]
    });
    return result.rows[0];
  }

  static async getAll () {
    const result = await PostgresStore.client.query(
      `SELECT id, name FROM ${Module.tableName}`
    );
    return result.rows;
  }

  /**
   * @param {Number} userId
   * @returns {Promise<Module[]>}
   */
  static async getByUserId (userId) {
    const result = await PostgresStore.client.query({
      text: `
      SELECT * FROM ${Module.tableName} AS m
        LEFT JOIN ${ModuleUserRole.tableName} AS r ON m.id=r.module_id
      WHERE r.user_id=$1`,
      values: [userId]
    });
    return result.rows;
  }

  /**
    * @param {Number} id
    * @param {String} name
    * @returns {Promise<Module>}
    */
  static async update (id, name) {
    const result = await PostgresStore.client.query({
      text: `UPDATE ${Module.tableName} SET name = $1
        WHERE id=$2 RETURNING *`,
      values: [name, id]
    });
    debug('result', result.rows[0]);
    return result.rows[0];
  }

  /**
   * @param {{name: String}} params
   * @returns {Promise<Module>}
   */
  static async create (params) {
    const result = await PostgresStore.client.query({
      text: `INSERT INTO ${Module.tableName} (name, creation_date) VALUES ($1, $2)
        RETURNING *`,
      values: [params.name, new Date()]
    });
    return result.rows[0];
  }

  static toSqlTable () {
    return `
    CREATE TABLE ${Module.tableName} (
      id SERIAL PRIMARY KEY,
      name TEXT,
      creation_date TIMESTAMPTZ NOT NULL
    )
    `;
  }
}

/** @type {String} */
Module.tableName = 'module';

module.exports = Module;
