Hilary.scope('node-example').register({
    name: 'locale::en_US',
    factory: {
        "pages": {
            "home": {
                "empty": {
                    "heading": "Welcome!",
                    "body": "You yo'd up an express app that uses hilary and gidget."
                }
            },
            "errors": {
                "e403": {
                    "heading": "403",
                    "body": "Access denied"
                },
                "e404": {
                    "heading": "404",
                    "body": "{{path}} was not found"
                },
                "e500": {
                    "heading": "Whoops!",
                    "body": "Something went terribly wrong."
                }
            }
        },
        "js": {
            "ViewEngine": {
                "setVM.viewModelRequired": "When setting the mainVM, the viewModel argument must be an object."
            }
        },
        "server": {

        }
    }
});
