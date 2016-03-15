(function (Hilary, history) {
    'use strict';

    Hilary.scope('gidget').register({
        name: 'DefaultRouteEngine',
        dependencies: ['BaseRouteEngine', 'is', 'uriHelper', 'storage', 'exceptions', 'locale'],
        factory: function (RouteEngine, is, uriHelper, storage, exceptions, locale) {

            var start,
                onLoad,
                addEventListeners,
                clickHandler,
                popstateHandler,
                routeEngine,
                originalTitle,
                sessionHistory,
                maxHistorySize = 20,
                capHistory,
                updateHistory,
                replaceHistory,
                findHistoryIndex,
                enumerateHistoryIndex,
                migrateHistory,
                updateHistoryByIndex,
                go,
                navigate,
                makeNonce;

            // Session History
            (function () {
                var makeHistory;
                sessionHistory = {
                    back: {},
                    forward: {}
                };

                makeHistory = function (name, historyType) {
                    historyType.getHistory = function () {
                        var item = storage.getItem(name);

                        if (item) {
                            return JSON.parse(item);
                        }

                        return [];
                    };

                    historyType.setHistory = function (value) {
                        storage.setItem(name, JSON.stringify(value));
                    };

                    historyType.getLength = function () {
                        return historyType.getHistory().length;
                    };

                    historyType.removeLastElement = function () {
                        var history = historyType.getHistory(),
                            popped = history.pop();
                        historyType.setHistory(history);
                        return popped;
                    };

                    historyType.removeFirstElement = function () {
                        var history = historyType.getHistory(),
                            shifted = history.shift();
                        historyType.setHistory(history);
                        return shifted;
                    };

                    historyType.addAtBeginning = function (value) {
                        var history = historyType.getHistory();
                        history.unshift(value);
                        historyType.setHistory(history);
                        return history.length;
                    };
                };

                makeHistory('gidget::history::back', sessionHistory.back);
                makeHistory('gidget::history::forward', sessionHistory.forward);

            }());

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
                    var anchor;

                    if (event.target.localName === 'a') {
                        // make sure we have an anchor tag to reference
                        anchor = event.target;
                    } else if (event.currentTarget.activeElement.localName === 'a') {
                        // the event came from an element that is not an anchor (maybe an image)
                        // make sure we have an anchor tag to reference
                        anchor = event.currentTarget.activeElement;
                    } else {
                        // not sure we should bind to this event
                        // get out of here
                        return;
                    }

                    if (anchor.target.length !== 0 && anchor.target !== '_self') {
                        // If the anchor is targeting something other than self,
                        // gidget should not handle the route
                        return;
                    }

                    if (anchor.href.length < 1) {
                        // The href is omitted (for firefox)
                        return;
                    }

                    if (anchor.href.indexOf('javascript:') > -1 && anchor.href.indexOf('void(') > -1) { //jshint ignore:line
                        // the href appears to be a javascript void - it probably has a click handler
                        return;
                    }

                    // if we got this far, the event should be handled
                    // by gidget. Take over.
                    event.preventDefault();
                    routeEngine.navigate(anchor.href);
                };

                popstateHandler = function (event) {
                    var index;

                    if (is.string(event.state)) {
                        event.preventDefault();
                        routeEngine.navigate(event.state, null, false);
                    } else if (is.object(event.state) && is.object(event.state.uri) && is.defined(event.state.uri.path)) {
                        event.preventDefault();
                        routeEngine.navigate(null, event.state, false);
                        index = findHistoryIndex(event.state);

                        if (index) {
                            updateHistoryByIndex(index, false);
                        }
                    }
                };

                addEventListeners = function () {
                    document.addEventListener('click', clickHandler, false);
                    window.addEventListener('popstate', popstateHandler, false);
                };

                makeNonce = function (templateString) {
                    templateString = templateString || 'xxxxxxxx';

                    return templateString.replace(/[xy]/g, function (c) {
                        var r = Math.random() * 16 | 0, v = c === 'x' ? r : r & 3 | 8;
                        return v.toString(16);
                    });
                };

                capHistory = function () {
                    // cap the internal history at 20 items
                    if (sessionHistory.back.getLength() > maxHistorySize) {
                        sessionHistory.back.removeLastElement();
                    }

                    // cap the internal history at 20 items
                    if (sessionHistory.forward.getLength() > maxHistorySize) {
                        sessionHistory.forward.removeLastElement();
                    }
                };

                updateHistory = function (state, title, relativePath) {
                    // push the history to the browser
                    history.pushState(state, title, relativePath);

                    // push the history to the top of the internal history
                    sessionHistory.back.addAtBeginning(state);
                    capHistory();
                };

                replaceHistory = function (state, title, relativePath) {
                    history.replaceState(state, title, relativePath);

                    // remove the most recent item from internal history
                    sessionHistory.back.removeFirstElement();

                    // push the history to the top of the internal history
                    sessionHistory.back.addAtBeginning(state);
                };

                findHistoryIndex = function (state) {
                    var index;

                    if (!state.nonce) {
                        return;
                    }

                    // check the backward history
                    index = enumerateHistoryIndex(sessionHistory.back.getHistory(), state.nonce);

                    if (index >= 0) {
                        // make sure it's negative
                        return -(index);
                    }

                    // check the forward history
                    index = enumerateHistoryIndex(sessionHistory.forward.getHistory(), state.nonce);

                    if (index >= 0) {
                        return index;
                    }
                };

                enumerateHistoryIndex = function (history, nonce) {
                    var i;

                    for (i = 0; i < history.length; i += 1) {
                        if (history[i].nonce === nonce) {
                            return i;
                        }
                    }
                };

                migrateHistory = function (from, to, count) {
                    var i;

                    for (i = 0; i < count; i += 1) {
                        to.addAtBeginning(from.removeFirstElement());
                    }
                };

                updateHistoryByIndex = function (index, removeFirstBackItem) {
                    var state;

                    if (is.not.number(index)) {
                        exceptions.throwArgumentException(new Error(locale.errors.requiresArguments.replace('{func}', 'go').replace('{args}', '(index)')));
                        return;
                    } else if (index > maxHistorySize || index < -(maxHistorySize)) {
                        exceptions.throwArgumentException(new Error(locale.errors.maxHistorySizeExceededOnGoRequest));
                    }

                    if (index > 0 && sessionHistory.forward.getLength() >= index) {
                        // going forward
                        state = sessionHistory.forward.getHistory()[index - 1];
                        migrateHistory(sessionHistory.forward, sessionHistory.back, index);
                    } else if (index < 0 && sessionHistory.back.getLength() >= -(index)) {
                        // going backward
                        state = sessionHistory.back.getHistory()[-(index)];
                        migrateHistory(sessionHistory.back, sessionHistory.forward, -(index));
                    } else {
                        exceptions.throwArgumentException(new Error(locale.errors.insufficientHistoryOnGoRequest));
                        return;
                    }

                    // remove an additional element from the "from" Array
                    // because new history will be created
                    if (removeFirstBackItem !== false) {
                        sessionHistory.back.removeFirstElement();
                    }

                    return state;
                };

                go = function (index) {
                    var state = updateHistoryByIndex(index);

                    if (state) {
                        //history.go(index);
                        navigate(state, {
                            pushStateToHistory: true,
                            callback: function () {
                                capHistory();
                            }
                        });
                    }
                };

                navigate = function (state, options) {
                    options = options || {};

                    // execute the route
                    routeEngine.get(state.uri, function (err, req) {
                        var title = req.title || state.title || 'home';
                        state.title = title;

                        if (options.pushStateToHistory) {
                            // add the state to the browser history (i.e. to support back and forward)
                            updateHistory(state, title, state.uri.relativePath);
                            document.title = title;
                        } else if (options.replaceHistory) {
                            replaceHistory(state, title, state.uri.relativePath);
                            document.title = title;
                        } else {
                            document.title = title;
                        }

                        if (is.function(options.callback)) {
                            options.callback(req);
                        }
                    });
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
                        options = pathOrOptions || options;
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
                    state.nonce = state.nonce || makeNonce();

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
                    navigate(state, options);
                };

                routeEngine.redirect = function (pathOrOptions, data) {
                    var options = makeOptions(pathOrOptions, data, false /*pushStateToHistory*/),
                        state = makeState(options.path, options.data);

                    if (state.redirect) {
                        window.location = options.path;
                        return;
                    }

                    // force the history to be rewritten
                    options.replaceHistory = true;

                    // execute the route
                    navigate(state, options);
                };

                routeEngine.updateHistory = function (path, data) {
                    var state = makeState(path, data),
                        title = state.title || 'home';
                    state.title = title;
                    replaceHistory(state, title, state.uri.relativePath);
                    document.title = title;
                };

                /*
                // Get the last route in the app history
                */
                routeEngine.getLastRoute = function () {
                    return sessionHistory.back.getHistory()[0];
                };

                /*
                // Get all of the app history
                */
                routeEngine.getHistory = function () {
                    return sessionHistory.back.getHistory();
                };

                /*
                // Get all of the app forward history
                */
                routeEngine.getFuture = function () {
                    return sessionHistory.forward.getHistory();
                };

                /*
                // Go back 1 item in the app history
                */
                routeEngine.back = function (index) {
                    if (is.number(index)) {
                        go(-(index));
                    } else {
                        go(-1);
                    }
                };

                /*
                // Forwards the user to the last, different route, so that history is
                // not destroyed if you want to take the user back to where
                // they came from. For instance, when a user closes a card-view
                // you could use backToTheFuture to take them back to an index of
                // cards, without needing to know what that index is
                //
                // @param options.pushStateToHistory (bool): whether or not to add this page to browser history
                // @param options.callback (function): a callback function to be executed after the route is executed
                //
                // @returns true, if the history is present to support this operation, otherwise false.
                */
                routeEngine.backToTheFuture = function (options) {
                    var state,
                        currentUri = uriHelper.parseUri(window.location.href),
                        hist,
                        i;

                    if (sessionHistory.back.getLength() < 2) {
                        return false;
                    }

                    state = sessionHistory.back.getHistory()[1];

                    if (state.uri.path !== currentUri.path) {
                        // execute the route
                        navigate(state, makeOptions(options));
                        return true;
                    }

                    hist = routeEngine.getHistory();

                    for (i = 0; i < hist.length; i += 1) {
                        if (hist[i].uri.path !== currentUri.path) {
                            // execute the route
                            navigate(hist[i], makeOptions(options));
                            return true;
                        }
                    }
                };

                /*
                // Go forward 1 item in the app history
                */
                routeEngine.forward = function (index) {
                    go(index || 1);
                };

                /*
                // Go to the given index in the app history
                */
                routeEngine.go = function (index) {
                    go(index);
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
