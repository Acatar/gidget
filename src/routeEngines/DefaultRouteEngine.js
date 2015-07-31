(function (Hilary, history) {
    'use strict';

    Hilary.scope('gidget').register({
        name: 'DefaultRouteEngine',
        dependencies: ['BaseRouteEngine', 'is'],
        factory: function (RouteEngine, is) {

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
                var state = data || {};

                if (is.not.defined(pushStateToHistory)) {
                    pushStateToHistory = true;
                }

                if (is.string(path.host) && path.host === document.location.host) {
                    // the path is an href => get the relative path and set the state object
                    state.path = path;
                    state.relativePath = path.pathname + path.search + path.hash;
                    state.title = window.title;
                } else if (is.string(path) && path.replace(window.location.origin, '').indexOf('http') === -1) {
                    state.path = path;
                    state.relativePath = path.replace(window.location.origin, '');
                    state.title = window.title;
                } else {
                    window.location = path;
                    return;
                }

                if (pushStateToHistory) {
                    history.pushState(state.path, state.title, state.relativePath);
                }

                routeEngine.resolveAndExecuteRoute(state.relativePath);
            };

            routeEngine.dispose = function () {
                document.removeEventListener('click', clickHandler, false);
                window.removeEventListener('popstate', popstateHandler, false);                
            };

            return routeEngine;
        }
    });

}(Hilary, window.history));
