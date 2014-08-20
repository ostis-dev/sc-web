function UiMain() {
};

UiMain.prototype.init = function() {
    this.preloader = new Preloader();
    this.preloader.init();
    this.preloader.show();
};