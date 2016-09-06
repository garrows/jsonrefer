# JsonRefer

Automatically convert javascript objects to have JSON references. It works by traversing the object looking for ID patterns and looking for objects with a matching key.

## Usage

### Matching objects with IDs

```javascript

var jsonRefer = require('jsonrefer')({
  idPattern: /^[a-f0-9]{3}$/, // Look for values that match this regex
  referenceObject: /references/ // Skip this object when referencing
})

var input = {
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

var output = jsonRefer( input )

console.log(output)
{
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
    id: '999' // Didn't find a match. Ignored.
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
```

### Matching IDs in an array

```javascript

var jsonRefer = require('jsonrefer')({
  idPattern: /^[a-f0-9]{3}$/, // Look for values that match this regex
  referenceObject: /references/ // Skip this object when referencing
})

var input = {
  name: 'turkey',
  features: [
    '123',
    '456',
    '999'
  ],
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

var output = jsonRefer( input )

console.log(output)
{
  name: 'turkey',
  features: [ // ID array unmodified
    '123',
    '456',
    '999'
  ],
  thing: [{ // Names inferred from the referenced object
    '$ref': '#/references/thing/123'
  }],
  otherThing: [{
    '$ref': '#/references/otherThing/456'
  }],
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
```


## Install

```bash
npm install --save jsonrefer
```

## Testing

```bash
git clone git@github.com:garrows/jsonrefer.git
cd jsonrefer
npm install
npm test
```
