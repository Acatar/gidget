Hilary.scope('gidget').register({
    name: 'locale',
    factory: {
        errors: {
            requiresArguments: 'The {func} function requires arguments {args}',
            pipelineRequiresCallback: 'A callback function is required to register a pipeline event',
            parseUriRequiresUriString: 'A uriString is required to parse a URI',
            status404: 'Not Found!',
            interfaces: {
                requiresImplementation: 'A valid implementation is required to create a new instance of an interface',
                requiresProperty: 'The implementation is missing a required property: ',
                requiresArguments: 'The implementation of this function requires the arguments: ',
                notAnIRouteEngine: 'The router instance that was passed into the RouteEngine constructor does not implement IRouteEngine',
                notAnIGidgetApp: 'The gidgetApp instance that were passed into the GidgetApp constructor does not implement IGidgetApp',
                notAnIGidgetModule: 'The module that you are trying to register does not implement IGidgetModule',
                missingOptions: 'To create a Gidget instance, you must provide the minimum required options'
            }
        }
    }
});
