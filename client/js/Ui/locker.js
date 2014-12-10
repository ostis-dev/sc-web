SCWeb.ui.Locker = {
    counter: 0,

    // for Google Analytics
    startLockTime: null,
    endLockTime: null,


    update: function () {
        if (this.counter < 0) throw "Counter of ui locker less than 0";

        if (this.counter > 0) {
            if (this.counter == 1) {
                this.startLockTime = new Date().getTime();
            }
            $('#sc-ui-locker').addClass('shown');
        } else {
            if (this.startLockTime) {
                this.timingToGoogle();
            }
            $('#sc-ui-locker').removeClass('shown');
        }
    },

    show: function () {
        this.counter++;
        this.update();
    },

    hide: function () {
        this.counter--;
        this.update();
    },

    /**
     *  Send request to Google Analytics with panel locking period
     */
    timingToGoogle: function () {
        this.endLockTime = new Date().getTime();

        GoogleAnalytics.trackTiming(
                this.endLockTime - this.startLockTime,
            GoogleAnalytics.TIME_CATEGORY.SHOW_LOCKER,
            GoogleAnalytics.TIME_ACTION.TIME_BETWEEN_LOCKER_STARTS_AND_ENDS
        );
        this.startLockTime = null;
        this.endLockTime = null;
    }

};