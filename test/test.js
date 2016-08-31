/* eslint-env mocha */

require('should')
var jsonRefs = require('json-refs')

describe('JsonRefer', function () {
  describe('Normal operation', function () {
    var INPUT = {
      name: 'turkey',
      features: [ {
        id: '123'
      }, {
        id: '456'
      }, {
        id: '999'
      } ],
      references: {
        thing: {
          '123': {
            id: '123',
            value: 'gobble'
          }
        },
        otherThing: {
          '456': {
            id: '456',
            value: 'ridiculousness'
          }
        }
      }
    }

    var INPUT_COPY = JSON.parse(JSON.stringify(INPUT))

    var EXPECTED_OUTPUT = {
      name: 'turkey',
      features: [ {
        id: '123',
        thing: {
          '$ref': '#/references/thing/123'
        }
      }, {
        id: '456',
        otherThing: {
          '$ref': '#/references/otherThing/456'
        }
      }, {
        id: '999'
      } ],
      references: {
        thing: {
          '123': {
            id: '123',
            value: 'gobble'
          }
        },
        otherThing: {
          '456': {
            id: '456',
            value: 'ridiculousness'
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
      resolved.features[0].thing.should.have.property('value', 'gobble')
      resolved.features[1].otherThing.should.have.property('value', 'ridiculousness')
      resolved.features[2].should.not.have.property('thing')
      resolved.features[2].should.not.have.property('otherThing')
    })
  })
})
