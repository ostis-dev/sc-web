function Preloader() {
    this.locker = $("#sc-ui-preloader");
};

Preloader.prototype.init = function() {
    
};

Preloader.prototype.show = function() {
    this.locker.removeClass("hidden");
};

Preloader.prototype.hide = function() {
    this.locker.addClass("hidden");
};