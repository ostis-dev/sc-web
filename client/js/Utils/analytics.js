var GoogleAnalytics = {

    requestCounter: 0,
    requestNumberForSendingToServer: 5,

    hasAnalytics: false,

    ua: null,

    cookieDomain: 'none',


    init: function () {
        (function (i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = new Date();
            a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
        ga(GoogleAnalytics.sometimesToServer);
    },


    checkAnalyticsIsTurnedOn: function (success, failure) {

        SCWeb.core.Server.getAnalytics(
            function (response) {
                if (response && response.has_analytics && response.ua) {
                    if (success) {
                        success(response);
                    }
                    return;
                }
                if (failure) {
                    failure();
                }
            },
            function () {
                if (failure) {
                    failure();
                }
            }
        );

    },

    /**
     *  One time from requestNumberForSendingToServer check Google Analytics on turning on (in  sc-web server)
     *  Another times it sends information to Google Analytics (if Google Analytics is turned on)
     *  Depends on previous checking
     *
     * @param success   Will call if Google
     * @param failure
     */
    sometimesToServer: function (success, failure) {

        if (GoogleAnalytics.requestCounter == GoogleAnalytics.requestNumberForSendingToServer) {
            GoogleAnalytics.requestCounter = 0;
        }

        if (GoogleAnalytics.requestCounter == 0) {

            // to server
            GoogleAnalytics.checkAnalyticsIsTurnedOn(function (result) {

                if (GoogleAnalytics.isTurnedOff()) {
                    GoogleAnalytics.turnOn(result.ua, success);
                }

            }, function () {
                if (GoogleAnalytics.isTurnedOn()) {
                    GoogleAnalytics.turnOff(failure);
                }
            })
        }

        ++GoogleAnalytics.requestCounter;

    },


    toGoogleIfIsTurnedOn: function (success, failure) {

        GoogleAnalytics.sometimesToServer(success, failure);

        if (GoogleAnalytics.isTurnedOn()) {
            if (success) {
                success();
            }
        } else {
            if (failure) {
                failure();
            }
        }

    },


    turnOn: function (ua, callback) {
        if (!ua) {
            GoogleAnalytics.turnOff();
            return;
        }
        GoogleAnalytics.hasAnalytics = true;
        GoogleAnalytics.ua = ua;
        if (window[('ga-disable-' + GoogleAnalytics.ua)]) {
            window[('ga-disable-' + GoogleAnalytics.ua)] = false;
        } else {
            try {
                ga('create', GoogleAnalytics.ua, {
                    'cookieDomain': GoogleAnalytics.cookieDomain
                });
                ga('send', 'pageview');

            } catch (err) {
                GoogleAnalytics.turnOff();
                return;
            }
        }
        if (callback) {
            callback();
        }
    },


    turnOff: function (callback) {
        if (GoogleAnalytics.hasAnalytics && GoogleAnalytics.ua) {
            window[('ga-disable-' + GoogleAnalytics.ua)] = true;
        }
        GoogleAnalytics.hasAnalytics = false;
        GoogleAnalytics.ua = null;
        if (callback) {
            callback();
        }
    },


    isTurnedOn: function () {
        return GoogleAnalytics.hasAnalytics && GoogleAnalytics.ua;
    },

    isTurnedOff: function () {
        return !GoogleAnalytics.isTurnedOn();
    },

    /**
     *
     *  Send track event request to Google Analytics
     *
     * @param category  REQUIRED    GoogleAnalytics.EVENT_CATEGORY
     * @param action    REQUIRED    GoogleAnalytics.EVENT_ACTION
     * @param value                 String
     */
    trackEvent: function (category, action, value) {
        GoogleAnalytics.toGoogleIfIsTurnedOn(
            function () {
                value
                    ? ga('send', 'event', category, action, value)
                    : ga('send', 'event', category, action);
            }
        );
    },

    /**
     *  Send track timing request to Google Analytics
     *
     * @param period    REQUIRED    int
     * @param category  REQUIRED    GoogleAnalytics.TIME_CATEGORY
     * @param action    REQUIRED    GoogleAnalytics.TIME_ACTION
     */
    trackTiming: function (period, category, action) {
        GoogleAnalytics.toGoogleIfIsTurnedOn(
            function () {
                ga('send', 'timing', category, action, period, 'Google CDN');
            }
        );
    },

    EVENT_CATEGORY: {
        DEFAULT: "Default Category",
        SEARCH: "Search",
        PRINT_WINDOW: "Print window",
        MENU: "Menu",
        SC_LANGUAGE: "SC Language"
    },

    EVENT_ACTION: {
        DEFAULT: "Default Action",
        SEARCH_CLICK: "Search click",
        PRINT_WINDOW_CLICK: "Print Window Button Click",
        MENU_ITEM_CLICK: "Menu Item Click",
        SC_LANGUAGE_CLICK: "History Item Language Click"
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