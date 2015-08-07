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
                routeEngine;

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
                    if (is.string(event.target.localName) && event.target.localName === 'a') {
                        event.preventDefault();
                        routeEngine.navigate(event.target.href);
                    }
                };

                popstateHandler = function (event) {
                    if (is.string(event.state)) {
                        event.preventDefault();
                        routeEngine.navigate(event.state, null, false);
                    } else if (is.object(event.state) && is.defined(event.state.path)) {
                        event.preventDefault();
                        routeEngine.navigate(event.state.path);
                    }
                };

                addEventListeners = function () {
                    document.addEventListener('click', clickHandler, false);
                    window.addEventListener('popstate', popstateHandler, false);
                };
            }());

            // PUBLIC members
            (function () {
                // create an instance of BaseRouteEngine and set the
                // start, navigate and dispose behaviors
                routeEngine = new RouteEngine({
                    start: start
                });

                routeEngine.navigate = function (path, data, pushStateToHistory) {
                    var state = data || {},
                        uri = uriHelper.parseUri(path);

                    if (!uri.host || (uri.host === document.location.host)) {
                        // if the uri is relative, or if the host matches the current host
                        // then we are navigating within the SPA
                        state.uri = state.uri || uri;
                        state.title = state.title || window.title;
                    } else {
                        // otherwise, we must be leaving the SPA
                        window.location = path;
                        return;
                    }

                    if (is.not.defined(pushStateToHistory)) {
                        // default behavior for history is true
                        pushStateToHistory = true;
                    }

                    if (pushStateToHistory) {
                        // add the state to the browser history (i.e. to support back and forward)
                        history.pushState(state.uri, state.title, state.uri.relativePath);
                    }

                    // execute the route
                    routeEngine.resolveAndExecuteRoute(state.uri, 'get');
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
