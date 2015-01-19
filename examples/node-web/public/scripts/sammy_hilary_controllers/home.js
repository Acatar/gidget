/*globals hilary*/
hilary.register('home_controller', { init: function (GidgetModule, $) {
    "use strict";
    
    var $this = new GidgetModule();
    
    $this.get['/sammy_hilary'] = function (params) {
        var html = '<h1>Gidget with the Sammy Bootstrapper and hilary</h1>'
                + '<p>This example uses the Gidget DSL with Sammy.js for routing and hilary as the IoC Container</p>';
        
        $('#main').html(html);
    };
    
    $this.get['/sammy_hilary/#/example1'] = function (params) {
        $('#main').html('<h1>/sammy_hilary/#/example1</h1>');
    };
    
    $this.get['/sammy_hilary/#/example2'] = function (params) {
        $('#main').html('<h1>/sammy_hilary/#/example2</h1>');
    };
    
    return $this;
}});