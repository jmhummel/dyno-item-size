var dynoItemSize = module.exports = function(record) {
  return Object.keys(record).reduce(function(s, k) {
    var v = record[k];

    // Attribute name:
    // number of UTF-8-encoded bytes
    s += new Buffer(k, 'utf8').length;
    s += sizeOfValue(v);
    
    return s;
  }, 0);
};

module.exports.sizeOfValue = function(value) {
  var s = 0;
  // String value
  // Strings are Unicode with UTF-8 binary encoding. The size of a string is 
  // (length of attribute name) + (number of UTF-8-encoded bytes)
  if (typeof v === 'string') {
    s += new Buffer(v, 'utf8').length;
  }
  // Number value
  // Numbers are variable length, with up to 38 significant digits. 
  // Leading and trailing zeroes are trimmed. The size of a number is approximately 
  // (length of attribute name) + (1 byte per two significant digits) + (1 byte).
  else if(typeof v === 'number') {
    var len = v.toString(2).length;
    len = len > 38 ? 38 : len;
    s += Math.ceil(len/2) + 1;
  }
  // Boolean value
  // The size of a null attribute or a Boolean attribute is (length of attribute name) + (1 byte)
  else if(typeof v === 'boolean') {
    s += 1
  }
  // List or Map value
  // An attribute of type List or Map requires 3 bytes of overhead, 
  // regardless of its contents. The size of a List or Map is 
  // (length of attribute name) + sum (size of nested elements) + (3 bytes) . 
  // The size of an empty List or Map is 
  // (length of attribute name) + (3 bytes).
  else if (typeof v === 'object' && Array.isArray(v)) {
    s += 3
    // List value
    // Calulates size of elements by 
    if (Array.isArray(v)) {
      s += v.reduce(function(s, v) {
        return s + sizeOfValue(v);
      }, 0);
    } 
    // Map value
    else {
      s += dynoItemSize(v);
    }
    // unknown type
    else s += v.length;
  }
  return s;  
}

module.exports.read = function(record) {
  var size = dynoItemSize(record);
  return Math.ceil(size/1024/4);
};

module.exports.write = function(record) {
  var size = dynoItemSize(record);
  return Math.ceil(size/1024);
};

module.exports.storage = function(record) {
  var size = dynoItemSize(record);
  return size + 100;
};
