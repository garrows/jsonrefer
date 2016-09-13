/* eslint-env mocha */

require('should')
var jsonRefs = require('json-refs')

describe('JsonRefer', function () {
  describe('Array of one ID', function () {
    var INPUT = {
      name: 'turkey',
      features: [
        '123'
      ],
      references: {
        thing: {
          '123': {
            id: '123',
            value: 'gobble'
          }
        }
      }
    }

    var INPUT_COPY = JSON.parse(JSON.stringify(INPUT))

    var EXPECTED_OUTPUT = {
      name: 'turkey',
      features: [
        '123'
      ],
      thing: [{
        '$ref': '#/references/thing/123'
      }],
      references: {
        thing: {
          '123': {
            id: '123',
            value: 'gobble'
          }
        }
      }
    }

    it('should work', function () {
      var jsonRefer = require('../src/index.js')({
        idPattern: /^[a-f0-9]{3}$/, // Look for values that match this regex
        referenceObject: /references/ // Skip this object when referencing
      })

      var output = jsonRefer(INPUT)
      output.should.deepEqual(EXPECTED_OUTPUT)
      INPUT.should.deepEqual(INPUT_COPY) // Make sure input hasnt been touched

      var resolved = jsonRefs.resolveLocalRefs(output).resolved
      resolved.thing[0].should.have.property('value', 'gobble')
    })
  })
})
