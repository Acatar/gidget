Hilary.scope('gidget').register({
    name: 'GidgetPipeline',
    dependencies: ['is', 'locale'],
    factory: function (is, locale) {
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
                    error: undefined
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
                error: []
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
                    makeTask = function (i) {
                        return  function (err, response) {
                            if (pipeline.length === i) {
                                if (is.function(last)) {
                                    last(err, response);
                                }
                            } else {
                                pipeline[i](err, response, makeTask((i + 1)));
                            }
                        };
                    };

                for (i = 0; i < pipeline.length; i += 1) {
                    tasks.push(makeTask(i));
                }

                return tasks;
            };

            self.trigger.before.routeExecution = function (err, response, next) {
                var tasks = makePipelineTasks(pipelineEvents.before, next);

                if (tasks.length) {
                    tasks[0](err, response);
                } else {
                    next(err, response);
                }
            };

            self.trigger.after.routeExecution = function (err, response) {
                var tasks = makePipelineTasks(pipelineEvents.after);

                if (tasks.length) {
                    tasks[0](err, response);
                }
            };

            self.trigger.on.error = function (errorObject) {
                var i;
                for (i = 0; i < pipelineEvents.error.length; i += 1) {
                    pipelineEvents.error[i](errorObject);
                }
            };

            self.trigger.before.routeResolution = function (uri, next) {
                var tasks = makePipelineTasks(pipelineEvents.beforeRouteResolution, next);
                if (tasks.length) {
                    tasks[0](null, uri);
                } else {
                    next(null, uri);
                }
            };

            self.trigger.after.routeResolution = function (response, next) {
                var tasks = makePipelineTasks(pipelineEvents.afterRouteResolution, next);

                if (tasks.length) {
                    tasks[0](null, response);
                } else {
                    next(null, response);
                }
            };

            self.before.routeResolution = function (callback) {
                if (!validatePipelineEventCallback(callback)) {
                    return;
                }

                if (callback.length < 2) {
                    pipelineEvents.beforeRouteResolution.push(function (path, next) {
                        callback(path);
                        next(null, path);
                    });
                } else {
                    pipelineEvents.beforeRouteResolution.push(callback);
                }
            };

            self.after.routeResolution = function (callback) {
                if (!validatePipelineEventCallback(callback)) {
                    return;
                }

                if (callback.length < 3) {
                    pipelineEvents.afterRouteResolution.push(function (err, route, next) {
                        callback(err, route);
                        next(null, route);
                    });
                } else {
                    pipelineEvents.afterRouteResolution.push(callback);
                }
            };

            self.before.routeExecution = function (callback) {
                if (!validatePipelineEventCallback(callback)) {
                    return;
                }

                if (callback.length < 3) {
                    pipelineEvents.before.push(function (err, response, next) {
                        callback(err, response);
                        next(null, response);
                    });
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

            return self;
        };

        return Pipeline;
    }
});