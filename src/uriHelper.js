// Thanks Steven Levithan <stevenlevithan.com> https://github.com/get/parseuri
Hilary.scope('gidget').register({
    name: 'uriHelper',
    singleton: true,
    dependencies: ['is', 'locale', 'exceptions'],
    factory: function (is, locale, exceptions) {
        'use strict';

        var self = {
                parseUri: undefined
            },
            expressions = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
            parts = ['source', 'protocol', 'authority', 'userAndPassword', 'user', 'password', 'hostName', 'port', 'relativePath', 'path', 'directory', 'file', 'queryString', 'hash'],
            queryPart = {
                name:   'query',
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            },
            makeHost,
            makeOrigin;

        makeHost = function (hostName, port) {
            if (!port) {
                return hostName;
            }

            return '{{host}}:{{port}}'
                .replace(/{{host}}/, hostName)
                .replace(/{{port}}/, port);
        };

        makeOrigin = function (protocol, authority, userAndPassword) {
            return'{{protocol}}://{{host}}'
                    .replace(/{{protocol}}/, protocol)
                    .replace(/{{host}}/, authority
                                            .replace(userAndPassword, '')
                                            .replace('@', '')
                    );
        };

        self.parseUri = function (uriString) {
            if (is.not.defined(uriString)) {
                exceptions.throwArgumentException(locale.errors.parseUriRequiresUriString, 'uriString');
            } else if (is.not.string(uriString) && uriString.path) {
                return uriString;
            } else if (is.not.string(uriString)) {
                exceptions.throwArgumentException(locale.errors.parseUriRequiresUriString, 'uriString');
            }

            var src = uriString,
                bracketStartIdx = uriString.indexOf('['),
                bracketEndIdx = uriString.indexOf(']'),
                matches,
                uri = {},
                i = 14;

            if (bracketStartIdx !== -1 && bracketEndIdx !== -1) {
                uriString = uriString.substring(0, bracketStartIdx) + uriString.substring(bracketStartIdx, bracketEndIdx).replace(/:/g, ';') + uriString.substring(bracketEndIdx, uriString.length);
            }

            matches = expressions.exec(uriString || '');

            while (i--) {
                uri[parts[i]] = matches[i] || undefined;
            }

            if (bracketStartIdx !== -1 && bracketEndIdx !== -1) {
                uri.source = src;
                uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
                uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
                uri.ipv6uri = true;
            }

            uri.port = uri.port && parseInt(uri.port);

            if (is.string(uri.queryString)) {
                uri[queryPart.name] = {};
                uri.queryString.replace(queryPart.parser, function ($0, $1, $2) {
                    if ($1) {
                        uri[queryPart.name][$1] = $2;
                    }
                });
            }

            uri.host = makeHost(uri.hostName, uri.port);

            if (uri.authority) {
                uri.origin = makeOrigin(uri.protocol || 'https', uri.authority, uri.userAndPassword);
            }

            return uri;
        };

        return self;
    }
});
