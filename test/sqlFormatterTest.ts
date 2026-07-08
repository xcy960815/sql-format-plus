import sqlFormatter from './../src/sql-format-plus/sqlFormatter'

import assert from 'assert'

describe('sqlFormatter', function () {
  it('throws error when unsupported language parameter specified', function () {
    assert.throws(() => {
      sqlFormatter.format('SELECT *', { language: 'blah' as never })
    }, new Error('Unsupported SQL dialect: blah'))
  })
})
