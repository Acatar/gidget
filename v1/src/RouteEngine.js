Hilary.scope('GidgetContainer').register({
    name: 'RouteEngine',
    dependencies: ['IRouteEngine', 'locale', 'exceptions'],
    factory: function (IRouteEngine, locale, exceptions) {
        'use strict';

        return function (router) {
            var self = {},
                pipelineRegistries,
                regularExpressions;

            if (!IRouteEngine.syncSignatureMatches(router).result) {
                exceptions.throwNotImplementedException(locale.errors.interfaces.notAnIRouteEngine, IRouteEngine.syncSignatureMatches(router).errors);
                return;
            }

            pipelineRegistries = {
                before: [],
                after: []
            };

            regularExpressions = {
                escapeRegExp: /[-[\]{}()+?.,\\^$|#\s]/g,
                namedParam: /:(\w+)/g,
                splatParam: /\*(\w+)/g,
                firstParam: /(:\w+)|(\*\w+)/,
                allParams: /(:|\*)\w+/g,
                extractHash: /^[^#]*(#.*)$/
            };

            self.get = router.get;
            self.post = router.post;
            self.put = router.put;
            self.del = router.del;
            self.any = router.any;
            self.start = router.start;
            self.navigate = router.navigate;
            self.pipelineRegistries = pipelineRegistries;

            self.before = router.before || function (callback) {
                if (typeof callback === 'function') {
                    pipelineRegistries.before.push(callback);
                }
            };

            self.after = router.after || function (callback) {
                if (typeof callback === 'function') {
                    pipelineRegistries.after.push(callback);
                }
            };

            // thanks Simrou!
            self.parseRoute = function (pattern, caseSensitive) {
                var flags,
                    name,
                    names,
                    params;

                pattern = String(pattern);
                names = pattern.match(regularExpressions.allParams);
                
                if (names !== null) {
                    params = (function () {
                        var i,
                            len,
                            results;

                        results = [];

                        for (i = 0, len = names.length; i < len; i += 1) {
                            name = names[i];
                            results.push(name.substr(1));
                        }

                        return results;
                    }());
                } else {
                    params = [];
                }

                pattern = pattern.replace(regularExpressions.escapeRegExp, '\\$&');
                pattern = pattern.replace(regularExpressions.namedParam, '([^\/]+)');
                pattern = pattern.replace(regularExpressions.splatParam, '(.+?)');
                flags = caseSensitive ? '' : 'i';
                // /account\/register\/?$/i
                // /^/\#/bar$/i
                return {
                    expression: new RegExp('^' + pattern + '\/?$', flags),
                    params: params,
                    pattern: pattern
                };
            };

            self.getHash = function () {
                return String(location.hash).replace(regularExpressions.extractHash, '$1');
            };

            self.executePipeline = function (pipelineToExecute, verb, path, params, event) {
                var i;
                for (i = 0; i < pipelineToExecute.length; i += 1) {
                    pipelineToExecute[i](verb, path, params, event);
                }
            };

            return self;
        };
    }
});
