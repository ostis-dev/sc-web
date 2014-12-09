(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-57454857-1', {
    'cookieDomain': 'none'
});
ga('send', 'pageview');


var GoogleAnalytics = GoogleAnalytics || {


    /**
     *
     *  Send track event request to Google Analytics
     *
     * @param category  REQUIRED    GoogleAnalytics.EVENT_CATEGORY
     * @param action    REQUIRED    GoogleAnalytics.EVENT_ACTION
     * @param value                 String
     */
    trackEvent: function (category, action, value) {
        ga('send', 'event', category, action, value);
    },

    /**
     *  Send track timing request to Google Analytics
     *
     * @param period    REQUIRED    int
     * @param category  REQUIRED    GoogleAnalytics.TIME_CATEGORY
     * @param action    REQUIRED    GoogleAnalytics.TIME_ACTION
     */
    trackTiming: function (period, category, action) {
        ga('send', 'timing', category, action, period, 'Google CDN');
    },

    EVENT_CATEGORY: {
        DEFAULT: "Default Category"
    },

    EVENT_ACTION: {
        DEFAULT: "Default Action"
    },


    TIME_CATEGORY: {
        DEFAULT: "Default Category",
        CLICK: "Click",
        SHOW_LOCKER: "Show Locker"
    },

    TIME_ACTION: {
        DEFAULT: "Default Variable",
        CHANGE_EDIT_MODE: "Change Edit Mode",
        CHANGE_MODAL_MODE: "Change Modal Mode",
        TIME_BETWEEN_LOCKER_STARTS_AND_ENDS: "Time between locker starts and ends"
    }


};