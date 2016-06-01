MuzVideoComponent = {
    formats: ['format_muzvideo'],
    factory: function (sandbox) {
        return new MuzVideoViewer(sandbox);
    }
};

var MuzVideoViewer = function(sandbox){
    this._initWindow(sandbox);
    return this;
};

MuzVideoViewer.prototype  = {

    _container: null,

    _initWindow: function(sandbox) {
        this._container = '#' + sandbox.container;
        this.sandbox = sandbox;

        if (this.sandbox.addr) {
            SCWeb.core.Server.getLinkContent(this.sandbox.addr,
                                            $.proxy(this.receiveData, this),
                                            function () {});
        }
    },

    receiveData: function(data) {
        console.log(data);
        $(this._container).empty();
        $(this._container).append('<video width="800" height="400" src="'+data+'"controls>This is fallback content to display if the browser does not support the video element.</video>');
    },

};

SCWeb.core.ComponentManager.appendComponentInitialize(MuzVideoComponent);
