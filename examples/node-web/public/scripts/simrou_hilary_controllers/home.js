/*globals hilary*/
hilary.register('controllers::home', { init: function (GidgetModule, $) {
    "use strict";
    
    var $this = new GidgetModule();
    
    $this.get['/simrou_hilary'] = function (params) {
        var html = '<h1>Gidget with the Simrau Bootstrapper and hilary</h1>'
                + '<p>This example uses the Gidget DSL with Simrau for routing and hilary as the IoC Container</p>';
        
        $('#main').html(html);
    };
    
    $this.get['/simrou_hilary/#/example1'] = function (params) {
        $('#main').html('<h1>/simrau_hilary/#/example1</h1>');
    };
    
    $this.get['/simrou_hilary/#/example2'] = function (params) {
        $('#main').html('<h1>/simrau_hilary/#/example2</h1>');
    };
    
    return $this;
}});