function parseRedialSpec(spec) {
  var redialObject = [];

  var inBrace = false;
  var braceData = [];
  var inPart = false;
  var part = '';

  for (var i = 0; i < spec.length; i++) {
    var c = spec[i];

    if (c == '{') {
      inBrace = true;
    } else if (c == ',' && inBrace) {
      braceData.push(part);
      part = '';
    } else if (c == '}') {
      inBrace = false;
      braceData.push(part);
      redialObject.push({
        type: 'brace',
        data: braceData
      });

      braceData = [];
      part = '';
    } else {
      if (inBrace) {
        part += c;
      } else {
        redialObject.push({
          type: 'digit',
          data: c
        });
      }
    }
  }

  return redialObject;
}

function processRedialObject(object) {
  var number = '';

  for (var i = 0; i < object.length; i++) {
    var e = object[i];

    if (e.type == 'digit') {
      switch (e.data.toLowerCase()) {
        case 'x':
          number += getRandomInt(0, 10);
        break;
        case 'z':
          number += getRandomInt(1, 10);
        break;
        case 'n':
          number += getRandomInt(2, 10);
        break;
        default:
          number += e.data;
      }
    } else if (e.type == 'brace') {
      number += e.data[getRandomInt(0, e.data.length)];
    }
  }

  return number;
}

