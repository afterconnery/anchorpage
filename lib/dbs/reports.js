var Base = require('./base')
var assert = require('assert')
var SQL = require('sql-template-strings')

// exported api
// =

class ReportsDB extends Base {
  constructor (cloud) {
    super(cloud, 'reports', 'id')
    this.sqlite = cloud.db
  }

  // basic ops
  // =

  async create (record) {
    assert(record && typeof record === 'object')
    assert(typeof record.archiveKey === 'string')
    assert(typeof record.archiveOwner === 'string')
    assert(typeof record.reportingUser === 'string')
    assert(typeof record.reason === 'string')
    let {archiveKey, archiveOwner, reportingUser, reason} = record
    await this.sqlite.run(SQL`
      INSERT INTO reports
          (archiveKey, archiveOwner, reportingUser, reason, createdAt, updatedAt)
        VALUES
          (${archiveKey}, ${archiveOwner}, ${reportingUser}, ${reason}, ${Date.now()}, ${Date.now()})
    `)
    this.emit('create', record)
    return record
  }

  async put (record) {
    assert(record && typeof record === 'object')
    assert(typeof record.id === 'number')
    record.updatedAt = Date.now()
    await this.sqlite.run(this.createUpdateQuery(record))
    this.emit('put', record)
  }

  async del (record) {
    assert(record && typeof record === 'object')
    assert(typeof record.id === 'string')
    await this.sqlite.run(SQL`DELETE FROM reports WHERE id = ${record.id}`)
    this.emit('del', record)
  }

  // getters

  async getByID (id) {
    assert(typeof id === 'string')
    return this.sqlite.get(SQL`SELECT * FROM reports WHERE id = ${id}`)
  }

  async getByArchiveKey (key) {
    assert(typeof key === 'string')
    return this.sqlite.all(SQL`SELECT * FROM reports WHERE archiveKey = ${key}`)
  }

  async getByArchiveOwner (id) {
    assert(typeof id === 'string')
    return this.sqlite.all(SQL`SELECT * FROM reports WHERE archiveOwner = ${id}`)
  }

  async getByReportingUser (id) {
    assert(typeof id === 'string')
    return this.sqlite.all(SQL`SELECT * FROM reports WHERE reportingUser = ${id}`)
  }

  list ({cursor, limit, reverse, sort} = {}) {
    // construct query
    var query = SQL`SELECT * FROM reports`
    sort = sort || 'id'
    if (cursor) {
      query.append(` WHERE ${sort} `)
      if (reverse) query.append(SQL`< ${cursor}`)
      else query.append(SQL`> ${cursor}`)
    }
    query.append(` ORDER BY ${sort}`)
    if (reverse) query.append(SQL` DESC`)
    if (limit) query.append(SQL` LIMIT ${limit}`)

    // run query
    return this.sqlite.all(query)
  }
}

module.exports = ReportsDB
