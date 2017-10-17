AudioComponent = {
    formats: ['format_ogg'],
    factory: function(sandbox) {
        return new AudioPlayer(sandbox);
    }
};

var AudioPlayer = function(sandbox){
    this.container = '#' + sandbox.container;
    this.sandbox = sandbox;

    // ---- window interface -----
    this.receiveData = function(data) {
        var dfd = new jQuery.Deferred();

        $(this.container).empty();
        var bytes = new Uint8Array(data);

        $(this.container).append('<audio controls><source src="data:audio/ogg;base64,' + Base64Encode(bytes) + '" type="audio/ogg"></audio>');

        dfd.resolve();
        return dfd.promise();
    };
    
    this.sandbox.eventDataAppend = $.proxy(this.receiveData, this);
    this.sandbox.updateContent('binary');
};


SCWeb.core.ComponentManager.appendComponentInitialize(AudioComponent);
