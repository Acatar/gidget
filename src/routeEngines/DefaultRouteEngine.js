(function (Hilary, history) {
    'use strict';

    Hilary.scope('gidget').register({
        name: 'DefaultRouteEngine',
        dependencies: ['BaseRouteEngine', 'is', 'uriHelper'],
        factory: function (RouteEngine, is, uriHelper) {

            var start,
                onLoad,
                addEventListeners,
                clickHandler,
                popstateHandler,
                routeEngine,
                originalTitle;

            // PRIVATE members
            (function () {
                start = function () {
                    addEventListeners();
                    onLoad();
                };

                onLoad = function () {
                    routeEngine.navigate(location.href);
                };

                clickHandler = function (event) {
                    var isValidHref;

                    /*jshint ignore:start*/
                    isValidHref =
                        is.string(event.target.localName) &&    // make sure we have a tag to reference
                        event.target.localName === 'a' &&       // and that the tag is an anchor
                                                                // and that the anchor target is self or default
                        (event.target.target.length === 0 || event.target.target === '_self') &&
                        event.target.href.length > 0 &&         // and that the href is not omitted (for firefox)
                                                                // and that the href is not a javascript void
                        !(event.target.href.indexOf('javascript:') > -1 && event.target.href.indexOf('void(') > -1)
                    ;
                    /*jshint ignore:end*/

                    if (isValidHref) {
                        event.preventDefault();
                        routeEngine.navigate(event.target.href);
                    }
                };

                popstateHandler = function (event) {
                    if (is.string(event.state)) {
                        event.preventDefault();
                        routeEngine.navigate(event.state, null, false);
                    } else if (is.object(event.state) && is.object(event.state.uri) && is.defined(event.state.uri.path)) {
                        event.preventDefault();
                        routeEngine.navigate(null, event.state, false);
                    }
                };

                addEventListeners = function () {
                    document.addEventListener('click', clickHandler, false);
                    window.addEventListener('popstate', popstateHandler, false);
                };
            }());

            // PUBLIC members
            (function () {
                var makeOptions,
                    makeState;

                makeOptions = function (pathOrOptions, data, pushStateToHistory) {
                    var options = {};

                    if (is.string(pathOrOptions)) {
                        options.path = pathOrOptions;
                        options.data = data;
                        options.pushStateToHistory = pushStateToHistory;
                    } else {
                        options = pathOrOptions;
                        options.data = options.data || data;
                        options.pushStateToHistory = is.defined(options.pushStateToHistory) ? options.pushStateToHistory : pushStateToHistory;
                    }

                    // default behavior for history is true
                    options.pushStateToHistory = options.pushStateToHistory || is.not.defined(options.pushStateToHistory);

                    return options;
                };

                makeState = function (path, data) {
                    var state = data || {},
                        pathIsLocal;

                    state.uri = state.uri || uriHelper.parseUri(path);
                    originalTitle = originalTitle || document.title;
                    state.title = state.title || originalTitle;

                    // if the uri is relative, or if the host matches the current host
                    // then we are navigating within the SPA
                    pathIsLocal = !state.uri.host || (state.uri.host === document.location.host);

                    if (!pathIsLocal) {
                        // we must be leaving the SPA
                        state.redirect = true;
                    }

                    return state;
                };

                // create an instance of BaseRouteEngine and set the
                // start, navigate and dispose behaviors
                routeEngine = new RouteEngine({
                    start: start
                });

                /*
                // navigate [GET] to an endpoint
                // @param pathOrOptions (string or Object): The path to navigate to, or
                //          an options object that accepts the following properties:
                //          * path (string) the path to navigate to
                //          * data (object) data to put in history, and an optional page title
                //          * pushStateToHistory (bool): whether or not to add this page to browser history
                //          * callback (function): a callback function to execute after navigation
                // @param data (object) data to put in history, and an optional page title
                // @param pushStateToHistory (bool): whether or not to add this page to browser history
                */
                routeEngine.navigate = function (pathOrOptions, data, pushStateToHistory) {
                    var options = makeOptions(pathOrOptions, data, pushStateToHistory),
                        state = makeState(options.path, options.data);

                    if (state.redirect) {
                        window.location = options.path;
                        return;
                    }

                    // execute the route
                    routeEngine.get(state.uri, function (err, req) {
                        var title = req.title || state.title || 'home';
                        state.title = title;

                        if (options.pushStateToHistory) {
                            // add the state to the browser history (i.e. to support back and forward)
                            history.pushState(state, title, state.uri.relativePath);
                            document.title = title;
                        } else {
                            document.title = title;
                        }

                        if (is.function(options.callback)) {
                            options.callback(req);
                        }
                    });
                };

                routeEngine.redirect = routeEngine.navigate;

                // routeEngine.redirect = function (path, data, pushStateToHistory) {
                //     setTimeout(function () {
                //         routeEngine.navigate(path, data, pushStateToHistory);
                //     }, 0);
                // };

                routeEngine.updateHistory = function (path, data) {
                    var state = makeState(path, data),
                        title = state.title || 'home';
                    state.title = title;
                    history.replaceState(state, title, state.uri.relativePath);
                    document.title = title;
                };

                routeEngine.dispose = function () {
                    document.removeEventListener('click', clickHandler, false);
                    window.removeEventListener('popstate', popstateHandler, false);
                };
            }());

            return routeEngine;
        }
    });

}(Hilary, window.history));
