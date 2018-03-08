webpackJsonp([0],{

/***/ 36:
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ 37:
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target) {
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(91);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ 38:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(39);


/***/ }),

/***/ 39:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(22);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _app = __webpack_require__(50);

var _app2 = _interopRequireDefault(_app);

__webpack_require__(89);

__webpack_require__(92);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Import CSS
var root = document.getElementById("app");

_reactDom2.default.render(_react2.default.createElement(_app2.default, null), root);

/***/ }),

/***/ 50:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = __webpack_require__(12);

var _Navigation = __webpack_require__(79);

var _Navigation2 = _interopRequireDefault(_Navigation);

var _Footer = __webpack_require__(81);

var _Footer2 = _interopRequireDefault(_Footer);

var _Hamburguer = __webpack_require__(82);

var _Hamburguer2 = _interopRequireDefault(_Hamburguer);

var _Homepage = __webpack_require__(83);

var _Homepage2 = _interopRequireDefault(_Homepage);

var _Calculator = __webpack_require__(84);

var _Calculator2 = _interopRequireDefault(_Calculator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Import Components


// Pages


// Components


var AppRouter = function (_React$Component) {
  _inherits(AppRouter, _React$Component);

  function AppRouter(props) {
    _classCallCheck(this, AppRouter);

    var _this = _possibleConstructorReturn(this, (AppRouter.__proto__ || Object.getPrototypeOf(AppRouter)).call(this, props));

    _this.state = {
      menuOpen: false
    };
    return _this;
  }

  _createClass(AppRouter, [{
    key: "handleMenu",
    value: function handleMenu() {
      var prev = this.state.menuOpen;
      this.setState({ menuOpen: !prev });
    }
  }, {
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        _reactRouterDom.BrowserRouter,
        null,
        _react2.default.createElement(
          "div",
          { className: "app" },
          _react2.default.createElement(_Hamburguer2.default, {
            menuOpen: this.state.menuOpen,
            handleMenu: this.handleMenu.bind(this)
          }),
          _react2.default.createElement(
            "div",
            { className: "app__static" },
            _react2.default.createElement(_Navigation2.default, { menuOpen: this.state.menuOpen }),
            _react2.default.createElement(
              "div",
              { className: "app__content" },
              _react2.default.createElement(
                "div",
                { className: "app__component__container" },
                _react2.default.createElement(
                  _reactRouterDom.Switch,
                  null,
                  _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: "/", component: _Homepage2.default }),
                  _react2.default.createElement(_reactRouterDom.Route, { exact: true, path: "/calculator", component: _Calculator2.default })
                )
              ),
              _react2.default.createElement(_Footer2.default, null)
            )
          )
        )
      );
    }
  }]);

  return AppRouter;
}(_react2.default.Component);

exports.default = AppRouter;

/***/ }),

/***/ 79:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = __webpack_require__(12);

var _CustomLink = __webpack_require__(80);

var _CustomLink2 = _interopRequireDefault(_CustomLink);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Nav = function (_Component) {
  _inherits(Nav, _Component);

  function Nav() {
    _classCallCheck(this, Nav);

    return _possibleConstructorReturn(this, (Nav.__proto__ || Object.getPrototypeOf(Nav)).apply(this, arguments));
  }

  _createClass(Nav, [{
    key: "render",
    value: function render() {
      var state = this.props.menuOpen ? "app__sidebar--open" : "app__sidebar--close";
      return _react2.default.createElement(
        "aside",
        { className: "app__sidebar " + state },
        _react2.default.createElement(
          "ul",
          { className: "app__sidebar--menu" },
          _react2.default.createElement(
            _CustomLink2.default,
            { to: "/" },
            "Home"
          ),
          _react2.default.createElement(
            _CustomLink2.default,
            { to: "/calculator" },
            "Calculator"
          )
        )
      );
    }
  }]);

  return Nav;
}(_react.Component);

exports.default = Nav;

/***/ }),

/***/ 80:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CustomLink = function (_React$Component) {
  _inherits(CustomLink, _React$Component);

  function CustomLink() {
    _classCallCheck(this, CustomLink);

    return _possibleConstructorReturn(this, (CustomLink.__proto__ || Object.getPrototypeOf(CustomLink)).apply(this, arguments));
  }

  _createClass(CustomLink, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "li",
        null,
        _react2.default.createElement(
          _reactRouterDom.NavLink,
          {
            exact: true,
            activeClassName: "app__sidebar--link--active",
            className: "app__sidebar--link",
            to: this.props.to
          },
          this.props.children
        )
      );
    }
  }]);

  return CustomLink;
}(_react2.default.Component);

exports.default = CustomLink;

/***/ }),

/***/ 81:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Footer = function (_Component) {
  _inherits(Footer, _Component);

  function Footer() {
    _classCallCheck(this, Footer);

    return _possibleConstructorReturn(this, (Footer.__proto__ || Object.getPrototypeOf(Footer)).apply(this, arguments));
  }

  _createClass(Footer, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "footer",
        { className: "app__footer" },
        _react2.default.createElement(
          "p",
          { className: "app__footer--copyright" },
          "All Rights Reserved 2018. Carlos I. Martinez. \xA9"
        )
      );
    }
  }]);

  return Footer;
}(_react.Component);

exports.default = Footer;

/***/ }),

/***/ 82:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Hamburguer = function (_Component) {
  _inherits(Hamburguer, _Component);

  function Hamburguer() {
    _classCallCheck(this, Hamburguer);

    return _possibleConstructorReturn(this, (Hamburguer.__proto__ || Object.getPrototypeOf(Hamburguer)).apply(this, arguments));
  }

  _createClass(Hamburguer, [{
    key: "handleClick",
    value: function handleClick() {
      this.props.handleMenu();
    }
  }, {
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        null,
        _react2.default.createElement(
          "div",
          { onClick: this.handleClick.bind(this), className: "app__hamburguer" },
          this.props.menuOpen ? _react2.default.createElement("i", { className: "app__hamburguer--icon app__hamburguer--white icon-close" }) : _react2.default.createElement("i", { className: "app__hamburguer--icon icon-menu" })
        )
      );
    }
  }]);

  return Hamburguer;
}(_react.Component);

exports.default = Hamburguer;

/***/ }),

/***/ 83:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Homepage = function (_Component) {
  _inherits(Homepage, _Component);

  function Homepage() {
    _classCallCheck(this, Homepage);

    return _possibleConstructorReturn(this, (Homepage.__proto__ || Object.getPrototypeOf(Homepage)).apply(this, arguments));
  }

  _createClass(Homepage, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        { className: "app__homepage" },
        _react2.default.createElement(
          "h1",
          { className: "app__homepage--title" },
          "UI React Portfolio"
        ),
        _react2.default.createElement(
          "p",
          { className: "app__homepage--desc" },
          "This is a small portfolio site I've been working on in order to learn and practice new things with React.js / Node / Express and some other libraries I would like to learn."
        ),
        _react2.default.createElement(
          "small",
          { className: "app__homepage--disclaimer" },
          "Disclaimer: Hope you enjoy what you see here."
        )
      );
    }
  }]);

  return Homepage;
}(_react.Component);

exports.default = Homepage;

/***/ }),

/***/ 84:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _Number = __webpack_require__(85);

var _Number2 = _interopRequireDefault(_Number);

var _Sign = __webpack_require__(86);

var _Sign2 = _interopRequireDefault(_Sign);

var _ResultScreen = __webpack_require__(87);

var _ResultScreen2 = _interopRequireDefault(_ResultScreen);

var _HistoryScreen = __webpack_require__(88);

var _HistoryScreen2 = _interopRequireDefault(_HistoryScreen);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Calculator = function (_Component) {
  _inherits(Calculator, _Component);

  function Calculator(props) {
    _classCallCheck(this, Calculator);

    var _this = _possibleConstructorReturn(this, (Calculator.__proto__ || Object.getPrototypeOf(Calculator)).call(this, props));

    _this.state = {
      numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "."],
      signs: ["*", "+", "-", "/", "%", "="],
      operation: "",
      history: "0",
      result: "0"
    };
    return _this;
  }

  _createClass(Calculator, [{
    key: "handleKey",
    value: function handleKey(input) {
      if (this.state.numbers.join('').includes(input.key)) this.handleAddNumber(input.key);
      if (this.state.signs.join('').includes(input.key)) this.handleAddSign(input.key);
      if (input.keyCode == 13) this.handlePerformOperation();
      return;
    }
  }, {
    key: "componentWillMount",
    value: function componentWillMount() {
      window.addEventListener('keyup', this.handleKey.bind(this));
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      window.removeEventListener('keyup', this.handleKey);
    }
  }, {
    key: "handleAddNumber",
    value: function handleAddNumber(num) {
      var op = this.state.operation.toString();
      if (op.includes(".") && num == ".") return;
      if (op == "0" && num == "0") return;

      this.setState(function (prevState) {
        var operation = prevState.operation += num.toString();

        return {
          operation: operation
        };
      });
    }
  }, {
    key: "handleReset",
    value: function handleReset() {
      this.setState(function (prev) {
        var h = prev.operation;
        return {
          operation: "",
          result: "0"
        };
      });
    }
  }, {
    key: "handleAddSign",
    value: function handleAddSign(sign) {
      var _this2 = this;

      var lastChar = this.state.operation[this.state.operation.length - 1];
      var operation = void 0;
      if (this.state.operation == "") return;
      this.setState(function (prevState) {
        _this2.state.signs.indexOf(lastChar) == -1 ? operation = prevState.operation += sign : operation = prevState.operation.slice(0, -1) + sign.toString();
        return {
          operation: operation
        };
      });
    }
  }, {
    key: "handlePerformOperation",
    value: function handlePerformOperation() {
      var args = this.state.operation;
      var lastChar = args[args.length - 1];
      var firstChar = args[0];
      if (this.state.signs.indexOf(lastChar) !== -1) args = args.slice(0, -1);
      if (firstChar == 0 && !args.includes('.')) args = args.slice(1);
      var operation = args;
      var result = eval(operation).toString();
      if (result.includes('.') && result.length > 8) result = Math.abs(result).toFixed(4);
      this.setState(function (prev) {
        return {
          result: result,
          history: operation,
          operation: result
        };
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      return _react2.default.createElement(
        "div",
        { className: "calculator__app" },
        _react2.default.createElement(
          "header",
          { className: "calculator__app--header" },
          _react2.default.createElement(_HistoryScreen2.default, { history: this.state.history }),
          _react2.default.createElement(_ResultScreen2.default, { operation: this.state.operation })
        ),
        _react2.default.createElement(
          "section",
          { className: "calculator__app--body" },
          _react2.default.createElement(
            "div",
            { className: "calculator__app--numbers" },
            _react2.default.createElement(
              "button",
              {
                className: "calculator__app--reset",
                onClick: this.handleReset.bind(this)
              },
              " C "
            ),
            _react2.default.createElement(_Sign2.default, {
              handleAddSign: this.handleAddSign.bind(this),
              handlePerformOperation: this.handlePerformOperation.bind(this),
              sign: "%"
            }),
            this.state.numbers.map(function (num) {
              return _react2.default.createElement(_Number2.default, {
                handleAddNumber: _this3.handleAddNumber.bind(_this3),
                key: num,
                number: num
              });
            })
          ),
          _react2.default.createElement(
            "div",
            { className: "calculator__app--signs" },
            this.state.signs.map(function (s) {
              if (s === "%") return;
              return _react2.default.createElement(_Sign2.default, {
                handleAddSign: _this3.handleAddSign.bind(_this3),
                handlePerformOperation: _this3.handlePerformOperation.bind(_this3),
                key: s,
                sign: s
              });
            })
          )
        )
      );
    }
  }]);

  return Calculator;
}(_react.Component);

exports.default = Calculator;

/***/ }),

/***/ 85:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Number = function (_Component) {
  _inherits(Number, _Component);

  function Number(props) {
    _classCallCheck(this, Number);

    var _this = _possibleConstructorReturn(this, (Number.__proto__ || Object.getPrototypeOf(Number)).call(this, props));

    _this.state = {};
    return _this;
  }

  _createClass(Number, [{
    key: 'handleAddNumber',
    value: function handleAddNumber() {
      this.props.handleAddNumber(this.props.number);
    }
  }, {
    key: 'render',
    value: function render() {
      var isZero = this.props.number === 0 ? 'is--zero' : '';
      return _react2.default.createElement(
        'button',
        { className: 'calculator__app--number ' + isZero, onClick: this.handleAddNumber.bind(this) },
        this.props.number
      );
    }
  }]);

  return Number;
}(_react.Component);

exports.default = Number;

/***/ }),

/***/ 86:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Sign = function (_Component) {
  _inherits(Sign, _Component);

  function Sign() {
    _classCallCheck(this, Sign);

    return _possibleConstructorReturn(this, (Sign.__proto__ || Object.getPrototypeOf(Sign)).apply(this, arguments));
  }

  _createClass(Sign, [{
    key: "handleAddSign",
    value: function handleAddSign() {
      this.props.sign == "=" ? this.props.handlePerformOperation() : this.props.handleAddSign(this.props.sign);
    }
  }, {
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "button",
        { className: "calculator__app--sign", onClick: this.handleAddSign.bind(this) },
        this.props.sign
      );
    }
  }]);

  return Sign;
}(_react.Component);

exports.default = Sign;

/***/ }),

/***/ 87:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ResultScreen = function (_Component) {
  _inherits(ResultScreen, _Component);

  function ResultScreen() {
    _classCallCheck(this, ResultScreen);

    return _possibleConstructorReturn(this, (ResultScreen.__proto__ || Object.getPrototypeOf(ResultScreen)).apply(this, arguments));
  }

  _createClass(ResultScreen, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        { className: "calculator__app--results" },
        this.props.operation
      );
    }
  }]);

  return ResultScreen;
}(_react.Component);

exports.default = ResultScreen;

/***/ }),

/***/ 88:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HistoryScreen = function (_Component) {
  _inherits(HistoryScreen, _Component);

  function HistoryScreen() {
    _classCallCheck(this, HistoryScreen);

    return _possibleConstructorReturn(this, (HistoryScreen.__proto__ || Object.getPrototypeOf(HistoryScreen)).apply(this, arguments));
  }

  _createClass(HistoryScreen, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        { className: "calculator__app--history" },
        this.props.history
      );
    }
  }]);

  return HistoryScreen;
}(_react.Component);

exports.default = HistoryScreen;

/***/ }),

/***/ 89:
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(90);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(37)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {
	module.hot.accept("!!../css-loader/index.js!../sass-loader/lib/loader.js!./normalize.css", function() {
		var newContent = require("!!../css-loader/index.js!../sass-loader/lib/loader.js!./normalize.css");

		if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];

		var locals = (function(a, b) {
			var key, idx = 0;

			for(key in a) {
				if(!b || a[key] !== b[key]) return false;
				idx++;
			}

			for(key in b) idx--;

			return idx === 0;
		}(content.locals, newContent.locals));

		if(!locals) throw new Error('Aborting CSS HMR due to changed css-modules locals.');

		update(newContent);
	});

	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 90:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(36)(false);
// imports


