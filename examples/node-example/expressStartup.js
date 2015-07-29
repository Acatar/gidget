module.exports.name = 'expressStartup';
module.exports.dependencies = [
    'expressSingleton',
    'path',
    'cookieParser',
    'bodyParser',
    'serve-static',
    'less',
    'hbs',
    'favicon',
    'exceptions'
];
module.exports.factory = function (app, path, cookieParser, bodyParser, serveStatic, less, hbs, favicon, exceptions) {
    'use strict';

    var before,
        after;

    before = function () {
        // view engine setup
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'hbs');

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(less(path.join(__dirname, 'public')));
        app.use(serveStatic(path.join(__dirname, 'public')));
        // uncomment this when you add a facicon
        //app.use(favicon(__dirname + '/public/favicon.ico'));

        hbs.registerPartials(__dirname + '/views/templates');
    };

    after = function () {
        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            var err = exceptions.makeException('404', 'Not Found');
            err.status = 404;
            next(err);
        });

        // error handlers

        // development error handler
        // will print stacktrace
        if (app.get('env') === 'development') {
            app.use(function (err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        } else {
            // production error handler
            // no stacktraces leaked to user

            app.use(function (err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: {}
                });
            });
        }
    };

    return {
        init: function (applicationLifecycle, next) {
            before();

            if (typeof applicationLifecycle === 'function') {
                applicationLifecycle(app);
            }

            after();

            if (typeof next === 'function') {
                next(app);
            }

            return app;
        }
    };
};
