/*globals jQuery*/
(function ($) {
    "use strict";
    
    var template,
        require_sammy,
        sammy_hilary;
    
    template = $('#menu-items').html();
    require_sammy = template.replace(/\{0\}/g, 'require_sammy');
    sammy_hilary = template.replace(/\{0\}/g, 'sammy_hilary');
    
    $('.dropdown-menu.require-sammy').append(require_sammy);
    $('.dropdown-menu.hilary-sammy').append(sammy_hilary);
    
}(jQuery));