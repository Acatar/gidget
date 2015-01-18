var RouteEngine,
        Route;
    
    // heavily influenced by Simrau
    Route = (function ($) {
        var Route,
            shortcut,
            __hasProp = {}.hasOwnProperty,
            __slice = [].slice;

        Route = function (pattern) {
            var flags,
                name,
                names;
            
            this.pattern = pattern;

            pattern = String(this.pattern);
            names = pattern.match(this.RegExpCache.allParams);
            
            if (names != null) {
                this.params = (function () {
                    var _i, _len, _results;
                    _results = [];
                    for (_i = 0, _len = names.length; _i < _len; _i++) {
                        name = names[_i];
                        _results.push(name.substr(1));
                    }
                    
                    return _results;
                }());
            } else {
                this.params = [];
            }
            
            pattern = pattern.replace(this.RegExpCache.escapeRegExp, '\\$&');
            pattern = pattern.replace(this.RegExpCache.namedParam, '([^\/]+)');
            pattern = pattern.replace(this.RegExpCache.splatParam, '(.+?)');
            flags = 'i'; // case insensitive
            this.expr = new RegExp('^' + pattern + '$', flags);
        };
        
        // Some regular expressions - thanks Backbone.js!
        Route.prototype.RegExpCache = {
            escapeRegExp: /[-[\]{}()+?.,\\^$|#\s]/g,
            namedParam: /:(\w+)/g,
            splatParam: /\*(\w+)/g,
            firstParam: /(:\w+)|(\*\w+)/,
            allParams: /(:|\*)\w+/g
        };

        Route.prototype.match = function (hash) {
            var index, matches, name, result, _i, _len, _ref;
            
            matches = this.expr.exec(hash);
            if ($.isArray(matches)) {
                result = {};
                _ref = this.params;
                for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
                    name = _ref[index];
                    result[name] = matches[index + 1];
                }
            } else {
                result = false;
            }
            
            return result;
        };

        Route.prototype.assemble = function () {
            var name, url, value, values;
            values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            if (values.length > 0) {
                if ($.isArray(values[0])) {
                    values = values[0];
                } else if ($.isPlainObject(values[0])) {
                    values = (function () {
                        var _i, _len, _ref, _results;
                        _ref = this.params;
                        _results = [];
                        
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            name = _ref[_i];
                            _results.push(name in values[0] ? values[0][name] : '');
                        }
                        
                        return _results;
                    }).call(this);
                }
            }
      
            url = String(this.pattern);
            
            while (this.RegExpCache.firstParam.test(url)) {
                value = values.length > 0 ? values.shift() : '';
                
                if ($.isFunction(value)) {
                    value = value(this);
                }
            
                url = url.replace(this.RegExpCache.firstParam, String(value));
            }
        
            return url;
        };

        Route.prototype.toString = function () {
            return String(this.pattern);
        };

        Route.prototype.attachAction = function (action, method) {
            if (method == null) {
                method = 'any';
            }
            
            $(this).on('gidget::' + method.toLowerCase(), action);
            return this;
        };

        Route.prototype.attachActions = function (actions, method) {
            var action, list, tmp, _i, _len, _ref;
            
            if (method == null) {
                method = 'any';
            }
            
            if (!$.isPlainObject(actions)) {
                _ref = [{}, actions], actions = _ref[0], tmp = _ref[1];
                actions[method] = tmp;
            }
      
            for (method in actions) {
                if (!__hasProp.call(actions, method)) {
                    continue;
                }
                
                list = actions[method];
                
                if (!$.isArray(list)) {
                    list = [list];
                }
        
                for (_i = 0, _len = list.length; _i < _len; _i++) {
                    action = list[_i];
                    this.attachAction(action, method);
                }
            }
      
            return this;
        };

        Route.prototype.detachAction = function(action, method) {
            var eventName;
        
            if (method == null) {
                method = 'any';
            }
      
            if (typeof action === 'string') {
                method = action;
            }
      
            eventName = 'gidget::' + method.toLowerCase();
      
            if ($.isFunction(action)) {
                $(this).off(eventName, action);
            } else {
                $(this).off(eventName);
            }
      
            return this;
        };

        shortcut = function(method) {
            return function(action) {
                return this.attachAction(action, method);
            };
        };

        Route.prototype.get = shortcut('get');
        Route.prototype.post = shortcut('post');
        Route.prototype.put = shortcut('put');
        Route.prototype["delete"] = shortcut('delete');
        Route.prototype.any = shortcut('any');

        return Route;

  }(jQuery));
        
        
    RouteEngine = function () {
        
        var routes = {},
            addRoute,
            removeRoute,
            resolve,
            __hasProp = {}.hasOwnProperty,
            observeHash = false,
            observeForms = false,
            listening = false,
            regularExpressions;
        
        regularExpressions = {
            extractHash: /^[^#]*(#.*)$/,
            trimHash: /^#*(.*?)\/*$/
        };
        
        this.get = function (route, callback) {
        
        };
        
        this.post = function (route, callback) {
        
        };
        
        this.put = function (route, callback) {
        
        };
        
        this.del = function (route, callback) {
        
        };
        
        this.any = function (route, callback) {
        
        };
        
        this.listen = function (route, callback) {
        
        };
        
        this.navigate = function (hash) {
            var previousHash = getHash();
            location.hash = hash;
            
            if (!observeHash || location.hash === previousHash) {
                return resolve(hash, 'get');
            }        
        };
        
        addRoute = function(pattern) {
            var route;

            route = pattern instanceof Route ? pattern : new Route(pattern);
            return routes[route.toString()] = route;
        }; 
        
        removeRoute = function(route) {
            var name;
            
            if (!(route instanceof Route)) {
                route = new Route(route);
            }
            
            name = route.toString();
            
            if (name in this.routes) {
                return delete this.routes[name];
            }
        };
        
        resolve = function(hash, method) {
            var $route, args, cleanHash, name, params, route;
            
            cleanHash = String(hash).replace(regularExpressions.trimHash, '$1');
      
            if (cleanHash === '') {
                if (String(hash).indexOf('/') === -1) {
                    return false;
                } else {
                    cleanHash = '/';
                }
            }
            
            for (name in routes) {
                if (!__hasProp.call(routes, name)) {
                    continue;
                }
                
                route = routes[name];
            
                if (!(route instanceof Route)) {
                    continue;
                }
                
                params = route.match(cleanHash);
        
                if (!params) {
                    continue;
                }
        
                args = [params, method];
                $route = jQuery(route);
                $route.trigger('gidget::any', args);
        
                if ((method != null) && method !== 'any') {
                    $route.trigger('gidget::' + method.toLowerCase(), args);
                }
        
                return true;
            }
      
            return false;
        };        
    };




/*jslint nomen: true, plusplus: true*/
/*globals exports, Gidget, hilary*/

(function (exports, Gidget, hilary) {
    "use strict";
    
    var gidget = new Gidget(),
        hilaryResolver;
    
    hilaryResolver = new gidget.DependencyResolver({
        resolveOne: function (name) {
            return hilary.resolve(name);
        },
        resolveMany: function (nameArray) {
            var i, result = [];

            for (i = 0; i < nameArray.length; i++) {
                result.push(hilary.resolve(nameArray[i]));
            }

            return result;
        },
        register: function (name, modul) {
            return hilary.register(name, modul);
        }
    });
    
    exports.gidgetHilaryResolver = hilaryResolver;
    
}(typeof exports === 'object' ? exports : window, Gidget, hilary));