(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("initialize.js", function(exports, require, module) {
'use strict';

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $headerInput = (0, _jquery2.default)('.header__search');
var $headerBuffer = (0, _jquery2.default)('.header__search-buffer');
$headerInput.on('input', function () {
  $headerBuffer.text($headerInput.val());
  $headerInput.width($headerBuffer.width());
});

var newCalendar = function newCalendar(year, attrCalendarsBody, calendarAllLinks, attrCalendarMonth, parentsYearClassName) {
  for (var j = 0; j < 12; j++) {
    var D1 = new Date(year, j);
    var D1last = new Date(D1.getFullYear(), D1.getMonth() + 1, 0).getDate(); // последний день месяца
    var D1Nlast = new Date(D1.getFullYear(), D1.getMonth(), D1last).getDay(); // день недели последнего дня месяца
    var D1Nfirst = new Date(D1.getFullYear(), D1.getMonth(), 1).getDay(); // день недели первого дня месяца
    var calendar1 = '<tr>';
    var month = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']; // название месяца, вместо цифр 0-11

    // пустые клетки до первого дня текущего месяца
    if (D1Nfirst !== 0) {
      for (var i = 1; i < D1Nfirst; i++) {
        calendar1 += '<td>';
      }
    } else {
      // если первый день месяца выпадает на воскресенье, то требуется 7 пустых клеток
      for (var l = 0; l < 6; l++) {
        calendar1 += '<td>';
      }
    }

    // дни месяца
    for (var daysMonth = 1; daysMonth <= D1last; daysMonth++) {
      if (daysMonth !== D1.getDate()) {
        calendar1 += '<td>' + '<a href="#" class="day-link">' + daysMonth + '</a>';
      } else {
        calendar1 += '<td id="today">' + '<a href="#" class="day-link">' + daysMonth + '</a>';
      }
      if (new Date(D1.getFullYear(), D1.getMonth(), daysMonth).getDay() === 0) {
        // если день выпадает на воскресенье, то перевод строки
        calendar1 += '<tr>';
      }
    }

    // пустые клетки после последнего дня месяца
    if (D1Nlast !== 0) {
      for (var k = D1Nlast; k < 7; k++) {
        calendar1 += '<td>';
      }
    }

    var classElementCalendarsTbody = attrCalendarsBody;
    var classElementCalendarsMonth = attrCalendarMonth;

    var calendarsTbody = document.querySelectorAll(classElementCalendarsTbody);

    var calendarsMonth = document.querySelectorAll(classElementCalendarsMonth);

    calendarsTbody[j].innerHTML = calendar1;
    calendarsMonth[j].innerHTML = month[D1.getMonth()];
  }

  var dayLinks = document.querySelectorAll(calendarAllLinks);
  var newDayLinks = [].slice.call(dayLinks);

  var classElementDayLinkDigit = parentsYearClassName;
  var newClassElementDayLinkDigit = [].slice.call(dayLinks);

  for (var m = 0; dayLinks.length > m; m++) {
    var monthDigit = newDayLinks[m].closest('.calendar-digits').getAttribute('data-month');
    var yearDigit = newClassElementDayLinkDigit[m].closest(classElementDayLinkDigit).getAttribute('data-year');

    newDayLinks[m].setAttribute('href', 'index' + '#' + newDayLinks[m].textContent + '/' + monthDigit + '/' + yearDigit);
  }
};

newCalendar(2017, '.calendar__wrapper-2017 .calendar-digits tbody', '.calendar__wrapper-2017 .day-link', '.calendar__wrapper-2017 .month', '.calendar__wrapper-2017');

newCalendar(2016, '.calendar__wrapper-2016 .calendar-digits tbody', '.calendar__wrapper-2016 .day-link', '.calendar__wrapper-2016 .month', '.calendar__wrapper-2016');

});

require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map