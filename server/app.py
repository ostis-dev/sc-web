import tornado.ioloop
import tornado.web
import tornado.options
import secret

from handlers.main import MainHandler
import handlers.api as api
import ws

is_closing = False

def signal_handler(signum, frame):
    global is_closing
    is_closing = True

def try_exit():
    global is_closing
    if is_closing:
        # clean up here
        tornado.ioloop.IOLoop.instance().stop()

class NoCacheStaticHandler(tornado.web.StaticFileHandler):
    """ Request static file handlers for development and debug only.
        It disables any caching for static file.
    """
    def set_extra_headers(self, path):
        self.set_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')

def main():
    
    tornado.options.define("static_path", default = "../static", help = "path to static files directory", type = str)
    tornado.options.define("templates_path", default = "../templates", help = "path to template files directory", type = str)
    tornado.options.define("sctp_port", default = 55770, help = "port of sctp server", type = int)
    tornado.options.define("sctp_host", default = "localhost", help = "host of sctp server", type = str)
    tornado.options.define("event_wait_timeout", default = 10, help = "time to wait commands processing", type = int)
    tornado.options.define("idtf_serach_limit", default = 30, help = "number of maximum results for searching by identifier", type = str)
    tornado.options.define("redis_host", default = "localhost", help = "host of redis server", type = str)
    tornado.options.define("redis_port", default = 6379, help = "port of redis server", type = int)
    tornado.options.define("redis_db_idtf", default = 0, help = "number of redis database to store identifiers", type = int)
    tornado.options.define("redis_db_user", default = 1, help = "number of redis database to store user info", type = int)
    
    tornado.options.parse_command_line()
    tornado.options.parse_config_file("server.conf")

    rules = [
            (r"/", MainHandler),

            (r"/static/(.*)", NoCacheStaticHandler, {"path": tornado.options.options.static_path}),

            # api
            (r"/api/init/", api.Init),
            (r"/api/cmd/do/", api.CmdDo),
            
            (r"/api/question/answer/translate/", api.QuestionAnswerTranslate),
            
            (r"/api/link/content/", api.LinkContent),
            (r"/api/link/format/", api.LinkFormat),
            
            (r"/api/languages/", api.Languages),
            (r"/api/languages/set/", api.LanguageSet),
            
            (r"/api/idtf/find/", api.IdtfFind),
            (r"/api/idtf/resolve/", api.IdtfResolve),
            
            (r"/api/addr/resolve/", api.AddrResolve),
            
            (r"/api/info/tooltip/", api.InfoTooltip),
            
            (r"/api/user/", api.User),

            (r"/sctp", ws.SocketHandler),
            ]

    application = tornado.web.Application(
        rules,                                          
        cookie_secret = secret.get_secret(),
        login_url = "/auth/login",
        template_path = tornado.options.options.templates_path,
        xsrf_cookies = True,
        gzip = True
    )

    application.listen(8000)
    tornado.ioloop.PeriodicCallback(try_exit, 1000).start()
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
