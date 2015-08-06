Hilary.scope('gidget').register({
    name: 'GidgetPipelineEvent',
    dependencies: ['is', 'locale'],
    factory: function (is, locale) {
        'use strict';
        var GidgetPipelineEvent,
            pipeline;

        GidgetPipelineEvent = function (event) {
            var self;
            event = event || {};

            if (is.not.function(event.eventHandler)) {
                self = function () {
                    pipeline.trigger.on.error({ status: 500, message: locale.errors.pipelineEventRequiresHandler });
                };
            } else {
                self = event.eventHandler;
            }

            if (is.boolean(event.once)) {
                self.once = event.once;
            }

            if (is.function(event.remove)) {
                self.remove = event.remove;
            }

            return self;
        };

        return function (routeEnginePipeline) {
            pipeline = routeEnginePipeline;
            return GidgetPipelineEvent;
        };
    }
});
