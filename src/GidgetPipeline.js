Hilary.scope('gidget').register({
    name: 'GidgetPipeline',
    dependencies: ['is', 'locale', 'exceptions'],
    factory: function (is, locale, exceptions) {
        'use strict';

        var Pipeline = function () {
            var self,
                pipelineEvents,
                makePipelineTasks,
                validatePipelineEventCallback;

            self = {
                before: {
                    routeResolution: undefined,
                    routeExecution: undefined
                },
                after: {
                    routeResolution: undefined,
                    routeExecution: undefined
                },
                on: {
                    error: undefined,
                    scrollToHash: undefined
                },
                trigger: {
                    before: {
                        routeResolution: undefined,
                        routeExecution: undefined
                    },
                    after: {
                        routeResolution: undefined,
                        routeExecution: undefined
                    },
                    on: {
                        error: undefined
                    }
                }
            };

            pipelineEvents = {
                beforeRouteResolution: [],
                afterRouteResolution: [],
                before: [],
                after: [],
                error: [],
                scrollToHash: undefined
            };

            pipelineEvents.scrollToHash = function (err, req) {
                var el;

                if (req.uri.hash) {
                    el = document.getElementById(req.uri.hash);

                    if (el && el.scrollIntoView) {
                        el.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            };

            validatePipelineEventCallback = function (callback) {
                if (is.not.function(callback)) {
                    self.trigger.on.error({ status: 500, message: locale.errors.pipelineRequiresCallback });
                    return false;
                }

                return true;
            };

            makePipelineTasks = function (pipeline, last) {
                var i,
                    tasks = [],
                    executeEvent,
                    makeTask;

                executeEvent = function(i, err, request) {
                    var event = pipeline[i];

                    if (is.function(event) && event.length === 3) {
                        event(err, request, makeTask(i + 1));
                    } else if (is.function(event)) {
                        event(err, request);
                        makeTask(i + 1)(err, request);
                    }

                    if (event.once) {
                        pipeline.splice(i, 1);
                    } else if (is.function(event.remove) && event.remove(err, request)) {
                        pipeline.splice(i, 1);
                    }
                };

                makeTask = function (i) {
                    return  function (err, request) {
                        if (pipeline.length === i) {
                            if (is.function(last)) {
                                last(err, request);
                            }
                        } else if (is.function(pipeline[i])) {
                            executeEvent(i, err, request);
                        } else {
                            makeTask(i + 1);
                        }
                    };
                };

                for (i = 0; i < pipeline.length; i += 1) {
                    tasks.push(makeTask(i));
                }

                return tasks;
            };

            self.trigger.before.routeExecution = function (err, request, next) {
                var tasks = makePipelineTasks(pipelineEvents.before, next);

                if (tasks.length) {
                    tasks[0](err, request, next);
                } else {
                    next(err, request);
                }
            };

            self.trigger.after.routeExecution = function (err, request) {
                var tasks;

                pipelineEvents.scrollToHash(err, request);
                tasks = makePipelineTasks(pipelineEvents.after);

                if (tasks.length) {
                    tasks[0](err, request);
                }
            };

            self.trigger.on.error = function (errorObject) {
                var err, i;

                if (is.object(errorObject) && errorObject.stack) {
                    err = errorObject;
                } else if (is.object(errorObject)) {
                    err = exceptions.makeException(errorObject.name, errorObject.message || locale.errors.defaultMessage, errorObject);
                } else if (is.string(errorObject)) {
                    err = exceptions.makeException(errorObject);
                } else {
                    err = errorObject;
                }

                for (i = 0; i < pipelineEvents.error.length; i += 1) {
                    pipelineEvents.error[i](err);
                }
            };

            self.trigger.before.routeResolution = function (request, next) {
                var tasks = makePipelineTasks(pipelineEvents.beforeRouteResolution, next);
                if (tasks.length) {
                    tasks[0](null, request, next);
                } else {
                    next(null, request);
                }
            };

            self.trigger.after.routeResolution = function (err, request, next) {
                var tasks = makePipelineTasks(pipelineEvents.afterRouteResolution, next);

                if (tasks.length) {
                    tasks[0](err, request, next);
                } else {
                    next(err, request);
                }
            };

            self.before.routeResolution = function (callback) {
                var cb;

                if (!validatePipelineEventCallback(callback)) {
                    return;
                }

                if (callback.length < 3) {
                    cb = function (err, req, next) {
                        callback(null, req);
                        next(null, req);
                    };
                    cb.once = callback.once;
                    cb.remove = callback.remove;
                    pipelineEvents.beforeRouteResolution.push(cb);
                } else {
                    pipelineEvents.beforeRouteResolution.push(callback);
                }
            };

            self.after.routeResolution = function (callback) {
                var cb;

                if (!validatePipelineEventCallback(callback)) {
                    return;
                }

                if (callback.length < 3) {
                    cb = function (err, route, next) {
                        callback(err, route);
                        next(null, route);
                    };
                    cb.once = callback.once;
                    cb.remove = callback.remove;

                    pipelineEvents.afterRouteResolution.push(cb);
                } else {
                    pipelineEvents.afterRouteResolution.push(callback);
                }
            };

            self.before.routeExecution = function (callback) {
                var cb;

                if (!validatePipelineEventCallback(callback)) {
                    return;
                }

                if (callback.length < 3) {
                    cb = function (err, request, next) {
                        callback(err, request);
                        next(null, request);
                    };
                    cb.once = callback.once;
                    cb.remove = callback.remove;

                    pipelineEvents.before.push(cb);
                } else {
                    pipelineEvents.before.push(callback);
                }
            };

            self.after.routeExecution = function (callback) {
                if (validatePipelineEventCallback(callback)) {
                    pipelineEvents.after.push(callback);
                }
            };

            self.on.error = function (callback) {
                if (validatePipelineEventCallback(callback)) {
                    pipelineEvents.error.push(callback);
                }
            };

            self.on.scrollToHash = function (callback) {
                if (validatePipelineEventCallback(callback)) {
                    pipelineEvents.scrollToHash = callback;
                }
            };

            return self;
        };

        return Pipeline;
    }
});
