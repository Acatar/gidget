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

            routeEngine = new RouteEngine({
                start: start
            });
            routeEngine.navigate = function (path, data, pushStateToHistory) {
                var state = data || {},
                    uri = uriHelper.parseUri(path);

                if (is.not.defined(pushStateToHistory)) {
                    pushStateToHistory = true;
                }

                if (!uri.host || (uri.host === document.location.host)) {
                    state.uri = uri;
                    state.title = window.title;
                } else {
                    window.location = path;
                    return;
                }

                if (pushStateToHistory) {
                    history.pushState(state.uri, state.title, state.uri.relativePath);
                }

                routeEngine.resolveAndExecuteRoute(state.uri, 'get');
            };

            routeEngine.dispose = function () {
                document.removeEventListener('click', clickHandler, false);
                window.removeEventListener('popstate', popstateHandler, false);
            };

            return routeEngine;
        }
    });

}(Hilary, window.history));
