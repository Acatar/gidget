/*globals define*/
define('sammy_require_controllers/home', { init: function (GidgetModule, $) {
    "use strict";
    
    var $this = new GidgetModule();
    
    $this.get['/require_sammy'] = function (params) {
        var html = '<h1>Gidget with the Sammy Bootstrapper and require.js</h1>'
                + '<p>This example uses the Gidget DSL with Sammy.js for routing and require.js for AMD</p>';
        
        $('#main').html(html);
    };
    
    $this.get['/require_sammy/#/example1'] = function (params) {
        $('#main').html('<h1>/sammy/#/example1</h1>');
    };
    
    $this.get['/require_sammy/#/example2'] = function (params) {
        $('#main').html('<h1>/sammy/#/example2</h1>');
    };
    
    return $this;
}});