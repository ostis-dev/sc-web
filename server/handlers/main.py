import tornado.web
import base
__sc_web_version__ = '1.0'
__sc_web_core_version__ = '1.0'

class MainHandler(base.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        first_time = self.get_cookie("first_time", "1")
        self.set_cookie("first_time", "0")
        self.render("base.html", has_entered = False, user = { "loggedin": False, "first_time": first_time == "1"},
                    version={'sc_web': __sc_web_version__, 'sc_web_core': __sc_web_core_version__})
