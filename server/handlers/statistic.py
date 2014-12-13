import tornado.web
import base

class StatisticHandler(base.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        first_time = self.get_cookie("first_time", "1")
        self.set_cookie("first_time", "0")
        self.render("statistic.html", has_entered = False, user = { "loggedin": False, "first_time": first_time == "1"})

