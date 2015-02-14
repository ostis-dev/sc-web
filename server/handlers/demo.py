import tornado.web
import base

class MainHandler(base.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.set_cookie("first_time", "0")
        self.render("demo.html")