// module
exports.push([module.i, "/*! normalize.css v8.0.0 | MIT License | github.com/necolas/normalize.css */\n/* Document\n   ========================================================================== */\n/**\n * 1. Correct the line height in all browsers.\n * 2. Prevent adjustments of font size after orientation changes in iOS.\n */\nhtml {\n  line-height: 1.15;\n  /* 1 */\n  -webkit-text-size-adjust: 100%;\n  /* 2 */ }\n\n/* Sections\n   ========================================================================== */\n/**\n * Remove the margin in all browsers.\n */\nbody {\n  margin: 0; }\n\n/**\n * Correct the font size and margin on `h1` elements within `section` and\n * `article` contexts in Chrome, Firefox, and Safari.\n */\nh1 {\n  font-size: 2em;\n  margin: 0.67em 0; }\n\n/* Grouping content\n   ========================================================================== */\n/**\n * 1. Add the correct box sizing in Firefox.\n * 2. Show the overflow in Edge and IE.\n */\nhr {\n  box-sizing: content-box;\n  /* 1 */\n  height: 0;\n  /* 1 */\n  overflow: visible;\n  /* 2 */ }\n\n/**\n * 1. Correct the inheritance and scaling of font size in all browsers.\n * 2. Correct the odd `em` font sizing in all browsers.\n */\npre {\n  font-family: monospace, monospace;\n  /* 1 */\n  font-size: 1em;\n  /* 2 */ }\n\n/* Text-level semantics\n   ========================================================================== */\n/**\n * Remove the gray background on active links in IE 10.\n */\na {\n  background-color: transparent; }\n\n/**\n * 1. Remove the bottom border in Chrome 57-\n * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari.\n */\nabbr[title] {\n  border-bottom: none;\n  /* 1 */\n  text-decoration: underline;\n  /* 2 */\n  text-decoration: underline dotted;\n  /* 2 */ }\n\n/**\n * Add the correct font weight in Chrome, Edge, and Safari.\n */\nb,\nstrong {\n  font-weight: bolder; }\n\n/**\n * 1. Correct the inheritance and scaling of font size in all browsers.\n * 2. Correct the odd `em` font sizing in all browsers.\n */\ncode,\nkbd,\nsamp {\n  font-family: monospace, monospace;\n  /* 1 */\n  font-size: 1em;\n  /* 2 */ }\n\n/**\n * Add the correct font size in all browsers.\n */\nsmall {\n  font-size: 80%; }\n\n/**\n * Prevent `sub` and `sup` elements from affecting the line height in\n * all browsers.\n */\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline; }\n\nsub {\n  bottom: -0.25em; }\n\nsup {\n  top: -0.5em; }\n\n/* Embedded content\n   ========================================================================== */\n/**\n * Remove the border on images inside links in IE 10.\n */\nimg {\n  border-style: none; }\n\n/* Forms\n   ========================================================================== */\n/**\n * 1. Change the font styles in all browsers.\n * 2. Remove the margin in Firefox and Safari.\n */\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit;\n  /* 1 */\n  font-size: 100%;\n  /* 1 */\n  line-height: 1.15;\n  /* 1 */\n  margin: 0;\n  /* 2 */ }\n\n/**\n * Show the overflow in IE.\n * 1. Show the overflow in Edge.\n */\nbutton,\ninput {\n  /* 1 */\n  overflow: visible; }\n\n/**\n * Remove the inheritance of text transform in Edge, Firefox, and IE.\n * 1. Remove the inheritance of text transform in Firefox.\n */\nbutton,\nselect {\n  /* 1 */\n  text-transform: none; }\n\n/**\n * Correct the inability to style clickable types in iOS and Safari.\n */\nbutton,\n[type=\"button\"],\n[type=\"reset\"],\n[type=\"submit\"] {\n  -webkit-appearance: button; }\n\n/**\n * Remove the inner border and padding in Firefox.\n */\nbutton::-moz-focus-inner,\n[type=\"button\"]::-moz-focus-inner,\n[type=\"reset\"]::-moz-focus-inner,\n[type=\"submit\"]::-moz-focus-inner {\n  border-style: none;\n  padding: 0; }\n\n/**\n * Restore the focus styles unset by the previous rule.\n */\nbutton:-moz-focusring,\n[type=\"button\"]:-moz-focusring,\n[type=\"reset\"]:-moz-focusring,\n[type=\"submit\"]:-moz-focusring {\n  outline: 1px dotted ButtonText; }\n\n/**\n * Correct the padding in Firefox.\n */\nfieldset {\n  padding: 0.35em 0.75em 0.625em; }\n\n/**\n * 1. Correct the text wrapping in Edge and IE.\n * 2. Correct the color inheritance from `fieldset` elements in IE.\n * 3. Remove the padding so developers are not caught out when they zero out\n *    `fieldset` elements in all browsers.\n */\nlegend {\n  box-sizing: border-box;\n  /* 1 */\n  color: inherit;\n  /* 2 */\n  display: table;\n  /* 1 */\n  max-width: 100%;\n  /* 1 */\n  padding: 0;\n  /* 3 */\n  white-space: normal;\n  /* 1 */ }\n\n/**\n * Add the correct vertical alignment in Chrome, Firefox, and Opera.\n */\nprogress {\n  vertical-align: baseline; }\n\n/**\n * Remove the default vertical scrollbar in IE 10+.\n */\ntextarea {\n  overflow: auto; }\n\n/**\n * 1. Add the correct box sizing in IE 10.\n * 2. Remove the padding in IE 10.\n */\n[type=\"checkbox\"],\n[type=\"radio\"] {\n  box-sizing: border-box;\n  /* 1 */\n  padding: 0;\n  /* 2 */ }\n\n/**\n * Correct the cursor style of increment and decrement buttons in Chrome.\n */\n[type=\"number\"]::-webkit-inner-spin-button,\n[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto; }\n\n/**\n * 1. Correct the odd appearance in Chrome and Safari.\n * 2. Correct the outline style in Safari.\n */\n[type=\"search\"] {\n  -webkit-appearance: textfield;\n  /* 1 */\n  outline-offset: -2px;\n  /* 2 */ }\n\n/**\n * Remove the inner padding in Chrome and Safari on macOS.\n */\n[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none; }\n\n/**\n * 1. Correct the inability to style clickable types in iOS and Safari.\n * 2. Change font properties to `inherit` in Safari.\n */\n::-webkit-file-upload-button {\n  -webkit-appearance: button;\n  /* 1 */\n  font: inherit;\n  /* 2 */ }\n\n/* Interactive\n   ========================================================================== */\n/*\n * Add the correct display in Edge, IE 10+, and Firefox.\n */\ndetails {\n  display: block; }\n\n/*\n * Add the correct display in all browsers.\n */\nsummary {\n  display: list-item; }\n\n/* Misc\n   ========================================================================== */\n/**\n * Add the correct display in IE 10+.\n */\ntemplate {\n  display: none; }\n\n/**\n * Add the correct display in IE 10.\n */\n[hidden] {\n  display: none; }\n", ""]);

// exports


/***/ }),

/***/ 91:
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),

/***/ 92:
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(93);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(37)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {
	module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./master.scss", function() {
		var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./master.scss");

		if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];

		var locals = (function(a, b) {
			var key, idx = 0;

			for(key in a) {
				if(!b || a[key] !== b[key]) return false;
				idx++;
			}

			for(key in b) idx--;

			return idx === 0;
		}(content.locals, newContent.locals));

		if(!locals) throw new Error('Aborting CSS HMR due to changed css-modules locals.');

		update(newContent);
	});

	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 93:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(36)(false);
// imports
exports.push([module.i, "@import url(https://fonts.googleapis.com/css?family=Roboto:300,400,500,900);", ""]);

// module
exports.push([module.i, "/*\n\n*/\n.app__sidebar {\n  background: #ed6153;\n  background: -moz-linear-gradient(top, #ed6153 0%, #f8b26d 99%);\n  background: -webkit-linear-gradient(top, #ed6153 0%, #f8b26d 99%);\n  background: linear-gradient(to bottom, #ed6153 0%, #f8b26d 99%);\n  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ed6153', endColorstr='#f8b26d', GradientType=0);\n  width: 320px;\n  min-height: 420px;\n  height: 100vh;\n  display: flex;\n  align-items: center;\n  transition: all ease-in-out 400ms;\n  transform: translateX(0); }\n  .app__sidebar--menu {\n    list-style: none;\n    padding: 0;\n    margin: 0;\n    width: 100%; }\n    .app__sidebar--menu li {\n      width: 100%;\n      display: block; }\n  .app__sidebar--link {\n    color: white;\n    display: block;\n    text-decoration: none;\n    list-style: none;\n    width: 100%;\n    padding: 5px 0 5px 20px;\n    box-sizing: border-box; }\n    .app__sidebar--link--active {\n      position: relative;\n      font-weight: bold; }\n      .app__sidebar--link--active:before {\n        content: \"\";\n        width: 3px;\n        height: 100%;\n        position: absolute;\n        left: 0;\n        top: 0;\n        background: #fff; }\n      .app__sidebar--link--active:after {\n        content: \"\";\n        width: 100%;\n        height: 100%;\n        position: absolute;\n        left: 0;\n        top: 0;\n        background: rgba(255, 255, 255, 0.2); }\n    .app__sidebar--link:hover {\n      position: relative; }\n      .app__sidebar--link:hover:before {\n        content: \"\";\n        width: 3px;\n        height: 100%;\n        position: absolute;\n        left: 0;\n        top: 0;\n        background: #fff; }\n      .app__sidebar--link:hover:after {\n        content: \"\";\n        width: 100%;\n        height: 100%;\n        position: absolute;\n        left: 0;\n        top: 0;\n        background: rgba(255, 255, 255, 0.2); }\n\n@media all and (max-width: 768px) {\n  .app__sidebar--close {\n    position: absolute;\n    transform: translateX(-320px); }\n  .app__sidebar--open {\n    position: absolute;\n    transform: translateX(0); } }\n\n.app__static {\n  display: flex;\n  display: -webkit-flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  flex-direction: row;\n  width: 100%; }\n\n.app__component__container {\n  height: calc(100% - 80px);\n  display: flex;\n  align-items: center;\n  min-height: 420px; }\n\n.app__content {\n  display: flex;\n  display: -webkit-flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  flex-direction: column;\n  width: calc(100% - 320px);\n  align-items: center; }\n\n@media all and (max-width: 768px) {\n  .app__content {\n    width: 100%;\n    height: 100vh;\n    min-height: 600px; } }\n\n.app__homepage {\n  max-width: 650px;\n  padding: 0 30px;\n  box-sizing: border-box; }\n  .app__homepage--title {\n    font-size: 29px;\n    text-transform: uppercase;\n    font-weight: lighter;\n    letter-spacing: 4.4pt;\n    margin: 0 0 20px 0;\n    position: relative; }\n    .app__homepage--title:after {\n      content: '';\n      display: block;\n      width: 50px;\n      height: 4px;\n      bottom: 0;\n      left: 0;\n      position: absolute;\n      background: #ef6e57; }\n  .app__homepage--desc {\n    font-size: 18px;\n    letter-spacing: .5pt; }\n  .app__homepage--disclaimer {\n    color: #aaa372;\n    font-weight: 600;\n    text-align: right;\n    display: block;\n    text-transform: uppercase;\n    letter-spacing: .5pt; }\n\n.app__hamburguer {\n  display: none;\n  position: absolute;\n  left: 0;\n  top: 0px;\n  z-index: 100; }\n  .app__hamburguer--icon {\n    color: #000;\n    font-size: 1.4em;\n    height: 50px;\n    width: 50px;\n    line-height: 50px;\n    display: block;\n    text-align: center; }\n  .app__hamburguer--white {\n    color: #fff; }\n\n@media all and (max-width: 768px) {\n  .app__hamburguer {\n    display: block; } }\n\n.app__footer {\n  width: 100%;\n  display: flex;\n  align-items: center;\n  justify-items: center;\n  height: 80px;\n  text-align: center; }\n  .app__footer--copyright {\n    width: 100%;\n    margin: 0;\n    font-size: 0.8em;\n    color: #636363; }\n\nhtml,\n.root {\n  font-size: 16px;\n  line-height: 33px;\n  font-family: \"Roboto\", \"Arial\", \"Helvetica\", sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale; }\n\nh1,\n.h1 {\n  font-size: 3.4375rem;\n  line-height: 4.125rem;\n  margin-top: 2.0625rem;\n  margin-bottom: 4.125rem; }\n\nh2,\n.h2 {\n  font-size: 2.25rem;\n  line-height: 4.125rem;\n  margin-top: 2.0625rem;\n  margin-bottom: 2.0625rem; }\n\nh3,\n.h3 {\n  font-size: 1.5rem;\n  line-height: 2.0625rem;\n  margin-top: 2.0625rem;\n  margin-bottom: 0rem; }\n\nh4,\n.h4 {\n  font-size: 1rem;\n  line-height: 2.0625rem;\n  margin-top: 2.0625rem;\n  margin-bottom: 0rem; }\n\nh5,\n.h5 {\n  font-size: 1rem;\n  line-height: 2.0625rem;\n  margin-top: 2.0625rem;\n  margin-bottom: 0rem; }\n\np,\nul,\nol,\npre,\ntable,\nblockquote {\n  margin-top: 0rem;\n  margin-bottom: 2.0625rem; }\n\nul ul,\nol ol,\nul ol,\nol ul {\n  margin-top: 0rem;\n  margin-bottom: 0rem; }\n\n/* Let's make sure all's aligned */\nhr,\n.hr {\n  border: 1px solid;\n  margin: -1px 0; }\n\nsub,\nsup {\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline; }\n\nsup {\n  top: -0.5em; }\n\nsub {\n  bottom: -0.25em; }\n\n/*\n UI's\n*/\n.calculator__app {\n  width: 300px;\n  height: auto;\n  border-radius: 10px;\n  box-shadow: 0px 0px 26px 2px #e6e6e6;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  justify-content: flex-end; }\n  .calculator__app--header {\n    width: 100%; }\n  .calculator__app--body {\n    width: 100%;\n    display: flex;\n    flex-wrap: wrap;\n    align-items: flex-start; }\n  .calculator__app--reset {\n    border: none;\n    background: #f5e1fd;\n    width: 50%;\n    height: 50px; }\n  .calculator__app--number {\n    border: none;\n    background: #eeedff;\n    width: 33.33333%;\n    height: 50px; }\n  .calculator__app .is--zero {\n    flex-grow: 2; }\n  .calculator__app--numbers {\n    display: flex;\n    flex-wrap: wrap;\n    flex-direction: row;\n    width: 75%; }\n    .calculator__app--numbers .calculator__app--sign {\n      width: 33%;\n      border: none;\n      background: #eeedff;\n      width: 50%;\n      height: 50px;\n      color: #000; }\n  .calculator__app--signs {\n    display: flex;\n    width: 25%;\n    flex-direction: column;\n    background: #f6d361;\n    background: -moz-linear-gradient(top, #f6d361 0%, #ff9b66 100%);\n    /* FF3.6-15 */\n    background: -webkit-linear-gradient(top, #f6d361 0%, #ff9b66 100%);\n    /* Chrome10-25,Safari5.1-6 */\n    background: linear-gradient(to bottom, #f6d361 0%, #ff9b66 100%);\n    /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */\n    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#f6d361', endColorstr='#ff9b66',GradientType=0 );\n    /* IE6-9 */ }\n  .calculator__app--sign {\n    background: transparent;\n    height: 50px;\n    width: 100%;\n    color: #fff;\n    font-size: 20px;\n    border: none; }\n  .calculator__app--history {\n    text-align: right;\n    padding: 10px 20px;\n    font-weight: 500;\n    color: #9f9f9f;\n    letter-spacing: 1pt; }\n  .calculator__app--results {\n    text-align: right;\n    padding: 10px 20px;\n    font-size: 48px;\n    font-weight: lighter;\n    margin: 0;\n    height: 53px; }\n", ""]);

// exports


