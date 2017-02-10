
; (function (factory) {

    window.smart = {} || window.smart;
    window.smart.app = {} || window.smart.app;
    factory(window.smart.app);

}(function (container) {

    container.contents = {};

    container.run = function () {

        //use jquery ready to initialize all content
        $(document).ready(
            function () {

                //call every content init
                for (var key in container.contents) {
                    var content = container.contents[key];
                    if (content.init) {
                        content.init.apply(content, []);
                    }
                }

                if (ko) {
                    //use knockout.js to apply the binding
                    ko.applyBindings(container.contents);
                }

            });
    };


    container.register = function (content) {

        var name = content.viewId;


        //store the webcontent in the root
        container.contents[name] = content;

        if (ko) {
            //apply with binding on the tag for vm
            content.elements.attr("data-bind", "with:$root." + name);
        }

    };


    container.viewModel = function (viewId, inputs, init, refresh, event) {

        var self = this;

        //need many check for strong program

        self.viewId = viewId;
        self.elements = $("div[placeholder|='"+viewId+"']");
        self.inputs = inputs;

        self.init = init;
        self.refresh = refresh;
        self.event = event;

        container.register(self);

    };

    /*

    //standard way to create a viewModel

    var content = new smart.app.viewModel( "viewId",
                  {}, 
                  function(){
                    //init
                  },
                  function(){
                    //refresh
                  },
                  function(){
                    //event
                  }
                  );


    */




}));

