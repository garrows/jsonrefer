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
      // It's a reference so skip it and its children
      if (this.parent && this.parent.isReferenceData) {
        this.isReferenceData = true
        return
      }

      // Check if it matches an ID
      if (options.idPattern.test(x)) {
        // Does it point to anything
        if (referencedData[x]) {
          var ref = referencedData[x].ref
          var nameOfObject = referencedData[x].nameOfObject
          var parent = findNonArrayParent(this.parent)
          if (Array.isArray(this.parent.node)) {
            if (!parent.node[nameOfObject]) {
              parent.node[nameOfObject] = []
            } else if (!Array.isArray(parent.node[nameOfObject])) {
              // Traverse gets the wrong parent when there is only 1 element in the array. Convert it to work around it.
              parent.node[nameOfObject] = [parent.node[nameOfObject]]
            }
            // Ensure uniqueness
            var exists = Array.from(parent.node[nameOfObject]).find(refObj => refObj.$ref === ref)
            if (!exists) {
              parent.node[nameOfObject].push({
                '$ref': ref
              })
            }
          } else {
            parent.node[nameOfObject] = {
              '$ref': ref
            }
          }
        }
      }
      return acc
    }, {})

    return data
  }
}

var findNonArrayParent = function (item) {
  if (!Array.isArray(item.node)) return item
  if (!item.parent || !item.parent.node) return item // Shouldn't happen
  return findNonArrayParent(item.parent)
}

module.exports = JsonRefer