/***/ })

},[38]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvYWRkU3R5bGVzLmpzIiwid2VicGFjazovLy8uL3NyYy9BcHAuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JvdXRlcy9hcHAucm91dGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3N0YXRpY3MvTmF2aWdhdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9zdGF0aWNzL0N1c3RvbUxpbmsuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvc3RhdGljcy9Gb290ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvc3RhdGljcy9IYW1idXJndWVyLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3BhZ2VzL0hvbWVwYWdlLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21wb25lbnRzL3VpL0NhbGN1bGF0b3IvQ2FsY3VsYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy91aS9DYWxjdWxhdG9yL051bWJlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy91aS9DYWxjdWxhdG9yL1NpZ24uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvdWkvQ2FsY3VsYXRvci9SZXN1bHRTY3JlZW4uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbXBvbmVudHMvdWkvQ2FsY3VsYXRvci9IaXN0b3J5U2NyZWVuLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9ub3JtYWxpemUuY3NzL25vcm1hbGl6ZS5jc3M/N2M1NCIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbm9ybWFsaXplLmNzcy9ub3JtYWxpemUuY3NzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL3VybHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3N0eWxlcy9tYXN0ZXIuc2Nzcz82OGZhIiwid2VicGFjazovLy8uL3NyYy9zdHlsZXMvbWFzdGVyLnNjc3MiXSwibmFtZXMiOlsicm9vdCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJyZW5kZXIiLCJBcHBSb3V0ZXIiLCJwcm9wcyIsInN0YXRlIiwibWVudU9wZW4iLCJwcmV2Iiwic2V0U3RhdGUiLCJoYW5kbGVNZW51IiwiYmluZCIsIkNvbXBvbmVudCIsIk5hdiIsIkN1c3RvbUxpbmsiLCJ0byIsImNoaWxkcmVuIiwiRm9vdGVyIiwiSGFtYnVyZ3VlciIsImhhbmRsZUNsaWNrIiwiSG9tZXBhZ2UiLCJDYWxjdWxhdG9yIiwibnVtYmVycyIsInNpZ25zIiwib3BlcmF0aW9uIiwiaGlzdG9yeSIsInJlc3VsdCIsImlucHV0Iiwiam9pbiIsImluY2x1ZGVzIiwia2V5IiwiaGFuZGxlQWRkTnVtYmVyIiwiaGFuZGxlQWRkU2lnbiIsImtleUNvZGUiLCJoYW5kbGVQZXJmb3JtT3BlcmF0aW9uIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImhhbmRsZUtleSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJudW0iLCJvcCIsInRvU3RyaW5nIiwicHJldlN0YXRlIiwiaCIsInNpZ24iLCJsYXN0Q2hhciIsImxlbmd0aCIsImluZGV4T2YiLCJzbGljZSIsImFyZ3MiLCJmaXJzdENoYXIiLCJldmFsIiwiTWF0aCIsImFicyIsInRvRml4ZWQiLCJoYW5kbGVSZXNldCIsIm1hcCIsInMiLCJOdW1iZXIiLCJudW1iZXIiLCJpc1plcm8iLCJTaWduIiwiUmVzdWx0U2NyZWVuIiwiSGlzdG9yeVNjcmVlbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLGdCQUFnQjtBQUNuRCxJQUFJO0FBQ0o7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFF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LHFCQUFxQiw0QkFBNEIsbUJBQW1CLHFCQUFxQixvQkFBb0IsRUFBRSw2QkFBNkIsb0JBQW9CLGlCQUFpQiw2QkFBNkIsMEJBQTBCLHNFQUFzRSw2RkFBNkYsMEdBQTBHLHNMQUFzTCxtQkFBbUIsNEJBQTRCLDhCQUE4QixtQkFBbUIsa0JBQWtCLGtCQUFrQixzQkFBc0IsbUJBQW1CLEVBQUUsK0JBQStCLHdCQUF3Qix5QkFBeUIsdUJBQXVCLHFCQUFxQiwwQkFBMEIsRUFBRSwrQkFBK0Isd0JBQXdCLHlCQUF5QixzQkFBc0IsMkJBQTJCLGdCQUFnQixtQkFBbUIsRUFBRTs7QUFFL3hPIiwiZmlsZSI6ImFwcC5idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuXHRNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuXHRBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xuLy8gY3NzIGJhc2UgY29kZSwgaW5qZWN0ZWQgYnkgdGhlIGNzcy1sb2FkZXJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXNlU291cmNlTWFwKSB7XG5cdHZhciBsaXN0ID0gW107XG5cblx0Ly8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXHRsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHR2YXIgY29udGVudCA9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSwgdXNlU291cmNlTWFwKTtcblx0XHRcdGlmKGl0ZW1bMl0pIHtcblx0XHRcdFx0cmV0dXJuIFwiQG1lZGlhIFwiICsgaXRlbVsyXSArIFwie1wiICsgY29udGVudCArIFwifVwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGNvbnRlbnQ7XG5cdFx0XHR9XG5cdFx0fSkuam9pbihcIlwiKTtcblx0fTtcblxuXHQvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXHRsaXN0LmkgPSBmdW5jdGlvbihtb2R1bGVzLCBtZWRpYVF1ZXJ5KSB7XG5cdFx0aWYodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpXG5cdFx0XHRtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCBcIlwiXV07XG5cdFx0dmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGlkID0gdGhpc1tpXVswXTtcblx0XHRcdGlmKHR5cGVvZiBpZCA9PT0gXCJudW1iZXJcIilcblx0XHRcdFx0YWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuXHRcdH1cblx0XHRmb3IoaSA9IDA7IGkgPCBtb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IG1vZHVsZXNbaV07XG5cdFx0XHQvLyBza2lwIGFscmVhZHkgaW1wb3J0ZWQgbW9kdWxlXG5cdFx0XHQvLyB0aGlzIGltcGxlbWVudGF0aW9uIGlzIG5vdCAxMDAlIHBlcmZlY3QgZm9yIHdlaXJkIG1lZGlhIHF1ZXJ5IGNvbWJpbmF0aW9uc1xuXHRcdFx0Ly8gIHdoZW4gYSBtb2R1bGUgaXMgaW1wb3J0ZWQgbXVsdGlwbGUgdGltZXMgd2l0aCBkaWZmZXJlbnQgbWVkaWEgcXVlcmllcy5cblx0XHRcdC8vICBJIGhvcGUgdGhpcyB3aWxsIG5ldmVyIG9jY3VyIChIZXkgdGhpcyB3YXkgd2UgaGF2ZSBzbWFsbGVyIGJ1bmRsZXMpXG5cdFx0XHRpZih0eXBlb2YgaXRlbVswXSAhPT0gXCJudW1iZXJcIiB8fCAhYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuXHRcdFx0XHRpZihtZWRpYVF1ZXJ5ICYmICFpdGVtWzJdKSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IG1lZGlhUXVlcnk7XG5cdFx0XHRcdH0gZWxzZSBpZihtZWRpYVF1ZXJ5KSB7XG5cdFx0XHRcdFx0aXRlbVsyXSA9IFwiKFwiICsgaXRlbVsyXSArIFwiKSBhbmQgKFwiICsgbWVkaWFRdWVyeSArIFwiKVwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxpc3QucHVzaChpdGVtKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdHJldHVybiBsaXN0O1xufTtcblxuZnVuY3Rpb24gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtLCB1c2VTb3VyY2VNYXApIHtcblx0dmFyIGNvbnRlbnQgPSBpdGVtWzFdIHx8ICcnO1xuXHR2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cdGlmICghY3NzTWFwcGluZykge1xuXHRcdHJldHVybiBjb250ZW50O1xuXHR9XG5cblx0aWYgKHVzZVNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHZhciBzb3VyY2VNYXBwaW5nID0gdG9Db21tZW50KGNzc01hcHBpbmcpO1xuXHRcdHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG5cdFx0XHRyZXR1cm4gJy8qIyBzb3VyY2VVUkw9JyArIGNzc01hcHBpbmcuc291cmNlUm9vdCArIHNvdXJjZSArICcgKi8nXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKCdcXG4nKTtcblx0fVxuXG5cdHJldHVybiBbY29udGVudF0uam9pbignXFxuJyk7XG59XG5cbi8vIEFkYXB0ZWQgZnJvbSBjb252ZXJ0LXNvdXJjZS1tYXAgKE1JVClcbmZ1bmN0aW9uIHRvQ29tbWVudChzb3VyY2VNYXApIHtcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5cdHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpO1xuXHR2YXIgZGF0YSA9ICdzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCwnICsgYmFzZTY0O1xuXG5cdHJldHVybiAnLyojICcgKyBkYXRhICsgJyAqLyc7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qc1xuLy8gbW9kdWxlIGlkID0gMzZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLypcblx0TUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcblx0QXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cblxudmFyIHN0eWxlc0luRG9tID0ge307XG5cbnZhclx0bWVtb2l6ZSA9IGZ1bmN0aW9uIChmbikge1xuXHR2YXIgbWVtbztcblxuXHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0eXBlb2YgbWVtbyA9PT0gXCJ1bmRlZmluZWRcIikgbWVtbyA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0cmV0dXJuIG1lbW87XG5cdH07XG59O1xuXG52YXIgaXNPbGRJRSA9IG1lbW9pemUoZnVuY3Rpb24gKCkge1xuXHQvLyBUZXN0IGZvciBJRSA8PSA5IGFzIHByb3Bvc2VkIGJ5IEJyb3dzZXJoYWNrc1xuXHQvLyBAc2VlIGh0dHA6Ly9icm93c2VyaGFja3MuY29tLyNoYWNrLWU3MWQ4NjkyZjY1MzM0MTczZmVlNzE1YzIyMmNiODA1XG5cdC8vIFRlc3RzIGZvciBleGlzdGVuY2Ugb2Ygc3RhbmRhcmQgZ2xvYmFscyBpcyB0byBhbGxvdyBzdHlsZS1sb2FkZXJcblx0Ly8gdG8gb3BlcmF0ZSBjb3JyZWN0bHkgaW50byBub24tc3RhbmRhcmQgZW52aXJvbm1lbnRzXG5cdC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi9zdHlsZS1sb2FkZXIvaXNzdWVzLzE3N1xuXHRyZXR1cm4gd2luZG93ICYmIGRvY3VtZW50ICYmIGRvY3VtZW50LmFsbCAmJiAhd2luZG93LmF0b2I7XG59KTtcblxudmFyIGdldFRhcmdldCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcbn07XG5cbnZhciBnZXRFbGVtZW50ID0gKGZ1bmN0aW9uIChmbikge1xuXHR2YXIgbWVtbyA9IHt9O1xuXG5cdHJldHVybiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBwYXNzaW5nIGZ1bmN0aW9uIGluIG9wdGlvbnMsIHRoZW4gdXNlIGl0IGZvciByZXNvbHZlIFwiaGVhZFwiIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgLy8gVXNlZnVsIGZvciBTaGFkb3cgUm9vdCBzdHlsZSBpLmVcbiAgICAgICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAgICAgLy8gICBpbnNlcnRJbnRvOiBmdW5jdGlvbiAoKSB7IHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Zvb1wiKS5zaGFkb3dSb290IH1cbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdHZhciBzdHlsZVRhcmdldCA9IGdldFRhcmdldC5jYWxsKHRoaXMsIHRhcmdldCk7XG5cdFx0XHQvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuXHRcdFx0aWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG5cdFx0XHRcdFx0Ly8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcblx0XHRcdFx0XHRzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuXHRcdFx0XHR9IGNhdGNoKGUpIHtcblx0XHRcdFx0XHRzdHlsZVRhcmdldCA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuXHRcdH1cblx0XHRyZXR1cm4gbWVtb1t0YXJnZXRdXG5cdH07XG59KSgpO1xuXG52YXIgc2luZ2xldG9uID0gbnVsbDtcbnZhclx0c2luZ2xldG9uQ291bnRlciA9IDA7XG52YXJcdHN0eWxlc0luc2VydGVkQXRUb3AgPSBbXTtcblxudmFyXHRmaXhVcmxzID0gcmVxdWlyZShcIi4vdXJsc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsaXN0LCBvcHRpb25zKSB7XG5cdGlmICh0eXBlb2YgREVCVUcgIT09IFwidW5kZWZpbmVkXCIgJiYgREVCVUcpIHtcblx0XHRpZiAodHlwZW9mIGRvY3VtZW50ICE9PSBcIm9iamVjdFwiKSB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgc3R5bGUtbG9hZGVyIGNhbm5vdCBiZSB1c2VkIGluIGEgbm9uLWJyb3dzZXIgZW52aXJvbm1lbnRcIik7XG5cdH1cblxuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRvcHRpb25zLmF0dHJzID0gdHlwZW9mIG9wdGlvbnMuYXR0cnMgPT09IFwib2JqZWN0XCIgPyBvcHRpb25zLmF0dHJzIDoge307XG5cblx0Ly8gRm9yY2Ugc2luZ2xlLXRhZyBzb2x1dGlvbiBvbiBJRTYtOSwgd2hpY2ggaGFzIGEgaGFyZCBsaW1pdCBvbiB0aGUgIyBvZiA8c3R5bGU+XG5cdC8vIHRhZ3MgaXQgd2lsbCBhbGxvdyBvbiBhIHBhZ2Vcblx0aWYgKCFvcHRpb25zLnNpbmdsZXRvbiAmJiB0eXBlb2Ygb3B0aW9ucy5zaW5nbGV0b24gIT09IFwiYm9vbGVhblwiKSBvcHRpb25zLnNpbmdsZXRvbiA9IGlzT2xkSUUoKTtcblxuXHQvLyBCeSBkZWZhdWx0LCBhZGQgPHN0eWxlPiB0YWdzIHRvIHRoZSA8aGVhZD4gZWxlbWVudFxuICAgICAgICBpZiAoIW9wdGlvbnMuaW5zZXJ0SW50bykgb3B0aW9ucy5pbnNlcnRJbnRvID0gXCJoZWFkXCI7XG5cblx0Ly8gQnkgZGVmYXVsdCwgYWRkIDxzdHlsZT4gdGFncyB0byB0aGUgYm90dG9tIG9mIHRoZSB0YXJnZXRcblx0aWYgKCFvcHRpb25zLmluc2VydEF0KSBvcHRpb25zLmluc2VydEF0ID0gXCJib3R0b21cIjtcblxuXHR2YXIgc3R5bGVzID0gbGlzdFRvU3R5bGVzKGxpc3QsIG9wdGlvbnMpO1xuXG5cdGFkZFN0eWxlc1RvRG9tKHN0eWxlcywgb3B0aW9ucyk7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZSAobmV3TGlzdCkge1xuXHRcdHZhciBtYXlSZW1vdmUgPSBbXTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgaXRlbSA9IHN0eWxlc1tpXTtcblx0XHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXG5cdFx0XHRkb21TdHlsZS5yZWZzLS07XG5cdFx0XHRtYXlSZW1vdmUucHVzaChkb21TdHlsZSk7XG5cdFx0fVxuXG5cdFx0aWYobmV3TGlzdCkge1xuXHRcdFx0dmFyIG5ld1N0eWxlcyA9IGxpc3RUb1N0eWxlcyhuZXdMaXN0LCBvcHRpb25zKTtcblx0XHRcdGFkZFN0eWxlc1RvRG9tKG5ld1N0eWxlcywgb3B0aW9ucyk7XG5cdFx0fVxuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtYXlSZW1vdmUubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBkb21TdHlsZSA9IG1heVJlbW92ZVtpXTtcblxuXHRcdFx0aWYoZG9tU3R5bGUucmVmcyA9PT0gMCkge1xuXHRcdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSBkb21TdHlsZS5wYXJ0c1tqXSgpO1xuXG5cdFx0XHRcdGRlbGV0ZSBzdHlsZXNJbkRvbVtkb21TdHlsZS5pZF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufTtcblxuZnVuY3Rpb24gYWRkU3R5bGVzVG9Eb20gKHN0eWxlcywgb3B0aW9ucykge1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlcy5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gc3R5bGVzW2ldO1xuXHRcdHZhciBkb21TdHlsZSA9IHN0eWxlc0luRG9tW2l0ZW0uaWRdO1xuXG5cdFx0aWYoZG9tU3R5bGUpIHtcblx0XHRcdGRvbVN0eWxlLnJlZnMrKztcblxuXHRcdFx0Zm9yKHZhciBqID0gMDsgaiA8IGRvbVN0eWxlLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGRvbVN0eWxlLnBhcnRzW2pdKGl0ZW0ucGFydHNbal0pO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IoOyBqIDwgaXRlbS5wYXJ0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRkb21TdHlsZS5wYXJ0cy5wdXNoKGFkZFN0eWxlKGl0ZW0ucGFydHNbal0sIG9wdGlvbnMpKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHBhcnRzID0gW107XG5cblx0XHRcdGZvcih2YXIgaiA9IDA7IGogPCBpdGVtLnBhcnRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdHBhcnRzLnB1c2goYWRkU3R5bGUoaXRlbS5wYXJ0c1tqXSwgb3B0aW9ucykpO1xuXHRcdFx0fVxuXG5cdFx0XHRzdHlsZXNJbkRvbVtpdGVtLmlkXSA9IHtpZDogaXRlbS5pZCwgcmVmczogMSwgcGFydHM6IHBhcnRzfTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdFRvU3R5bGVzIChsaXN0LCBvcHRpb25zKSB7XG5cdHZhciBzdHlsZXMgPSBbXTtcblx0dmFyIG5ld1N0eWxlcyA9IHt9O1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBpdGVtID0gbGlzdFtpXTtcblx0XHR2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcblx0XHR2YXIgY3NzID0gaXRlbVsxXTtcblx0XHR2YXIgbWVkaWEgPSBpdGVtWzJdO1xuXHRcdHZhciBzb3VyY2VNYXAgPSBpdGVtWzNdO1xuXHRcdHZhciBwYXJ0ID0ge2NzczogY3NzLCBtZWRpYTogbWVkaWEsIHNvdXJjZU1hcDogc291cmNlTWFwfTtcblxuXHRcdGlmKCFuZXdTdHlsZXNbaWRdKSBzdHlsZXMucHVzaChuZXdTdHlsZXNbaWRdID0ge2lkOiBpZCwgcGFydHM6IFtwYXJ0XX0pO1xuXHRcdGVsc2UgbmV3U3R5bGVzW2lkXS5wYXJ0cy5wdXNoKHBhcnQpO1xuXHR9XG5cblx0cmV0dXJuIHN0eWxlcztcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50IChvcHRpb25zLCBzdHlsZSkge1xuXHR2YXIgdGFyZ2V0ID0gZ2V0RWxlbWVudChvcHRpb25zLmluc2VydEludG8pXG5cblx0aWYgKCF0YXJnZXQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydEludG8nIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcblx0fVxuXG5cdHZhciBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcCA9IHN0eWxlc0luc2VydGVkQXRUb3Bbc3R5bGVzSW5zZXJ0ZWRBdFRvcC5sZW5ndGggLSAxXTtcblxuXHRpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJ0b3BcIikge1xuXHRcdGlmICghbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3ApIHtcblx0XHRcdHRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGUsIHRhcmdldC5maXJzdENoaWxkKTtcblx0XHR9IGVsc2UgaWYgKGxhc3RTdHlsZUVsZW1lbnRJbnNlcnRlZEF0VG9wLm5leHRTaWJsaW5nKSB7XG5cdFx0XHR0YXJnZXQuaW5zZXJ0QmVmb3JlKHN0eWxlLCBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cdFx0fVxuXHRcdHN0eWxlc0luc2VydGVkQXRUb3AucHVzaChzdHlsZSk7XG5cdH0gZWxzZSBpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gXCJib3R0b21cIikge1xuXHRcdHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMuaW5zZXJ0QXQgPT09IFwib2JqZWN0XCIgJiYgb3B0aW9ucy5pbnNlcnRBdC5iZWZvcmUpIHtcblx0XHR2YXIgbmV4dFNpYmxpbmcgPSBnZXRFbGVtZW50KG9wdGlvbnMuaW5zZXJ0SW50byArIFwiIFwiICsgb3B0aW9ucy5pbnNlcnRBdC5iZWZvcmUpO1xuXHRcdHRhcmdldC5pbnNlcnRCZWZvcmUoc3R5bGUsIG5leHRTaWJsaW5nKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJbU3R5bGUgTG9hZGVyXVxcblxcbiBJbnZhbGlkIHZhbHVlIGZvciBwYXJhbWV0ZXIgJ2luc2VydEF0JyAoJ29wdGlvbnMuaW5zZXJ0QXQnKSBmb3VuZC5cXG4gTXVzdCBiZSAndG9wJywgJ2JvdHRvbScsIG9yIE9iamVjdC5cXG4gKGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJwYWNrLWNvbnRyaWIvc3R5bGUtbG9hZGVyI2luc2VydGF0KVxcblwiKTtcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQgKHN0eWxlKSB7XG5cdGlmIChzdHlsZS5wYXJlbnROb2RlID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG5cdHN0eWxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGUpO1xuXG5cdHZhciBpZHggPSBzdHlsZXNJbnNlcnRlZEF0VG9wLmluZGV4T2Yoc3R5bGUpO1xuXHRpZihpZHggPj0gMCkge1xuXHRcdHN0eWxlc0luc2VydGVkQXRUb3Auc3BsaWNlKGlkeCwgMSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlU3R5bGVFbGVtZW50IChvcHRpb25zKSB7XG5cdHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcblxuXHRvcHRpb25zLmF0dHJzLnR5cGUgPSBcInRleHQvY3NzXCI7XG5cblx0YWRkQXR0cnMoc3R5bGUsIG9wdGlvbnMuYXR0cnMpO1xuXHRpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucywgc3R5bGUpO1xuXG5cdHJldHVybiBzdHlsZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTGlua0VsZW1lbnQgKG9wdGlvbnMpIHtcblx0dmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcblxuXHRvcHRpb25zLmF0dHJzLnR5cGUgPSBcInRleHQvY3NzXCI7XG5cdG9wdGlvbnMuYXR0cnMucmVsID0gXCJzdHlsZXNoZWV0XCI7XG5cblx0YWRkQXR0cnMobGluaywgb3B0aW9ucy5hdHRycyk7XG5cdGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zLCBsaW5rKTtcblxuXHRyZXR1cm4gbGluaztcbn1cblxuZnVuY3Rpb24gYWRkQXR0cnMgKGVsLCBhdHRycykge1xuXHRPYmplY3Qua2V5cyhhdHRycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0ZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBhZGRTdHlsZSAob2JqLCBvcHRpb25zKSB7XG5cdHZhciBzdHlsZSwgdXBkYXRlLCByZW1vdmUsIHJlc3VsdDtcblxuXHQvLyBJZiBhIHRyYW5zZm9ybSBmdW5jdGlvbiB3YXMgZGVmaW5lZCwgcnVuIGl0IG9uIHRoZSBjc3Ncblx0aWYgKG9wdGlvbnMudHJhbnNmb3JtICYmIG9iai5jc3MpIHtcblx0ICAgIHJlc3VsdCA9IG9wdGlvbnMudHJhbnNmb3JtKG9iai5jc3MpO1xuXG5cdCAgICBpZiAocmVzdWx0KSB7XG5cdCAgICBcdC8vIElmIHRyYW5zZm9ybSByZXR1cm5zIGEgdmFsdWUsIHVzZSB0aGF0IGluc3RlYWQgb2YgdGhlIG9yaWdpbmFsIGNzcy5cblx0ICAgIFx0Ly8gVGhpcyBhbGxvd3MgcnVubmluZyBydW50aW1lIHRyYW5zZm9ybWF0aW9ucyBvbiB0aGUgY3NzLlxuXHQgICAgXHRvYmouY3NzID0gcmVzdWx0O1xuXHQgICAgfSBlbHNlIHtcblx0ICAgIFx0Ly8gSWYgdGhlIHRyYW5zZm9ybSBmdW5jdGlvbiByZXR1cm5zIGEgZmFsc3kgdmFsdWUsIGRvbid0IGFkZCB0aGlzIGNzcy5cblx0ICAgIFx0Ly8gVGhpcyBhbGxvd3MgY29uZGl0aW9uYWwgbG9hZGluZyBvZiBjc3Ncblx0ICAgIFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHQgICAgXHRcdC8vIG5vb3Bcblx0ICAgIFx0fTtcblx0ICAgIH1cblx0fVxuXG5cdGlmIChvcHRpb25zLnNpbmdsZXRvbikge1xuXHRcdHZhciBzdHlsZUluZGV4ID0gc2luZ2xldG9uQ291bnRlcisrO1xuXG5cdFx0c3R5bGUgPSBzaW5nbGV0b24gfHwgKHNpbmdsZXRvbiA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKSk7XG5cblx0XHR1cGRhdGUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGUsIHN0eWxlSW5kZXgsIGZhbHNlKTtcblx0XHRyZW1vdmUgPSBhcHBseVRvU2luZ2xldG9uVGFnLmJpbmQobnVsbCwgc3R5bGUsIHN0eWxlSW5kZXgsIHRydWUpO1xuXG5cdH0gZWxzZSBpZiAoXG5cdFx0b2JqLnNvdXJjZU1hcCAmJlxuXHRcdHR5cGVvZiBVUkwgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBVUkwuY3JlYXRlT2JqZWN0VVJMID09PSBcImZ1bmN0aW9uXCIgJiZcblx0XHR0eXBlb2YgVVJMLnJldm9rZU9iamVjdFVSTCA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0dHlwZW9mIEJsb2IgPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCJcblx0KSB7XG5cdFx0c3R5bGUgPSBjcmVhdGVMaW5rRWxlbWVudChvcHRpb25zKTtcblx0XHR1cGRhdGUgPSB1cGRhdGVMaW5rLmJpbmQobnVsbCwgc3R5bGUsIG9wdGlvbnMpO1xuXHRcdHJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZSk7XG5cblx0XHRcdGlmKHN0eWxlLmhyZWYpIFVSTC5yZXZva2VPYmplY3RVUkwoc3R5bGUuaHJlZik7XG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHRzdHlsZSA9IGNyZWF0ZVN0eWxlRWxlbWVudChvcHRpb25zKTtcblx0XHR1cGRhdGUgPSBhcHBseVRvVGFnLmJpbmQobnVsbCwgc3R5bGUpO1xuXHRcdHJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZSk7XG5cdFx0fTtcblx0fVxuXG5cdHVwZGF0ZShvYmopO1xuXG5cdHJldHVybiBmdW5jdGlvbiB1cGRhdGVTdHlsZSAobmV3T2JqKSB7XG5cdFx0aWYgKG5ld09iaikge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRuZXdPYmouY3NzID09PSBvYmouY3NzICYmXG5cdFx0XHRcdG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmXG5cdFx0XHRcdG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXBcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHVwZGF0ZShvYmogPSBuZXdPYmopO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZW1vdmUoKTtcblx0XHR9XG5cdH07XG59XG5cbnZhciByZXBsYWNlVGV4dCA9IChmdW5jdGlvbiAoKSB7XG5cdHZhciB0ZXh0U3RvcmUgPSBbXTtcblxuXHRyZXR1cm4gZnVuY3Rpb24gKGluZGV4LCByZXBsYWNlbWVudCkge1xuXHRcdHRleHRTdG9yZVtpbmRleF0gPSByZXBsYWNlbWVudDtcblxuXHRcdHJldHVybiB0ZXh0U3RvcmUuZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuXHR9O1xufSkoKTtcblxuZnVuY3Rpb24gYXBwbHlUb1NpbmdsZXRvblRhZyAoc3R5bGUsIGluZGV4LCByZW1vdmUsIG9iaikge1xuXHR2YXIgY3NzID0gcmVtb3ZlID8gXCJcIiA6IG9iai5jc3M7XG5cblx0aWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcblx0XHRzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSByZXBsYWNlVGV4dChpbmRleCwgY3NzKTtcblx0fSBlbHNlIHtcblx0XHR2YXIgY3NzTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcyk7XG5cdFx0dmFyIGNoaWxkTm9kZXMgPSBzdHlsZS5jaGlsZE5vZGVzO1xuXG5cdFx0aWYgKGNoaWxkTm9kZXNbaW5kZXhdKSBzdHlsZS5yZW1vdmVDaGlsZChjaGlsZE5vZGVzW2luZGV4XSk7XG5cblx0XHRpZiAoY2hpbGROb2Rlcy5sZW5ndGgpIHtcblx0XHRcdHN0eWxlLmluc2VydEJlZm9yZShjc3NOb2RlLCBjaGlsZE5vZGVzW2luZGV4XSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHN0eWxlLmFwcGVuZENoaWxkKGNzc05vZGUpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBhcHBseVRvVGFnIChzdHlsZSwgb2JqKSB7XG5cdHZhciBjc3MgPSBvYmouY3NzO1xuXHR2YXIgbWVkaWEgPSBvYmoubWVkaWE7XG5cblx0aWYobWVkaWEpIHtcblx0XHRzdHlsZS5zZXRBdHRyaWJ1dGUoXCJtZWRpYVwiLCBtZWRpYSlcblx0fVxuXG5cdGlmKHN0eWxlLnN0eWxlU2hlZXQpIHtcblx0XHRzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG5cdH0gZWxzZSB7XG5cdFx0d2hpbGUoc3R5bGUuZmlyc3RDaGlsZCkge1xuXHRcdFx0c3R5bGUucmVtb3ZlQ2hpbGQoc3R5bGUuZmlyc3RDaGlsZCk7XG5cdFx0fVxuXG5cdFx0c3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlTGluayAobGluaywgb3B0aW9ucywgb2JqKSB7XG5cdHZhciBjc3MgPSBvYmouY3NzO1xuXHR2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuXHQvKlxuXHRcdElmIGNvbnZlcnRUb0Fic29sdXRlVXJscyBpc24ndCBkZWZpbmVkLCBidXQgc291cmNlbWFwcyBhcmUgZW5hYmxlZFxuXHRcdGFuZCB0aGVyZSBpcyBubyBwdWJsaWNQYXRoIGRlZmluZWQgdGhlbiBsZXRzIHR1cm4gY29udmVydFRvQWJzb2x1dGVVcmxzXG5cdFx0b24gYnkgZGVmYXVsdC4gIE90aGVyd2lzZSBkZWZhdWx0IHRvIHRoZSBjb252ZXJ0VG9BYnNvbHV0ZVVybHMgb3B0aW9uXG5cdFx0ZGlyZWN0bHlcblx0Ki9cblx0dmFyIGF1dG9GaXhVcmxzID0gb3B0aW9ucy5jb252ZXJ0VG9BYnNvbHV0ZVVybHMgPT09IHVuZGVmaW5lZCAmJiBzb3VyY2VNYXA7XG5cblx0aWYgKG9wdGlvbnMuY29udmVydFRvQWJzb2x1dGVVcmxzIHx8IGF1dG9GaXhVcmxzKSB7XG5cdFx0Y3NzID0gZml4VXJscyhjc3MpO1xuXHR9XG5cblx0aWYgKHNvdXJjZU1hcCkge1xuXHRcdC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzI2NjAzODc1XG5cdFx0Y3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIiArIGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSkgKyBcIiAqL1wiO1xuXHR9XG5cblx0dmFyIGJsb2IgPSBuZXcgQmxvYihbY3NzXSwgeyB0eXBlOiBcInRleHQvY3NzXCIgfSk7XG5cblx0dmFyIG9sZFNyYyA9IGxpbmsuaHJlZjtcblxuXHRsaW5rLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuXG5cdGlmKG9sZFNyYykgVVJMLnJldm9rZU9iamVjdFVSTChvbGRTcmMpO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2xpYi9hZGRTdHlsZXMuanNcbi8vIG1vZHVsZSBpZCA9IDM3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBSZWFjdERPTSBmcm9tIFwicmVhY3QtZG9tXCI7XG5pbXBvcnQgQXBwUm91dGVyIGZyb20gXCIuL3JvdXRlcy9hcHAucm91dGVyXCI7XG5cbi8vIEltcG9ydCBDU1NcbmltcG9ydCBcIm5vcm1hbGl6ZS5jc3Mvbm9ybWFsaXplLmNzc1wiO1xuaW1wb3J0IFwiLi9zdHlsZXMvbWFzdGVyLnNjc3NcIjtcblxuY29uc3Qgcm9vdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXBwXCIpO1xuXG5SZWFjdERPTS5yZW5kZXIoPEFwcFJvdXRlciAvPiwgcm9vdCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvQXBwLmpzIiwiaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtcbiAgQnJvd3NlclJvdXRlciBhcyBSb3V0ZXIsXG4gIExpbmssXG4gIFN3aXRjaCxcbiAgTmF2TGluayxcbiAgUm91dGVcbn0gZnJvbSBcInJlYWN0LXJvdXRlci1kb21cIjtcblxuLy8gSW1wb3J0IENvbXBvbmVudHNcbmltcG9ydCBOYXYgZnJvbSBcIi4uL2NvbXBvbmVudHMvc3RhdGljcy9OYXZpZ2F0aW9uXCI7XG5pbXBvcnQgRm9vdGVyIGZyb20gXCIuLi9jb21wb25lbnRzL3N0YXRpY3MvRm9vdGVyXCI7XG5pbXBvcnQgSGFtYnVyZ3VlciBmcm9tIFwiLi4vY29tcG9uZW50cy9zdGF0aWNzL0hhbWJ1cmd1ZXJcIjtcblxuLy8gUGFnZXNcbmltcG9ydCBIb21lcGFnZSBmcm9tIFwiLi4vY29tcG9uZW50cy9wYWdlcy9Ib21lcGFnZVwiO1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgQ2FsY3VsYXRvciBmcm9tIFwiLi4vY29tcG9uZW50cy91aS9DYWxjdWxhdG9yL0NhbGN1bGF0b3JcIjtcblxuY2xhc3MgQXBwUm91dGVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG1lbnVPcGVuOiBmYWxzZVxuICAgIH07XG4gIH1cblxuICBoYW5kbGVNZW51KCkge1xuICAgIGNvbnN0IHByZXYgPSB0aGlzLnN0YXRlLm1lbnVPcGVuO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBtZW51T3BlbjogIXByZXYgfSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxSb3V0ZXI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYXBwXCI+XG4gICAgICAgICAgPEhhbWJ1cmd1ZXJcbiAgICAgICAgICAgIG1lbnVPcGVuPXt0aGlzLnN0YXRlLm1lbnVPcGVufVxuICAgICAgICAgICAgaGFuZGxlTWVudT17dGhpcy5oYW5kbGVNZW51LmJpbmQodGhpcyl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFwcF9fc3RhdGljXCI+XG4gICAgICAgICAgICA8TmF2IG1lbnVPcGVuPXt0aGlzLnN0YXRlLm1lbnVPcGVufSAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBfX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhcHBfX2NvbXBvbmVudF9fY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgIDxTd2l0Y2g+XG4gICAgICAgICAgICAgICAgPFJvdXRlIGV4YWN0PXt0cnVlfSBwYXRoPVwiL1wiIGNvbXBvbmVudD17SG9tZXBhZ2V9IC8+XG4gICAgICAgICAgICAgICAgPFJvdXRlIGV4YWN0PXt0cnVlfSBwYXRoPVwiL2NhbGN1bGF0b3JcIiBjb21wb25lbnQ9e0NhbGN1bGF0b3J9IC8+XG4gICAgICAgICAgICAgIDwvU3dpdGNoPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPEZvb3RlciAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9Sb3V0ZXI+XG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHBSb3V0ZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcm91dGVzL2FwcC5yb3V0ZXIuanMiLCJpbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50IH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBOYXZMaW5rIH0gZnJvbSBcInJlYWN0LXJvdXRlci1kb21cIjtcbmltcG9ydCBDdXN0b21MaW5rIGZyb20gXCIuL0N1c3RvbUxpbmtcIjtcbmNsYXNzIE5hdiBleHRlbmRzIENvbXBvbmVudCB7XG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMucHJvcHMubWVudU9wZW5cbiAgICAgID8gXCJhcHBfX3NpZGViYXItLW9wZW5cIlxuICAgICAgOiBcImFwcF9fc2lkZWJhci0tY2xvc2VcIjtcbiAgICByZXR1cm4gKFxuICAgICAgPGFzaWRlIGNsYXNzTmFtZT17YGFwcF9fc2lkZWJhciAke3N0YXRlfWB9PlxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwiYXBwX19zaWRlYmFyLS1tZW51XCI+XG4gICAgICAgICAgPEN1c3RvbUxpbmsgdG89XCIvXCI+SG9tZTwvQ3VzdG9tTGluaz5cbiAgICAgICAgICA8Q3VzdG9tTGluayB0bz1cIi9jYWxjdWxhdG9yXCI+Q2FsY3VsYXRvcjwvQ3VzdG9tTGluaz5cbiAgICAgICAgPC91bD5cbiAgICAgIDwvYXNpZGU+XG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBOYXY7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29tcG9uZW50cy9zdGF0aWNzL05hdmlnYXRpb24uanMiLCJpbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBOYXZMaW5rIH0gZnJvbSBcInJlYWN0LXJvdXRlci1kb21cIjtcblxuY2xhc3MgQ3VzdG9tTGluayBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGxpPlxuICAgICAgICA8TmF2TGlua1xuICAgICAgICAgIGV4YWN0XG4gICAgICAgICAgYWN0aXZlQ2xhc3NOYW1lPVwiYXBwX19zaWRlYmFyLS1saW5rLS1hY3RpdmVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImFwcF9fc2lkZWJhci0tbGlua1wiXG4gICAgICAgICAgdG89e3RoaXMucHJvcHMudG99XG4gICAgICAgID5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgICAgPC9OYXZMaW5rPlxuICAgICAgPC9saT5cbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEN1c3RvbUxpbms7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29tcG9uZW50cy9zdGF0aWNzL0N1c3RvbUxpbmsuanMiLCJpbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50IH0gZnJvbSBcInJlYWN0XCI7XG5cbmNsYXNzIEZvb3RlciBleHRlbmRzIENvbXBvbmVudCB7XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGZvb3RlciBjbGFzc05hbWU9XCJhcHBfX2Zvb3RlclwiPlxuICAgICAgICA8cCBjbGFzc05hbWU9XCJhcHBfX2Zvb3Rlci0tY29weXJpZ2h0XCI+XG4gICAgICAgICAgQWxsIFJpZ2h0cyBSZXNlcnZlZCAyMDE4LiBDYXJsb3MgSS4gTWFydGluZXouICZjb3B5O1xuICAgICAgICA8L3A+XG4gICAgICA8L2Zvb3Rlcj5cbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZvb3RlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21wb25lbnRzL3N0YXRpY3MvRm9vdGVyLmpzIiwiaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudCB9IGZyb20gXCJyZWFjdFwiO1xuXG5jbGFzcyBIYW1idXJndWVyIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgaGFuZGxlQ2xpY2soKSB7XG4gICAgdGhpcy5wcm9wcy5oYW5kbGVNZW51KCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxkaXYgb25DbGljaz17dGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpfSBjbGFzc05hbWU9XCJhcHBfX2hhbWJ1cmd1ZXJcIj5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5tZW51T3BlbiA/IChcbiAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImFwcF9faGFtYnVyZ3Vlci0taWNvbiBhcHBfX2hhbWJ1cmd1ZXItLXdoaXRlIGljb24tY2xvc2VcIiAvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJhcHBfX2hhbWJ1cmd1ZXItLWljb24gaWNvbi1tZW51XCIgLz5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSGFtYnVyZ3VlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21wb25lbnRzL3N0YXRpY3MvSGFtYnVyZ3Vlci5qcyIsImltcG9ydCBSZWFjdCwgeyBDb21wb25lbnQgfSBmcm9tICdyZWFjdCdcblxuY2xhc3MgSG9tZXBhZ2UgZXh0ZW5kcyBDb21wb25lbnQge1xuIHJlbmRlciAoKSB7XG4gIHJldHVybiAoXG4gICA8ZGl2IGNsYXNzTmFtZT1cImFwcF9faG9tZXBhZ2VcIj5cbiAgICA8aDEgY2xhc3NOYW1lPVwiYXBwX19ob21lcGFnZS0tdGl0bGVcIj5VSSBSZWFjdCBQb3J0Zm9saW88L2gxPlxuICAgIDxwIGNsYXNzTmFtZT1cImFwcF9faG9tZXBhZ2UtLWRlc2NcIj5cbiAgICAgVGhpcyBpcyBhIHNtYWxsIHBvcnRmb2xpbyBzaXRlIEkndmUgYmVlbiB3b3JraW5nIG9uIGluIG9yZGVyIHRvIGxlYXJuIGFuZCBwcmFjdGljZSBuZXcgdGhpbmdzIHdpdGggUmVhY3QuanMgLyBOb2RlIC8gRXhwcmVzcyBhbmQgc29tZSBvdGhlciBsaWJyYXJpZXMgSSB3b3VsZCBsaWtlIHRvIGxlYXJuLlxuICAgIDwvcD5cbiAgICA8c21hbGwgY2xhc3NOYW1lPVwiYXBwX19ob21lcGFnZS0tZGlzY2xhaW1lclwiPlxuICAgICAgRGlzY2xhaW1lcjogSG9wZSB5b3UgZW5qb3kgd2hhdCB5b3Ugc2VlIGhlcmUuXG4gICAgPC9zbWFsbD5cbiAgIDwvZGl2PlxuICApXG4gfVxufVxuXG5leHBvcnQgZGVmYXVsdCBIb21lcGFnZVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21wb25lbnRzL3BhZ2VzL0hvbWVwYWdlLmpzIiwiaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IE51bWJlciBmcm9tIFwiLi9OdW1iZXJcIjtcbmltcG9ydCBTaWduIGZyb20gXCIuL1NpZ25cIjtcbmltcG9ydCBSZXN1bHRTY3JlZW4gZnJvbSBcIi4vUmVzdWx0U2NyZWVuXCI7XG5pbXBvcnQgSGlzdG9yeVNjcmVlbiBmcm9tIFwiLi9IaXN0b3J5U2NyZWVuXCI7XG5cbmNsYXNzIENhbGN1bGF0b3IgZXh0ZW5kcyBDb21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbnVtYmVyczogWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDAsIFwiLlwiXSxcbiAgICAgIHNpZ25zOiBbXCIqXCIsIFwiK1wiLCBcIi1cIiwgXCIvXCIsIFwiJVwiLCBcIj1cIl0sXG4gICAgICBvcGVyYXRpb246IFwiXCIsXG4gICAgICBoaXN0b3J5OiBcIjBcIixcbiAgICAgIHJlc3VsdDogXCIwXCIsXG4gICAgfTtcbiAgfVxuXG4gIGhhbmRsZUtleShpbnB1dCl7XG4gICAgaWYoIHRoaXMuc3RhdGUubnVtYmVycy5qb2luKCcnKS5pbmNsdWRlcyhpbnB1dC5rZXkpKSB0aGlzLmhhbmRsZUFkZE51bWJlcihpbnB1dC5rZXkpXG4gICAgaWYoIHRoaXMuc3RhdGUuc2lnbnMuam9pbignJykuaW5jbHVkZXMoaW5wdXQua2V5KSkgdGhpcy5oYW5kbGVBZGRTaWduKGlucHV0LmtleSlcbiAgICBpZiggaW5wdXQua2V5Q29kZSA9PSAxMyApIHRoaXMuaGFuZGxlUGVyZm9ybU9wZXJhdGlvbigpXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuaGFuZGxlS2V5LmJpbmQodGhpcykgKVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKXtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLmhhbmRsZUtleSApO1xuICB9XG4gIFxuXG4gIGhhbmRsZUFkZE51bWJlcihudW0pIHtcbiAgICBjb25zdCBvcCA9IHRoaXMuc3RhdGUub3BlcmF0aW9uLnRvU3RyaW5nKCk7XG4gICAgaWYgKG9wLmluY2x1ZGVzKFwiLlwiKSAmJiBudW0gPT0gXCIuXCIpIHJldHVybjtcbiAgICBpZiAob3AgPT0gXCIwXCIgJiYgbnVtID09IFwiMFwiKSByZXR1cm47XG5cbiAgICB0aGlzLnNldFN0YXRlKHByZXZTdGF0ZSA9PiB7XG4gICAgICBsZXQgb3BlcmF0aW9uID0gcHJldlN0YXRlLm9wZXJhdGlvbiArPSBudW0udG9TdHJpbmcoKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb3BlcmF0aW9uXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgaGFuZGxlUmVzZXQoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZShwcmV2ID0+IHtcbiAgICAgIGxldCBoID0gcHJldi5vcGVyYXRpb247XG4gICAgICByZXR1cm4ge1xuICAgICAgICBvcGVyYXRpb246IFwiXCIsXG4gICAgICAgIHJlc3VsdDogXCIwXCJcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBoYW5kbGVBZGRTaWduKHNpZ24pIHtcbiAgICBsZXQgbGFzdENoYXIgPSB0aGlzLnN0YXRlLm9wZXJhdGlvblt0aGlzLnN0YXRlLm9wZXJhdGlvbi5sZW5ndGggLSAxXTtcbiAgICBsZXQgb3BlcmF0aW9uO1xuICAgIGlmICh0aGlzLnN0YXRlLm9wZXJhdGlvbiA9PSBcIlwiKSByZXR1cm47XG4gICAgdGhpcy5zZXRTdGF0ZShwcmV2U3RhdGUgPT4ge1xuICAgICAgdGhpcy5zdGF0ZS5zaWducy5pbmRleE9mKGxhc3RDaGFyKSA9PSAtMVxuICAgICAgICA/IChvcGVyYXRpb24gPSBwcmV2U3RhdGUub3BlcmF0aW9uICs9IHNpZ24pXG4gICAgICAgIDogKG9wZXJhdGlvbiA9IHByZXZTdGF0ZS5vcGVyYXRpb24uc2xpY2UoMCwgLTEpICsgc2lnbi50b1N0cmluZygpKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9wZXJhdGlvblxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGhhbmRsZVBlcmZvcm1PcGVyYXRpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSB0aGlzLnN0YXRlLm9wZXJhdGlvbjtcbiAgICBjb25zdCBsYXN0Q2hhciA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICBjb25zdCBmaXJzdENoYXIgPSBhcmdzWzBdO1xuICAgIGlmICh0aGlzLnN0YXRlLnNpZ25zLmluZGV4T2YobGFzdENoYXIpICE9PSAtMSkgYXJncyA9IGFyZ3Muc2xpY2UoMCwgLTEpO1xuICAgIGlmIChmaXJzdENoYXIgPT0gMCAmJiAhYXJncy5pbmNsdWRlcygnLicpICkgYXJncyA9IGFyZ3Muc2xpY2UoMSlcbiAgICBjb25zdCBvcGVyYXRpb24gPSBhcmdzO1xuICAgIGxldCByZXN1bHQgPSBldmFsKG9wZXJhdGlvbikudG9TdHJpbmcoKTtcbiAgICBpZiAocmVzdWx0LmluY2x1ZGVzKCcuJykgJiYgcmVzdWx0Lmxlbmd0aCA+IDggKSByZXN1bHQgPSBNYXRoLmFicyhyZXN1bHQpLnRvRml4ZWQoNCk7XG4gICAgdGhpcy5zZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICByZXN1bHQsXG4gICAgICBoaXN0b3J5OiBvcGVyYXRpb24sXG4gICAgICBvcGVyYXRpb246IHJlc3VsdFxuICAgIH0pKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJjYWxjdWxhdG9yX19hcHBcIj4gXG4gICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwiY2FsY3VsYXRvcl9fYXBwLS1oZWFkZXJcIj5cbiAgICAgICAgICA8SGlzdG9yeVNjcmVlbiBoaXN0b3J5PXt0aGlzLnN0YXRlLmhpc3Rvcnl9IC8+XG4gICAgICAgICAgPFJlc3VsdFNjcmVlbiBvcGVyYXRpb249e3RoaXMuc3RhdGUub3BlcmF0aW9ufSAvPlxuICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwiY2FsY3VsYXRvcl9fYXBwLS1ib2R5XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjYWxjdWxhdG9yX19hcHAtLW51bWJlcnNcIj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiY2FsY3VsYXRvcl9fYXBwLS1yZXNldFwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlUmVzZXQuYmluZCh0aGlzKX1cbiAgICAgICAgICAgID4gQyA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxTaWduXG4gICAgICAgICAgICAgIGhhbmRsZUFkZFNpZ249e3RoaXMuaGFuZGxlQWRkU2lnbi5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgICBoYW5kbGVQZXJmb3JtT3BlcmF0aW9uPXt0aGlzLmhhbmRsZVBlcmZvcm1PcGVyYXRpb24uYmluZCh0aGlzKX1cbiAgICAgICAgICAgICAgc2lnbj17XCIlXCJ9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAge3RoaXMuc3RhdGUubnVtYmVycy5tYXAobnVtID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8TnVtYmVyXG4gICAgICAgICAgICAgICAgICBoYW5kbGVBZGROdW1iZXI9e3RoaXMuaGFuZGxlQWRkTnVtYmVyLmJpbmQodGhpcyl9XG4gICAgICAgICAgICAgICAgICBrZXk9e251bX1cbiAgICAgICAgICAgICAgICAgIG51bWJlcj17bnVtfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNhbGN1bGF0b3JfX2FwcC0tc2lnbnNcIj5cbiAgICAgICAgICAgIHt0aGlzLnN0YXRlLnNpZ25zLm1hcChzID0+IHtcbiAgICAgICAgICAgICAgaWYgKHMgPT09IFwiJVwiKSByZXR1cm47XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPFNpZ25cbiAgICAgICAgICAgICAgICAgIGhhbmRsZUFkZFNpZ249e3RoaXMuaGFuZGxlQWRkU2lnbi5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgICAgICAgaGFuZGxlUGVyZm9ybU9wZXJhdGlvbj17dGhpcy5oYW5kbGVQZXJmb3JtT3BlcmF0aW9uLmJpbmQoXG4gICAgICAgICAgICAgICAgICAgIHRoaXNcbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICBrZXk9e3N9XG4gICAgICAgICAgICAgICAgICBzaWduPXtzfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDYWxjdWxhdG9yO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NvbXBvbmVudHMvdWkvQ2FsY3VsYXRvci9DYWxjdWxhdG9yLmpzIiwiaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudCB9IGZyb20gXCJyZWFjdFwiO1xuXG5jbGFzcyBOdW1iZXIgZXh0ZW5kcyBDb21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge307XG4gIH1cblxuICBoYW5kbGVBZGROdW1iZXIoKSB7XG4gICAgdGhpcy5wcm9wcy5oYW5kbGVBZGROdW1iZXIodGhpcy5wcm9wcy5udW1iZXIpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGlzWmVybyA9IHRoaXMucHJvcHMubnVtYmVyID09PSAwID8gJ2lzLS16ZXJvJyA6ICcnO1xuICAgIHJldHVybiAoXG4gICAgICA8YnV0dG9uIGNsYXNzTmFtZT17YGNhbGN1bGF0b3JfX2FwcC0tbnVtYmVyICR7aXNaZXJvfWB9IG9uQ2xpY2s9e3RoaXMuaGFuZGxlQWRkTnVtYmVyLmJpbmQodGhpcyl9PlxuICAgICAgICB7dGhpcy5wcm9wcy5udW1iZXJ9XG4gICAgICA8L2J1dHRvbj5cbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE51bWJlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21wb25lbnRzL3VpL0NhbGN1bGF0b3IvTnVtYmVyLmpzIiwiaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudCB9IGZyb20gXCJyZWFjdFwiO1xuXG5jbGFzcyBTaWduIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgaGFuZGxlQWRkU2lnbigpIHtcbiAgICB0aGlzLnByb3BzLnNpZ24gPT0gXCI9XCJcbiAgICAgID8gdGhpcy5wcm9wcy5oYW5kbGVQZXJmb3JtT3BlcmF0aW9uKClcbiAgICAgIDogdGhpcy5wcm9wcy5oYW5kbGVBZGRTaWduKHRoaXMucHJvcHMuc2lnbik7XG4gIH1cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImNhbGN1bGF0b3JfX2FwcC0tc2lnblwiIG9uQ2xpY2s9e3RoaXMuaGFuZGxlQWRkU2lnbi5iaW5kKHRoaXMpfT57dGhpcy5wcm9wcy5zaWdufTwvYnV0dG9uPlxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2lnbjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21wb25lbnRzL3VpL0NhbGN1bGF0b3IvU2lnbi5qcyIsImltcG9ydCBSZWFjdCwgeyBDb21wb25lbnQgfSBmcm9tIFwicmVhY3RcIjtcblxuY2xhc3MgUmVzdWx0U2NyZWVuIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cImNhbGN1bGF0b3JfX2FwcC0tcmVzdWx0c1wiPnt0aGlzLnByb3BzLm9wZXJhdGlvbn08L2Rpdj47XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUmVzdWx0U2NyZWVuO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NvbXBvbmVudHMvdWkvQ2FsY3VsYXRvci9SZXN1bHRTY3JlZW4uanMiLCJpbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50IH0gZnJvbSBcInJlYWN0XCI7XG5cbmNsYXNzIEhpc3RvcnlTY3JlZW4gZXh0ZW5kcyBDb21wb25lbnQge1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwiY2FsY3VsYXRvcl9fYXBwLS1oaXN0b3J5XCI+e3RoaXMucHJvcHMuaGlzdG9yeX08L2Rpdj47XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSGlzdG9yeVNjcmVlbjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21wb25lbnRzL3VpL0NhbGN1bGF0b3IvSGlzdG9yeVNjcmVlbi5qcyIsIlxudmFyIGNvbnRlbnQgPSByZXF1aXJlKFwiISEuLi9jc3MtbG9hZGVyL2luZGV4LmpzIS4uL3Nhc3MtbG9hZGVyL2xpYi9sb2FkZXIuanMhLi9ub3JtYWxpemUuY3NzXCIpO1xuXG5pZih0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIGNvbnRlbnQgPSBbW21vZHVsZS5pZCwgY29udGVudCwgJyddXTtcblxudmFyIHRyYW5zZm9ybTtcbnZhciBpbnNlcnRJbnRvO1xuXG5cblxudmFyIG9wdGlvbnMgPSB7XCJobXJcIjp0cnVlfVxuXG5vcHRpb25zLnRyYW5zZm9ybSA9IHRyYW5zZm9ybVxub3B0aW9ucy5pbnNlcnRJbnRvID0gdW5kZWZpbmVkO1xuXG52YXIgdXBkYXRlID0gcmVxdWlyZShcIiEuLi9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcblxuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG5cbmlmKG1vZHVsZS5ob3QpIHtcblx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uL2Nzcy1sb2FkZXIvaW5kZXguanMhLi4vc2Fzcy1sb2FkZXIvbGliL2xvYWRlci5qcyEuL25vcm1hbGl6ZS5jc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi9jc3MtbG9hZGVyL2luZGV4LmpzIS4uL3Nhc3MtbG9hZGVyL2xpYi9sb2FkZXIuanMhLi9ub3JtYWxpemUuY3NzXCIpO1xuXG5cdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cblx0XHR2YXIgbG9jYWxzID0gKGZ1bmN0aW9uKGEsIGIpIHtcblx0XHRcdHZhciBrZXksIGlkeCA9IDA7XG5cblx0XHRcdGZvcihrZXkgaW4gYSkge1xuXHRcdFx0XHRpZighYiB8fCBhW2tleV0gIT09IGJba2V5XSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRpZHgrKztcblx0XHRcdH1cblxuXHRcdFx0Zm9yKGtleSBpbiBiKSBpZHgtLTtcblxuXHRcdFx0cmV0dXJuIGlkeCA9PT0gMDtcblx0XHR9KGNvbnRlbnQubG9jYWxzLCBuZXdDb250ZW50LmxvY2FscykpO1xuXG5cdFx0aWYoIWxvY2FscykgdGhyb3cgbmV3IEVycm9yKCdBYm9ydGluZyBDU1MgSE1SIGR1ZSB0byBjaGFuZ2VkIGNzcy1tb2R1bGVzIGxvY2Fscy4nKTtcblxuXHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0fSk7XG5cblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbm9ybWFsaXplLmNzcy9ub3JtYWxpemUuY3NzXG4vLyBtb2R1bGUgaWQgPSA4OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vY3NzLWxvYWRlci9saWIvY3NzLWJhc2UuanNcIikoZmFsc2UpO1xuLy8gaW1wb3J0c1xuXG5cbi8vIG1vZHVsZVxuZXhwb3J0cy5wdXNoKFttb2R1bGUuaWQsIFwiLyohIG5vcm1hbGl6ZS5jc3MgdjguMC4wIHwgTUlUIExpY2Vuc2UgfCBnaXRodWIuY29tL25lY29sYXMvbm9ybWFsaXplLmNzcyAqL1xcbi8qIERvY3VtZW50XFxuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG4vKipcXG4gKiAxLiBDb3JyZWN0IHRoZSBsaW5lIGhlaWdodCBpbiBhbGwgYnJvd3NlcnMuXFxuICogMi4gUHJldmVudCBhZGp1c3RtZW50cyBvZiBmb250IHNpemUgYWZ0ZXIgb3JpZW50YXRpb24gY2hhbmdlcyBpbiBpT1MuXFxuICovXFxuaHRtbCB7XFxuICBsaW5lLWhlaWdodDogMS4xNTtcXG4gIC8qIDEgKi9cXG4gIC13ZWJraXQtdGV4dC1zaXplLWFkanVzdDogMTAwJTtcXG4gIC8qIDIgKi8gfVxcblxcbi8qIFNlY3Rpb25zXFxuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG4vKipcXG4gKiBSZW1vdmUgdGhlIG1hcmdpbiBpbiBhbGwgYnJvd3NlcnMuXFxuICovXFxuYm9keSB7XFxuICBtYXJnaW46IDA7IH1cXG5cXG4vKipcXG4gKiBDb3JyZWN0IHRoZSBmb250IHNpemUgYW5kIG1hcmdpbiBvbiBgaDFgIGVsZW1lbnRzIHdpdGhpbiBgc2VjdGlvbmAgYW5kXFxuICogYGFydGljbGVgIGNvbnRleHRzIGluIENocm9tZSwgRmlyZWZveCwgYW5kIFNhZmFyaS5cXG4gKi9cXG5oMSB7XFxuICBmb250LXNpemU6IDJlbTtcXG4gIG1hcmdpbjogMC42N2VtIDA7IH1cXG5cXG4vKiBHcm91cGluZyBjb250ZW50XFxuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG4vKipcXG4gKiAxLiBBZGQgdGhlIGNvcnJlY3QgYm94IHNpemluZyBpbiBGaXJlZm94LlxcbiAqIDIuIFNob3cgdGhlIG92ZXJmbG93IGluIEVkZ2UgYW5kIElFLlxcbiAqL1xcbmhyIHtcXG4gIGJveC1zaXppbmc6IGNvbnRlbnQtYm94O1xcbiAgLyogMSAqL1xcbiAgaGVpZ2h0OiAwO1xcbiAgLyogMSAqL1xcbiAgb3ZlcmZsb3c6IHZpc2libGU7XFxuICAvKiAyICovIH1cXG5cXG4vKipcXG4gKiAxLiBDb3JyZWN0IHRoZSBpbmhlcml0YW5jZSBhbmQgc2NhbGluZyBvZiBmb250IHNpemUgaW4gYWxsIGJyb3dzZXJzLlxcbiAqIDIuIENvcnJlY3QgdGhlIG9kZCBgZW1gIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cXG4gKi9cXG5wcmUge1xcbiAgZm9udC1mYW1pbHk6IG1vbm9zcGFjZSwgbW9ub3NwYWNlO1xcbiAgLyogMSAqL1xcbiAgZm9udC1zaXplOiAxZW07XFxuICAvKiAyICovIH1cXG5cXG4vKiBUZXh0LWxldmVsIHNlbWFudGljc1xcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuLyoqXFxuICogUmVtb3ZlIHRoZSBncmF5IGJhY2tncm91bmQgb24gYWN0aXZlIGxpbmtzIGluIElFIDEwLlxcbiAqL1xcbmEge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7IH1cXG5cXG4vKipcXG4gKiAxLiBSZW1vdmUgdGhlIGJvdHRvbSBib3JkZXIgaW4gQ2hyb21lIDU3LVxcbiAqIDIuIEFkZCB0aGUgY29ycmVjdCB0ZXh0IGRlY29yYXRpb24gaW4gQ2hyb21lLCBFZGdlLCBJRSwgT3BlcmEsIGFuZCBTYWZhcmkuXFxuICovXFxuYWJiclt0aXRsZV0ge1xcbiAgYm9yZGVyLWJvdHRvbTogbm9uZTtcXG4gIC8qIDEgKi9cXG4gIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lO1xcbiAgLyogMiAqL1xcbiAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgZG90dGVkO1xcbiAgLyogMiAqLyB9XFxuXFxuLyoqXFxuICogQWRkIHRoZSBjb3JyZWN0IGZvbnQgd2VpZ2h0IGluIENocm9tZSwgRWRnZSwgYW5kIFNhZmFyaS5cXG4gKi9cXG5iLFxcbnN0cm9uZyB7XFxuICBmb250LXdlaWdodDogYm9sZGVyOyB9XFxuXFxuLyoqXFxuICogMS4gQ29ycmVjdCB0aGUgaW5oZXJpdGFuY2UgYW5kIHNjYWxpbmcgb2YgZm9udCBzaXplIGluIGFsbCBicm93c2Vycy5cXG4gKiAyLiBDb3JyZWN0IHRoZSBvZGQgYGVtYCBmb250IHNpemluZyBpbiBhbGwgYnJvd3NlcnMuXFxuICovXFxuY29kZSxcXG5rYmQsXFxuc2FtcCB7XFxuICBmb250LWZhbWlseTogbW9ub3NwYWNlLCBtb25vc3BhY2U7XFxuICAvKiAxICovXFxuICBmb250LXNpemU6IDFlbTtcXG4gIC8qIDIgKi8gfVxcblxcbi8qKlxcbiAqIEFkZCB0aGUgY29ycmVjdCBmb250IHNpemUgaW4gYWxsIGJyb3dzZXJzLlxcbiAqL1xcbnNtYWxsIHtcXG4gIGZvbnQtc2l6ZTogODAlOyB9XFxuXFxuLyoqXFxuICogUHJldmVudCBgc3ViYCBhbmQgYHN1cGAgZWxlbWVudHMgZnJvbSBhZmZlY3RpbmcgdGhlIGxpbmUgaGVpZ2h0IGluXFxuICogYWxsIGJyb3dzZXJzLlxcbiAqL1xcbnN1YixcXG5zdXAge1xcbiAgZm9udC1zaXplOiA3NSU7XFxuICBsaW5lLWhlaWdodDogMDtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTsgfVxcblxcbnN1YiB7XFxuICBib3R0b206IC0wLjI1ZW07IH1cXG5cXG5zdXAge1xcbiAgdG9wOiAtMC41ZW07IH1cXG5cXG4vKiBFbWJlZGRlZCBjb250ZW50XFxuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG4vKipcXG4gKiBSZW1vdmUgdGhlIGJvcmRlciBvbiBpbWFnZXMgaW5zaWRlIGxpbmtzIGluIElFIDEwLlxcbiAqL1xcbmltZyB7XFxuICBib3JkZXItc3R5bGU6IG5vbmU7IH1cXG5cXG4vKiBGb3Jtc1xcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuLyoqXFxuICogMS4gQ2hhbmdlIHRoZSBmb250IHN0eWxlcyBpbiBhbGwgYnJvd3NlcnMuXFxuICogMi4gUmVtb3ZlIHRoZSBtYXJnaW4gaW4gRmlyZWZveCBhbmQgU2FmYXJpLlxcbiAqL1xcbmJ1dHRvbixcXG5pbnB1dCxcXG5vcHRncm91cCxcXG5zZWxlY3QsXFxudGV4dGFyZWEge1xcbiAgZm9udC1mYW1pbHk6IGluaGVyaXQ7XFxuICAvKiAxICovXFxuICBmb250LXNpemU6IDEwMCU7XFxuICAvKiAxICovXFxuICBsaW5lLWhlaWdodDogMS4xNTtcXG4gIC8qIDEgKi9cXG4gIG1hcmdpbjogMDtcXG4gIC8qIDIgKi8gfVxcblxcbi8qKlxcbiAqIFNob3cgdGhlIG92ZXJmbG93IGluIElFLlxcbiAqIDEuIFNob3cgdGhlIG92ZXJmbG93IGluIEVkZ2UuXFxuICovXFxuYnV0dG9uLFxcbmlucHV0IHtcXG4gIC8qIDEgKi9cXG4gIG92ZXJmbG93OiB2aXNpYmxlOyB9XFxuXFxuLyoqXFxuICogUmVtb3ZlIHRoZSBpbmhlcml0YW5jZSBvZiB0ZXh0IHRyYW5zZm9ybSBpbiBFZGdlLCBGaXJlZm94LCBhbmQgSUUuXFxuICogMS4gUmVtb3ZlIHRoZSBpbmhlcml0YW5jZSBvZiB0ZXh0IHRyYW5zZm9ybSBpbiBGaXJlZm94LlxcbiAqL1xcbmJ1dHRvbixcXG5zZWxlY3Qge1xcbiAgLyogMSAqL1xcbiAgdGV4dC10cmFuc2Zvcm06IG5vbmU7IH1cXG5cXG4vKipcXG4gKiBDb3JyZWN0IHRoZSBpbmFiaWxpdHkgdG8gc3R5bGUgY2xpY2thYmxlIHR5cGVzIGluIGlPUyBhbmQgU2FmYXJpLlxcbiAqL1xcbmJ1dHRvbixcXG5bdHlwZT1cXFwiYnV0dG9uXFxcIl0sXFxuW3R5cGU9XFxcInJlc2V0XFxcIl0sXFxuW3R5cGU9XFxcInN1Ym1pdFxcXCJdIHtcXG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uOyB9XFxuXFxuLyoqXFxuICogUmVtb3ZlIHRoZSBpbm5lciBib3JkZXIgYW5kIHBhZGRpbmcgaW4gRmlyZWZveC5cXG4gKi9cXG5idXR0b246Oi1tb3otZm9jdXMtaW5uZXIsXFxuW3R5cGU9XFxcImJ1dHRvblxcXCJdOjotbW96LWZvY3VzLWlubmVyLFxcblt0eXBlPVxcXCJyZXNldFxcXCJdOjotbW96LWZvY3VzLWlubmVyLFxcblt0eXBlPVxcXCJzdWJtaXRcXFwiXTo6LW1vei1mb2N1cy1pbm5lciB7XFxuICBib3JkZXItc3R5bGU6IG5vbmU7XFxuICBwYWRkaW5nOiAwOyB9XFxuXFxuLyoqXFxuICogUmVzdG9yZSB0aGUgZm9jdXMgc3R5bGVzIHVuc2V0IGJ5IHRoZSBwcmV2aW91cyBydWxlLlxcbiAqL1xcbmJ1dHRvbjotbW96LWZvY3VzcmluZyxcXG5bdHlwZT1cXFwiYnV0dG9uXFxcIl06LW1vei1mb2N1c3JpbmcsXFxuW3R5cGU9XFxcInJlc2V0XFxcIl06LW1vei1mb2N1c3JpbmcsXFxuW3R5cGU9XFxcInN1Ym1pdFxcXCJdOi1tb3otZm9jdXNyaW5nIHtcXG4gIG91dGxpbmU6IDFweCBkb3R0ZWQgQnV0dG9uVGV4dDsgfVxcblxcbi8qKlxcbiAqIENvcnJlY3QgdGhlIHBhZGRpbmcgaW4gRmlyZWZveC5cXG4gKi9cXG5maWVsZHNldCB7XFxuICBwYWRkaW5nOiAwLjM1ZW0gMC43NWVtIDAuNjI1ZW07IH1cXG5cXG4vKipcXG4gKiAxLiBDb3JyZWN0IHRoZSB0ZXh0IHdyYXBwaW5nIGluIEVkZ2UgYW5kIElFLlxcbiAqIDIuIENvcnJlY3QgdGhlIGNvbG9yIGluaGVyaXRhbmNlIGZyb20gYGZpZWxkc2V0YCBlbGVtZW50cyBpbiBJRS5cXG4gKiAzLiBSZW1vdmUgdGhlIHBhZGRpbmcgc28gZGV2ZWxvcGVycyBhcmUgbm90IGNhdWdodCBvdXQgd2hlbiB0aGV5IHplcm8gb3V0XFxuICogICAgYGZpZWxkc2V0YCBlbGVtZW50cyBpbiBhbGwgYnJvd3NlcnMuXFxuICovXFxubGVnZW5kIHtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAvKiAxICovXFxuICBjb2xvcjogaW5oZXJpdDtcXG4gIC8qIDIgKi9cXG4gIGRpc3BsYXk6IHRhYmxlO1xcbiAgLyogMSAqL1xcbiAgbWF4LXdpZHRoOiAxMDAlO1xcbiAgLyogMSAqL1xcbiAgcGFkZGluZzogMDtcXG4gIC8qIDMgKi9cXG4gIHdoaXRlLXNwYWNlOiBub3JtYWw7XFxuICAvKiAxICovIH1cXG5cXG4vKipcXG4gKiBBZGQgdGhlIGNvcnJlY3QgdmVydGljYWwgYWxpZ25tZW50IGluIENocm9tZSwgRmlyZWZveCwgYW5kIE9wZXJhLlxcbiAqL1xcbnByb2dyZXNzIHtcXG4gIHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTsgfVxcblxcbi8qKlxcbiAqIFJlbW92ZSB0aGUgZGVmYXVsdCB2ZXJ0aWNhbCBzY3JvbGxiYXIgaW4gSUUgMTArLlxcbiAqL1xcbnRleHRhcmVhIHtcXG4gIG92ZXJmbG93OiBhdXRvOyB9XFxuXFxuLyoqXFxuICogMS4gQWRkIHRoZSBjb3JyZWN0IGJveCBzaXppbmcgaW4gSUUgMTAuXFxuICogMi4gUmVtb3ZlIHRoZSBwYWRkaW5nIGluIElFIDEwLlxcbiAqL1xcblt0eXBlPVxcXCJjaGVja2JveFxcXCJdLFxcblt0eXBlPVxcXCJyYWRpb1xcXCJdIHtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAvKiAxICovXFxuICBwYWRkaW5nOiAwO1xcbiAgLyogMiAqLyB9XFxuXFxuLyoqXFxuICogQ29ycmVjdCB0aGUgY3Vyc29yIHN0eWxlIG9mIGluY3JlbWVudCBhbmQgZGVjcmVtZW50IGJ1dHRvbnMgaW4gQ2hyb21lLlxcbiAqL1xcblt0eXBlPVxcXCJudW1iZXJcXFwiXTo6LXdlYmtpdC1pbm5lci1zcGluLWJ1dHRvbixcXG5bdHlwZT1cXFwibnVtYmVyXFxcIl06Oi13ZWJraXQtb3V0ZXItc3Bpbi1idXR0b24ge1xcbiAgaGVpZ2h0OiBhdXRvOyB9XFxuXFxuLyoqXFxuICogMS4gQ29ycmVjdCB0aGUgb2RkIGFwcGVhcmFuY2UgaW4gQ2hyb21lIGFuZCBTYWZhcmkuXFxuICogMi4gQ29ycmVjdCB0aGUgb3V0bGluZSBzdHlsZSBpbiBTYWZhcmkuXFxuICovXFxuW3R5cGU9XFxcInNlYXJjaFxcXCJdIHtcXG4gIC13ZWJraXQtYXBwZWFyYW5jZTogdGV4dGZpZWxkO1xcbiAgLyogMSAqL1xcbiAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7XFxuICAvKiAyICovIH1cXG5cXG4vKipcXG4gKiBSZW1vdmUgdGhlIGlubmVyIHBhZGRpbmcgaW4gQ2hyb21lIGFuZCBTYWZhcmkgb24gbWFjT1MuXFxuICovXFxuW3R5cGU9XFxcInNlYXJjaFxcXCJdOjotd2Via2l0LXNlYXJjaC1kZWNvcmF0aW9uIHtcXG4gIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTsgfVxcblxcbi8qKlxcbiAqIDEuIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXFxuICogMi4gQ2hhbmdlIGZvbnQgcHJvcGVydGllcyB0byBgaW5oZXJpdGAgaW4gU2FmYXJpLlxcbiAqL1xcbjo6LXdlYmtpdC1maWxlLXVwbG9hZC1idXR0b24ge1xcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247XFxuICAvKiAxICovXFxuICBmb250OiBpbmhlcml0O1xcbiAgLyogMiAqLyB9XFxuXFxuLyogSW50ZXJhY3RpdmVcXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcbi8qXFxuICogQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gRWRnZSwgSUUgMTArLCBhbmQgRmlyZWZveC5cXG4gKi9cXG5kZXRhaWxzIHtcXG4gIGRpc3BsYXk6IGJsb2NrOyB9XFxuXFxuLypcXG4gKiBBZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBhbGwgYnJvd3NlcnMuXFxuICovXFxuc3VtbWFyeSB7XFxuICBkaXNwbGF5OiBsaXN0LWl0ZW07IH1cXG5cXG4vKiBNaXNjXFxuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG4vKipcXG4gKiBBZGQgdGhlIGNvcnJlY3QgZGlzcGxheSBpbiBJRSAxMCsuXFxuICovXFxudGVtcGxhdGUge1xcbiAgZGlzcGxheTogbm9uZTsgfVxcblxcbi8qKlxcbiAqIEFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIElFIDEwLlxcbiAqL1xcbltoaWRkZW5dIHtcXG4gIGRpc3BsYXk6IG5vbmU7IH1cXG5cIiwgXCJcIl0pO1xuXG4vLyBleHBvcnRzXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyIS4vbm9kZV9tb2R1bGVzL3Nhc3MtbG9hZGVyL2xpYi9sb2FkZXIuanMhLi9ub2RlX21vZHVsZXMvbm9ybWFsaXplLmNzcy9ub3JtYWxpemUuY3NzXG4vLyBtb2R1bGUgaWQgPSA5MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcbi8qKlxuICogV2hlbiBzb3VyY2UgbWFwcyBhcmUgZW5hYmxlZCwgYHN0eWxlLWxvYWRlcmAgdXNlcyBhIGxpbmsgZWxlbWVudCB3aXRoIGEgZGF0YS11cmkgdG9cbiAqIGVtYmVkIHRoZSBjc3Mgb24gdGhlIHBhZ2UuIFRoaXMgYnJlYWtzIGFsbCByZWxhdGl2ZSB1cmxzIGJlY2F1c2Ugbm93IHRoZXkgYXJlIHJlbGF0aXZlIHRvIGFcbiAqIGJ1bmRsZSBpbnN0ZWFkIG9mIHRoZSBjdXJyZW50IHBhZ2UuXG4gKlxuICogT25lIHNvbHV0aW9uIGlzIHRvIG9ubHkgdXNlIGZ1bGwgdXJscywgYnV0IHRoYXQgbWF5IGJlIGltcG9zc2libGUuXG4gKlxuICogSW5zdGVhZCwgdGhpcyBmdW5jdGlvbiBcImZpeGVzXCIgdGhlIHJlbGF0aXZlIHVybHMgdG8gYmUgYWJzb2x1dGUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHBhZ2UgbG9jYXRpb24uXG4gKlxuICogQSBydWRpbWVudGFyeSB0ZXN0IHN1aXRlIGlzIGxvY2F0ZWQgYXQgYHRlc3QvZml4VXJscy5qc2AgYW5kIGNhbiBiZSBydW4gdmlhIHRoZSBgbnBtIHRlc3RgIGNvbW1hbmQuXG4gKlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzcykge1xuICAvLyBnZXQgY3VycmVudCBsb2NhdGlvblxuICB2YXIgbG9jYXRpb24gPSB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvdy5sb2NhdGlvbjtcblxuICBpZiAoIWxvY2F0aW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiZml4VXJscyByZXF1aXJlcyB3aW5kb3cubG9jYXRpb25cIik7XG4gIH1cblxuXHQvLyBibGFuayBvciBudWxsP1xuXHRpZiAoIWNzcyB8fCB0eXBlb2YgY3NzICE9PSBcInN0cmluZ1wiKSB7XG5cdCAgcmV0dXJuIGNzcztcbiAgfVxuXG4gIHZhciBiYXNlVXJsID0gbG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vXCIgKyBsb2NhdGlvbi5ob3N0O1xuICB2YXIgY3VycmVudERpciA9IGJhc2VVcmwgKyBsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9cXC9bXlxcL10qJC8sIFwiL1wiKTtcblxuXHQvLyBjb252ZXJ0IGVhY2ggdXJsKC4uLilcblx0Lypcblx0VGhpcyByZWd1bGFyIGV4cHJlc3Npb24gaXMganVzdCBhIHdheSB0byByZWN1cnNpdmVseSBtYXRjaCBicmFja2V0cyB3aXRoaW5cblx0YSBzdHJpbmcuXG5cblx0IC91cmxcXHMqXFwoICA9IE1hdGNoIG9uIHRoZSB3b3JkIFwidXJsXCIgd2l0aCBhbnkgd2hpdGVzcGFjZSBhZnRlciBpdCBhbmQgdGhlbiBhIHBhcmVuc1xuXHQgICAoICA9IFN0YXJ0IGEgY2FwdHVyaW5nIGdyb3VwXG5cdCAgICAgKD86ICA9IFN0YXJ0IGEgbm9uLWNhcHR1cmluZyBncm91cFxuXHQgICAgICAgICBbXikoXSAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgfCAgPSBPUlxuXHQgICAgICAgICBcXCggID0gTWF0Y2ggYSBzdGFydCBwYXJlbnRoZXNlc1xuXHQgICAgICAgICAgICAgKD86ICA9IFN0YXJ0IGFub3RoZXIgbm9uLWNhcHR1cmluZyBncm91cHNcblx0ICAgICAgICAgICAgICAgICBbXikoXSsgID0gTWF0Y2ggYW55dGhpbmcgdGhhdCBpc24ndCBhIHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgfCAgPSBPUlxuXHQgICAgICAgICAgICAgICAgIFxcKCAgPSBNYXRjaCBhIHN0YXJ0IHBhcmVudGhlc2VzXG5cdCAgICAgICAgICAgICAgICAgICAgIFteKShdKiAgPSBNYXRjaCBhbnl0aGluZyB0aGF0IGlzbid0IGEgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICAgICBcXCkgID0gTWF0Y2ggYSBlbmQgcGFyZW50aGVzZXNcblx0ICAgICAgICAgICAgICkgID0gRW5kIEdyb3VwXG4gICAgICAgICAgICAgICpcXCkgPSBNYXRjaCBhbnl0aGluZyBhbmQgdGhlbiBhIGNsb3NlIHBhcmVuc1xuICAgICAgICAgICkgID0gQ2xvc2Ugbm9uLWNhcHR1cmluZyBncm91cFxuICAgICAgICAgICogID0gTWF0Y2ggYW55dGhpbmdcbiAgICAgICApICA9IENsb3NlIGNhcHR1cmluZyBncm91cFxuXHQgXFwpICA9IE1hdGNoIGEgY2xvc2UgcGFyZW5zXG5cblx0IC9naSAgPSBHZXQgYWxsIG1hdGNoZXMsIG5vdCB0aGUgZmlyc3QuICBCZSBjYXNlIGluc2Vuc2l0aXZlLlxuXHQgKi9cblx0dmFyIGZpeGVkQ3NzID0gY3NzLnJlcGxhY2UoL3VybFxccypcXCgoKD86W14pKF18XFwoKD86W14pKF0rfFxcKFteKShdKlxcKSkqXFwpKSopXFwpL2dpLCBmdW5jdGlvbihmdWxsTWF0Y2gsIG9yaWdVcmwpIHtcblx0XHQvLyBzdHJpcCBxdW90ZXMgKGlmIHRoZXkgZXhpc3QpXG5cdFx0dmFyIHVucXVvdGVkT3JpZ1VybCA9IG9yaWdVcmxcblx0XHRcdC50cmltKClcblx0XHRcdC5yZXBsYWNlKC9eXCIoLiopXCIkLywgZnVuY3Rpb24obywgJDEpeyByZXR1cm4gJDE7IH0pXG5cdFx0XHQucmVwbGFjZSgvXicoLiopJyQvLCBmdW5jdGlvbihvLCAkMSl7IHJldHVybiAkMTsgfSk7XG5cblx0XHQvLyBhbHJlYWR5IGEgZnVsbCB1cmw/IG5vIGNoYW5nZVxuXHRcdGlmICgvXigjfGRhdGE6fGh0dHA6XFwvXFwvfGh0dHBzOlxcL1xcL3xmaWxlOlxcL1xcL1xcL3xcXHMqJCkvaS50ZXN0KHVucXVvdGVkT3JpZ1VybCkpIHtcblx0XHQgIHJldHVybiBmdWxsTWF0Y2g7XG5cdFx0fVxuXG5cdFx0Ly8gY29udmVydCB0aGUgdXJsIHRvIGEgZnVsbCB1cmxcblx0XHR2YXIgbmV3VXJsO1xuXG5cdFx0aWYgKHVucXVvdGVkT3JpZ1VybC5pbmRleE9mKFwiLy9cIikgPT09IDApIHtcblx0XHQgIFx0Ly9UT0RPOiBzaG91bGQgd2UgYWRkIHByb3RvY29sP1xuXHRcdFx0bmV3VXJsID0gdW5xdW90ZWRPcmlnVXJsO1xuXHRcdH0gZWxzZSBpZiAodW5xdW90ZWRPcmlnVXJsLmluZGV4T2YoXCIvXCIpID09PSAwKSB7XG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSByZWxhdGl2ZSB0byB0aGUgYmFzZSB1cmxcblx0XHRcdG5ld1VybCA9IGJhc2VVcmwgKyB1bnF1b3RlZE9yaWdVcmw7IC8vIGFscmVhZHkgc3RhcnRzIHdpdGggJy8nXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlIHJlbGF0aXZlIHRvIGN1cnJlbnQgZGlyZWN0b3J5XG5cdFx0XHRuZXdVcmwgPSBjdXJyZW50RGlyICsgdW5xdW90ZWRPcmlnVXJsLnJlcGxhY2UoL15cXC5cXC8vLCBcIlwiKTsgLy8gU3RyaXAgbGVhZGluZyAnLi8nXG5cdFx0fVxuXG5cdFx0Ly8gc2VuZCBiYWNrIHRoZSBmaXhlZCB1cmwoLi4uKVxuXHRcdHJldHVybiBcInVybChcIiArIEpTT04uc3RyaW5naWZ5KG5ld1VybCkgKyBcIilcIjtcblx0fSk7XG5cblx0Ly8gc2VuZCBiYWNrIHRoZSBmaXhlZCBjc3Ncblx0cmV0dXJuIGZpeGVkQ3NzO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9saWIvdXJscy5qc1xuLy8gbW9kdWxlIGlkID0gOTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXG52YXIgY29udGVudCA9IHJlcXVpcmUoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9zYXNzLWxvYWRlci9saWIvbG9hZGVyLmpzIS4vbWFzdGVyLnNjc3NcIik7XG5cbmlmKHR5cGVvZiBjb250ZW50ID09PSAnc3RyaW5nJykgY29udGVudCA9IFtbbW9kdWxlLmlkLCBjb250ZW50LCAnJ11dO1xuXG52YXIgdHJhbnNmb3JtO1xudmFyIGluc2VydEludG87XG5cblxuXG52YXIgb3B0aW9ucyA9IHtcImhtclwiOnRydWV9XG5cbm9wdGlvbnMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG5vcHRpb25zLmluc2VydEludG8gPSB1bmRlZmluZWQ7XG5cbnZhciB1cGRhdGUgPSByZXF1aXJlKFwiIS4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvbGliL2FkZFN0eWxlcy5qc1wiKShjb250ZW50LCBvcHRpb25zKTtcblxuaWYoY29udGVudC5sb2NhbHMpIG1vZHVsZS5leHBvcnRzID0gY29udGVudC5sb2NhbHM7XG5cbmlmKG1vZHVsZS5ob3QpIHtcblx0bW9kdWxlLmhvdC5hY2NlcHQoXCIhIS4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2luZGV4LmpzIS4uLy4uL25vZGVfbW9kdWxlcy9zYXNzLWxvYWRlci9saWIvbG9hZGVyLmpzIS4vbWFzdGVyLnNjc3NcIiwgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG5ld0NvbnRlbnQgPSByZXF1aXJlKFwiISEuLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9pbmRleC5qcyEuLi8uLi9ub2RlX21vZHVsZXMvc2Fzcy1sb2FkZXIvbGliL2xvYWRlci5qcyEuL21hc3Rlci5zY3NzXCIpO1xuXG5cdFx0aWYodHlwZW9mIG5ld0NvbnRlbnQgPT09ICdzdHJpbmcnKSBuZXdDb250ZW50ID0gW1ttb2R1bGUuaWQsIG5ld0NvbnRlbnQsICcnXV07XG5cblx0XHR2YXIgbG9jYWxzID0gKGZ1bmN0aW9uKGEsIGIpIHtcblx0XHRcdHZhciBrZXksIGlkeCA9IDA7XG5cblx0XHRcdGZvcihrZXkgaW4gYSkge1xuXHRcdFx0XHRpZighYiB8fCBhW2tleV0gIT09IGJba2V5XSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRpZHgrKztcblx0XHRcdH1cblxuXHRcdFx0Zm9yKGtleSBpbiBiKSBpZHgtLTtcblxuXHRcdFx0cmV0dXJuIGlkeCA9PT0gMDtcblx0XHR9KGNvbnRlbnQubG9jYWxzLCBuZXdDb250ZW50LmxvY2FscykpO1xuXG5cdFx0aWYoIWxvY2FscykgdGhyb3cgbmV3IEVycm9yKCdBYm9ydGluZyBDU1MgSE1SIGR1ZSB0byBjaGFuZ2VkIGNzcy1tb2R1bGVzIGxvY2Fscy4nKTtcblxuXHRcdHVwZGF0ZShuZXdDb250ZW50KTtcblx0fSk7XG5cblx0bW9kdWxlLmhvdC5kaXNwb3NlKGZ1bmN0aW9uKCkgeyB1cGRhdGUoKTsgfSk7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvc3R5bGVzL21hc3Rlci5zY3NzXG4vLyBtb2R1bGUgaWQgPSA5MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvbGliL2Nzcy1iYXNlLmpzXCIpKGZhbHNlKTtcbi8vIGltcG9ydHNcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIkBpbXBvcnQgdXJsKGh0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzP2ZhbWlseT1Sb2JvdG86MzAwLDQwMCw1MDAsOTAwKTtcIiwgXCJcIl0pO1xuXG4vLyBtb2R1bGVcbmV4cG9ydHMucHVzaChbbW9kdWxlLmlkLCBcIi8qXFxuXFxuKi9cXG4uYXBwX19zaWRlYmFyIHtcXG4gIGJhY2tncm91bmQ6ICNlZDYxNTM7XFxuICBiYWNrZ3JvdW5kOiAtbW96LWxpbmVhci1ncmFkaWVudCh0b3AsICNlZDYxNTMgMCUsICNmOGIyNmQgOTklKTtcXG4gIGJhY2tncm91bmQ6IC13ZWJraXQtbGluZWFyLWdyYWRpZW50KHRvcCwgI2VkNjE1MyAwJSwgI2Y4YjI2ZCA5OSUpO1xcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KHRvIGJvdHRvbSwgI2VkNjE1MyAwJSwgI2Y4YjI2ZCA5OSUpO1xcbiAgZmlsdGVyOiBwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoIHN0YXJ0Q29sb3JzdHI9JyNlZDYxNTMnLCBlbmRDb2xvcnN0cj0nI2Y4YjI2ZCcsIEdyYWRpZW50VHlwZT0wKTtcXG4gIHdpZHRoOiAzMjBweDtcXG4gIG1pbi1oZWlnaHQ6IDQyMHB4O1xcbiAgaGVpZ2h0OiAxMDB2aDtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgdHJhbnNpdGlvbjogYWxsIGVhc2UtaW4tb3V0IDQwMG1zO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApOyB9XFxuICAuYXBwX19zaWRlYmFyLS1tZW51IHtcXG4gICAgbGlzdC1zdHlsZTogbm9uZTtcXG4gICAgcGFkZGluZzogMDtcXG4gICAgbWFyZ2luOiAwO1xcbiAgICB3aWR0aDogMTAwJTsgfVxcbiAgICAuYXBwX19zaWRlYmFyLS1tZW51IGxpIHtcXG4gICAgICB3aWR0aDogMTAwJTtcXG4gICAgICBkaXNwbGF5OiBibG9jazsgfVxcbiAgLmFwcF9fc2lkZWJhci0tbGluayB7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gICAgbGlzdC1zdHlsZTogbm9uZTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIHBhZGRpbmc6IDVweCAwIDVweCAyMHB4O1xcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94OyB9XFxuICAgIC5hcHBfX3NpZGViYXItLWxpbmstLWFjdGl2ZSB7XFxuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkOyB9XFxuICAgICAgLmFwcF9fc2lkZWJhci0tbGluay0tYWN0aXZlOmJlZm9yZSB7XFxuICAgICAgICBjb250ZW50OiBcXFwiXFxcIjtcXG4gICAgICAgIHdpZHRoOiAzcHg7XFxuICAgICAgICBoZWlnaHQ6IDEwMCU7XFxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgICAgICBsZWZ0OiAwO1xcbiAgICAgICAgdG9wOiAwO1xcbiAgICAgICAgYmFja2dyb3VuZDogI2ZmZjsgfVxcbiAgICAgIC5hcHBfX3NpZGViYXItLWxpbmstLWFjdGl2ZTphZnRlciB7XFxuICAgICAgICBjb250ZW50OiBcXFwiXFxcIjtcXG4gICAgICAgIHdpZHRoOiAxMDAlO1xcbiAgICAgICAgaGVpZ2h0OiAxMDAlO1xcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICAgICAgbGVmdDogMDtcXG4gICAgICAgIHRvcDogMDtcXG4gICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTsgfVxcbiAgICAuYXBwX19zaWRlYmFyLS1saW5rOmhvdmVyIHtcXG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gICAgICAuYXBwX19zaWRlYmFyLS1saW5rOmhvdmVyOmJlZm9yZSB7XFxuICAgICAgICBjb250ZW50OiBcXFwiXFxcIjtcXG4gICAgICAgIHdpZHRoOiAzcHg7XFxuICAgICAgICBoZWlnaHQ6IDEwMCU7XFxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgICAgICBsZWZ0OiAwO1xcbiAgICAgICAgdG9wOiAwO1xcbiAgICAgICAgYmFja2dyb3VuZDogI2ZmZjsgfVxcbiAgICAgIC5hcHBfX3NpZGViYXItLWxpbms6aG92ZXI6YWZ0ZXIge1xcbiAgICAgICAgY29udGVudDogXFxcIlxcXCI7XFxuICAgICAgICB3aWR0aDogMTAwJTtcXG4gICAgICAgIGhlaWdodDogMTAwJTtcXG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgICAgIGxlZnQ6IDA7XFxuICAgICAgICB0b3A6IDA7XFxuICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7IH1cXG5cXG5AbWVkaWEgYWxsIGFuZCAobWF4LXdpZHRoOiA3NjhweCkge1xcbiAgLmFwcF9fc2lkZWJhci0tY2xvc2Uge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtMzIwcHgpOyB9XFxuICAuYXBwX19zaWRlYmFyLS1vcGVuIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMCk7IH0gfVxcblxcbi5hcHBfX3N0YXRpYyB7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZGlzcGxheTogLXdlYmtpdC1mbGV4O1xcbiAgZmxleC13cmFwOiB3cmFwO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgZmxleC1kaXJlY3Rpb246IHJvdztcXG4gIHdpZHRoOiAxMDAlOyB9XFxuXFxuLmFwcF9fY29tcG9uZW50X19jb250YWluZXIge1xcbiAgaGVpZ2h0OiBjYWxjKDEwMCUgLSA4MHB4KTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgbWluLWhlaWdodDogNDIwcHg7IH1cXG5cXG4uYXBwX19jb250ZW50IHtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBkaXNwbGF5OiAtd2Via2l0LWZsZXg7XFxuICBmbGV4LXdyYXA6IHdyYXA7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgd2lkdGg6IGNhbGMoMTAwJSAtIDMyMHB4KTtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cXG5cXG5AbWVkaWEgYWxsIGFuZCAobWF4LXdpZHRoOiA3NjhweCkge1xcbiAgLmFwcF9fY29udGVudCB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMHZoO1xcbiAgICBtaW4taGVpZ2h0OiA2MDBweDsgfSB9XFxuXFxuLmFwcF9faG9tZXBhZ2Uge1xcbiAgbWF4LXdpZHRoOiA2NTBweDtcXG4gIHBhZGRpbmc6IDAgMzBweDtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7IH1cXG4gIC5hcHBfX2hvbWVwYWdlLS10aXRsZSB7XFxuICAgIGZvbnQtc2l6ZTogMjlweDtcXG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcXG4gICAgZm9udC13ZWlnaHQ6IGxpZ2h0ZXI7XFxuICAgIGxldHRlci1zcGFjaW5nOiA0LjRwdDtcXG4gICAgbWFyZ2luOiAwIDAgMjBweCAwO1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7IH1cXG4gICAgLmFwcF9faG9tZXBhZ2UtLXRpdGxlOmFmdGVyIHtcXG4gICAgICBjb250ZW50OiAnJztcXG4gICAgICBkaXNwbGF5OiBibG9jaztcXG4gICAgICB3aWR0aDogNTBweDtcXG4gICAgICBoZWlnaHQ6IDRweDtcXG4gICAgICBib3R0b206IDA7XFxuICAgICAgbGVmdDogMDtcXG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgICAgYmFja2dyb3VuZDogI2VmNmU1NzsgfVxcbiAgLmFwcF9faG9tZXBhZ2UtLWRlc2Mge1xcbiAgICBmb250LXNpemU6IDE4cHg7XFxuICAgIGxldHRlci1zcGFjaW5nOiAuNXB0OyB9XFxuICAuYXBwX19ob21lcGFnZS0tZGlzY2xhaW1lciB7XFxuICAgIGNvbG9yOiAjYWFhMzcyO1xcbiAgICBmb250LXdlaWdodDogNjAwO1xcbiAgICB0ZXh0LWFsaWduOiByaWdodDtcXG4gICAgZGlzcGxheTogYmxvY2s7XFxuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuICAgIGxldHRlci1zcGFjaW5nOiAuNXB0OyB9XFxuXFxuLmFwcF9faGFtYnVyZ3VlciB7XFxuICBkaXNwbGF5OiBub25lO1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgbGVmdDogMDtcXG4gIHRvcDogMHB4O1xcbiAgei1pbmRleDogMTAwOyB9XFxuICAuYXBwX19oYW1idXJndWVyLS1pY29uIHtcXG4gICAgY29sb3I6ICMwMDA7XFxuICAgIGZvbnQtc2l6ZTogMS40ZW07XFxuICAgIGhlaWdodDogNTBweDtcXG4gICAgd2lkdGg6IDUwcHg7XFxuICAgIGxpbmUtaGVpZ2h0OiA1MHB4O1xcbiAgICBkaXNwbGF5OiBibG9jaztcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyOyB9XFxuICAuYXBwX19oYW1idXJndWVyLS13aGl0ZSB7XFxuICAgIGNvbG9yOiAjZmZmOyB9XFxuXFxuQG1lZGlhIGFsbCBhbmQgKG1heC13aWR0aDogNzY4cHgpIHtcXG4gIC5hcHBfX2hhbWJ1cmd1ZXIge1xcbiAgICBkaXNwbGF5OiBibG9jazsgfSB9XFxuXFxuLmFwcF9fZm9vdGVyIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBqdXN0aWZ5LWl0ZW1zOiBjZW50ZXI7XFxuICBoZWlnaHQ6IDgwcHg7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7IH1cXG4gIC5hcHBfX2Zvb3Rlci0tY29weXJpZ2h0IHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIG1hcmdpbjogMDtcXG4gICAgZm9udC1zaXplOiAwLjhlbTtcXG4gICAgY29sb3I6ICM2MzYzNjM7IH1cXG5cXG5odG1sLFxcbi5yb290IHtcXG4gIGZvbnQtc2l6ZTogMTZweDtcXG4gIGxpbmUtaGVpZ2h0OiAzM3B4O1xcbiAgZm9udC1mYW1pbHk6IFxcXCJSb2JvdG9cXFwiLCBcXFwiQXJpYWxcXFwiLCBcXFwiSGVsdmV0aWNhXFxcIiwgc2Fucy1zZXJpZjtcXG4gIC13ZWJraXQtZm9udC1zbW9vdGhpbmc6IGFudGlhbGlhc2VkO1xcbiAgLW1vei1vc3gtZm9udC1zbW9vdGhpbmc6IGdyYXlzY2FsZTsgfVxcblxcbmgxLFxcbi5oMSB7XFxuICBmb250LXNpemU6IDMuNDM3NXJlbTtcXG4gIGxpbmUtaGVpZ2h0OiA0LjEyNXJlbTtcXG4gIG1hcmdpbi10b3A6IDIuMDYyNXJlbTtcXG4gIG1hcmdpbi1ib3R0b206IDQuMTI1cmVtOyB9XFxuXFxuaDIsXFxuLmgyIHtcXG4gIGZvbnQtc2l6ZTogMi4yNXJlbTtcXG4gIGxpbmUtaGVpZ2h0OiA0LjEyNXJlbTtcXG4gIG1hcmdpbi10b3A6IDIuMDYyNXJlbTtcXG4gIG1hcmdpbi1ib3R0b206IDIuMDYyNXJlbTsgfVxcblxcbmgzLFxcbi5oMyB7XFxuICBmb250LXNpemU6IDEuNXJlbTtcXG4gIGxpbmUtaGVpZ2h0OiAyLjA2MjVyZW07XFxuICBtYXJnaW4tdG9wOiAyLjA2MjVyZW07XFxuICBtYXJnaW4tYm90dG9tOiAwcmVtOyB9XFxuXFxuaDQsXFxuLmg0IHtcXG4gIGZvbnQtc2l6ZTogMXJlbTtcXG4gIGxpbmUtaGVpZ2h0OiAyLjA2MjVyZW07XFxuICBtYXJnaW4tdG9wOiAyLjA2MjVyZW07XFxuICBtYXJnaW4tYm90dG9tOiAwcmVtOyB9XFxuXFxuaDUsXFxuLmg1IHtcXG4gIGZvbnQtc2l6ZTogMXJlbTtcXG4gIGxpbmUtaGVpZ2h0OiAyLjA2MjVyZW07XFxuICBtYXJnaW4tdG9wOiAyLjA2MjVyZW07XFxuICBtYXJnaW4tYm90dG9tOiAwcmVtOyB9XFxuXFxucCxcXG51bCxcXG5vbCxcXG5wcmUsXFxudGFibGUsXFxuYmxvY2txdW90ZSB7XFxuICBtYXJnaW4tdG9wOiAwcmVtO1xcbiAgbWFyZ2luLWJvdHRvbTogMi4wNjI1cmVtOyB9XFxuXFxudWwgdWwsXFxub2wgb2wsXFxudWwgb2wsXFxub2wgdWwge1xcbiAgbWFyZ2luLXRvcDogMHJlbTtcXG4gIG1hcmdpbi1ib3R0b206IDByZW07IH1cXG5cXG4vKiBMZXQncyBtYWtlIHN1cmUgYWxsJ3MgYWxpZ25lZCAqL1xcbmhyLFxcbi5ociB7XFxuICBib3JkZXI6IDFweCBzb2xpZDtcXG4gIG1hcmdpbjogLTFweCAwOyB9XFxuXFxuc3ViLFxcbnN1cCB7XFxuICBsaW5lLWhlaWdodDogMDtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTsgfVxcblxcbnN1cCB7XFxuICB0b3A6IC0wLjVlbTsgfVxcblxcbnN1YiB7XFxuICBib3R0b206IC0wLjI1ZW07IH1cXG5cXG4vKlxcbiBVSSdzXFxuKi9cXG4uY2FsY3VsYXRvcl9fYXBwIHtcXG4gIHdpZHRoOiAzMDBweDtcXG4gIGhlaWdodDogYXV0bztcXG4gIGJvcmRlci1yYWRpdXM6IDEwcHg7XFxuICBib3gtc2hhZG93OiAwcHggMHB4IDI2cHggMnB4ICNlNmU2ZTY7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kOyB9XFxuICAuY2FsY3VsYXRvcl9fYXBwLS1oZWFkZXIge1xcbiAgICB3aWR0aDogMTAwJTsgfVxcbiAgLmNhbGN1bGF0b3JfX2FwcC0tYm9keSB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LXdyYXA6IHdyYXA7XFxuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0OyB9XFxuICAuY2FsY3VsYXRvcl9fYXBwLS1yZXNldCB7XFxuICAgIGJvcmRlcjogbm9uZTtcXG4gICAgYmFja2dyb3VuZDogI2Y1ZTFmZDtcXG4gICAgd2lkdGg6IDUwJTtcXG4gICAgaGVpZ2h0OiA1MHB4OyB9XFxuICAuY2FsY3VsYXRvcl9fYXBwLS1udW1iZXIge1xcbiAgICBib3JkZXI6IG5vbmU7XFxuICAgIGJhY2tncm91bmQ6ICNlZWVkZmY7XFxuICAgIHdpZHRoOiAzMy4zMzMzMyU7XFxuICAgIGhlaWdodDogNTBweDsgfVxcbiAgLmNhbGN1bGF0b3JfX2FwcCAuaXMtLXplcm8ge1xcbiAgICBmbGV4LWdyb3c6IDI7IH1cXG4gIC5jYWxjdWxhdG9yX19hcHAtLW51bWJlcnMge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LXdyYXA6IHdyYXA7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiByb3c7XFxuICAgIHdpZHRoOiA3NSU7IH1cXG4gICAgLmNhbGN1bGF0b3JfX2FwcC0tbnVtYmVycyAuY2FsY3VsYXRvcl9fYXBwLS1zaWduIHtcXG4gICAgICB3aWR0aDogMzMlO1xcbiAgICAgIGJvcmRlcjogbm9uZTtcXG4gICAgICBiYWNrZ3JvdW5kOiAjZWVlZGZmO1xcbiAgICAgIHdpZHRoOiA1MCU7XFxuICAgICAgaGVpZ2h0OiA1MHB4O1xcbiAgICAgIGNvbG9yOiAjMDAwOyB9XFxuICAuY2FsY3VsYXRvcl9fYXBwLS1zaWducyB7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIHdpZHRoOiAyNSU7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGJhY2tncm91bmQ6ICNmNmQzNjE7XFxuICAgIGJhY2tncm91bmQ6IC1tb3otbGluZWFyLWdyYWRpZW50KHRvcCwgI2Y2ZDM2MSAwJSwgI2ZmOWI2NiAxMDAlKTtcXG4gICAgLyogRkYzLjYtMTUgKi9cXG4gICAgYmFja2dyb3VuZDogLXdlYmtpdC1saW5lYXItZ3JhZGllbnQodG9wLCAjZjZkMzYxIDAlLCAjZmY5YjY2IDEwMCUpO1xcbiAgICAvKiBDaHJvbWUxMC0yNSxTYWZhcmk1LjEtNiAqL1xcbiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tLCAjZjZkMzYxIDAlLCAjZmY5YjY2IDEwMCUpO1xcbiAgICAvKiBXM0MsIElFMTArLCBGRjE2KywgQ2hyb21lMjYrLCBPcGVyYTEyKywgU2FmYXJpNysgKi9cXG4gICAgZmlsdGVyOiBwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoIHN0YXJ0Q29sb3JzdHI9JyNmNmQzNjEnLCBlbmRDb2xvcnN0cj0nI2ZmOWI2NicsR3JhZGllbnRUeXBlPTAgKTtcXG4gICAgLyogSUU2LTkgKi8gfVxcbiAgLmNhbGN1bGF0b3JfX2FwcC0tc2lnbiB7XFxuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xcbiAgICBoZWlnaHQ6IDUwcHg7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBjb2xvcjogI2ZmZjtcXG4gICAgZm9udC1zaXplOiAyMHB4O1xcbiAgICBib3JkZXI6IG5vbmU7IH1cXG4gIC5jYWxjdWxhdG9yX19hcHAtLWhpc3Rvcnkge1xcbiAgICB0ZXh0LWFsaWduOiByaWdodDtcXG4gICAgcGFkZGluZzogMTBweCAyMHB4O1xcbiAgICBmb250LXdlaWdodDogNTAwO1xcbiAgICBjb2xvcjogIzlmOWY5ZjtcXG4gICAgbGV0dGVyLXNwYWNpbmc6IDFwdDsgfVxcbiAgLmNhbGN1bGF0b3JfX2FwcC0tcmVzdWx0cyB7XFxuICAgIHRleHQtYWxpZ246IHJpZ2h0O1xcbiAgICBwYWRkaW5nOiAxMHB4IDIwcHg7XFxuICAgIGZvbnQtc2l6ZTogNDhweDtcXG4gICAgZm9udC13ZWlnaHQ6IGxpZ2h0ZXI7XFxuICAgIG1hcmdpbjogMDtcXG4gICAgaGVpZ2h0OiA1M3B4OyB9XFxuXCIsIFwiXCJdKTtcblxuLy8gZXhwb3J0c1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlciEuL25vZGVfbW9kdWxlcy9zYXNzLWxvYWRlci9saWIvbG9hZGVyLmpzIS4vc3JjL3N0eWxlcy9tYXN0ZXIuc2Nzc1xuLy8gbW9kdWxlIGlkID0gOTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==