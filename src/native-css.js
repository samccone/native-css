'use strict';

var packageJson = require('../package.json'),
  lib = require('../lib'),
  cssParser = require('css'),
  fetchUrl = require('fetch').fetchUrl;

var nativeCSS = function () { };

nativeCSS.prototype.version = function () {
  return ('native-css version: ' + packageJson.version)
}

nativeCSS.prototype.help = function () {
  return lib.readFile(__dirname + '/../docs/help.md')
}

nativeCSS.prototype.indentObject = function (obj, indent) {
  var self = this,
    result = '';
  return JSON.stringify(obj, null, indent || 0);
}

nativeCSS.prototype.nameGenerator = function (name) {
  name = name.replace(/\s\s+/g, ' ');
  name = name.replace(/[^a-zA-Z0-9]/g, '_');
  name = name.replace(/^_+/g, '');
  name = name.replace(/_+$/g, '');
  return name;
}

nativeCSS.prototype.mediaNameGenerator = function (name) {
  return '@media ' + name;
}

function transformRules(self, rules, result) {
  rules.forEach(function (rule) {
    var obj = {};
    if (rule.type === 'media') {
      var name = self.mediaNameGenerator(rule.media);
      var media = result[name] = result[name] || {
        "__expression__": rule.media
      };
      transformRules(self, rule.rules, media)
    } else if (rule.type === 'rule') {
      rule.declarations.forEach(function (declaration) {
        if (declaration.type === 'declaration') {
          var cssProperty = lib.camelize(declaration.property)
          obj[cssProperty] = declaration.value;
        }
      });
      rule.selectors.forEach(function (selector) {
        var name = self.nameGenerator(selector.trim());
        result[name] = obj;
      });
    }
  });
}

nativeCSS.prototype.transform = function (css) {
  var result = {};
  transformRules(this, css.stylesheet.rules, result);
  return result;
}

nativeCSS.prototype.convert = function (css) {
  return self.transform(cssParser.parse(css, {
    silent: false,
    source: ''
  }));
}

module.exports = new nativeCSS();
