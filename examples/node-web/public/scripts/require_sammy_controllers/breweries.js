/*jslint plusplus: true*/
/*globals define, console*/
define('require_sammy_controllers/breweries', { init: function (GidgetModule, $) {
    "use strict";
    
    var $this = new GidgetModule(),
        paramsToHtml;
    
    paramsToHtml = function (params) {
        var html = '',
            i,
            prop;
        
        if (params.splat) {
            for (i = 0; i < params.splat.length; i++) {
                html += '<p>param[' + i.toString() + ']: ' + params.splat[i] + '</p>';
            }
        } else {
            for (prop in params) {
                if (params.hasOwnProperty(prop)) {
                    html += '<p>' + prop + ': ' + params[prop] + '</p>';
                }
            }
        }
        
        return html;
    };
    
    $this.get['/require_sammy/#/breweries/:id'] = function (params) {
        $('#main').html('<h1>/sammy/#/breweries/:id</h1>' + paramsToHtml(params));
    };
    
    $this.get['/require_sammy/#/breweries/:id/beers/:beerId'] = function (params) {
        $('#main').html('<h1>/sammy/#/breweries/:id/beers/:beerId</h1>' + paramsToHtml(params));
    };
    
    return $this;
}});
