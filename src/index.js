var traverse = require('traverse')

var JsonRefer = function (options) {
  options = options || {}
  if (!options.idPattern) throw new Error('Module jsonrefer requires options.idPattern')
  if (!options.referenceObject) throw new Error('Module jsonrefer requires options.referenceObject')
  if (options.idPattern && options.idPattern instanceof RegExp === false) throw new Error('Module jsonrefer requires options.idPattern to be a regular expression')
  if (options.referenceObject && options.referenceObject instanceof RegExp === false) throw new Error('Module jsonrefer requires options.referenceObject to be a regular expression')

  return function (input) {
    // Completely dereference
    var data = JSON.parse(JSON.stringify(input))

    var referencedData = {}

    // Find all referencedData
    traverse(data).reduce(function (acc, x) {
      if (options.referenceObject && options.referenceObject.test(this.key)) {
        this.isReferenceData = true
        return
      }
      // We are in the reference data. Look for the right key
      if (this.parent && this.parent.isReferenceData) {
        this.isReferenceData = true
        if (options.idPattern.test(this.key)) {
          referencedData[this.key] = {
            ref: '#/' + this.path.join('/'),
            nameOfObject: this.path[this.path.length - 2] // TODO: test and break this
          }
        }
        return
      }
      return acc
    }, {})

    // Find id values to referencedData
    traverse(data).reduce(function (acc, x) {
      if (options.referenceObject && options.referenceObject.test(this.key)) {
        this.isReferenceData = true
        return
      }
      // Its a reference so skip it and its children
      if (this.parent && this.parent.isReferenceData) {
        this.isReferenceData = true
        return
      }
      if (options.idPattern.test(x)) {
        if (referencedData[x]) {
          var ref = referencedData[x].ref
          var nameOfObject = referencedData[x].nameOfObject
          this.parent.node[nameOfObject] = {
            '$ref': ref
          }
        }
      }
      return acc
    }, {})

    return data
  }
}

module.exports = JsonRefer
