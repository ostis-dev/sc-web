# -*- coding: utf-8 -*-

import os
import httplib2
from urllib import quote
from random import randint
import logging
import time

UTM_GIF_LOCATION = "http://www.google-analytics.com/__utm.gif"

GA_VERSION = "5.6.1"

def get_random_number():
    return str(randint(0, 0x7fffffff))

## Отправка данных на google analytics
# @param utm_url url-адрес с информацией
def send_request_to_google_analytics(utm_url):
    log = logging.getLogger("send_request_to_google_analytics")
    http = httplib2.Http()
    try:
        resp, content = http.request(utm_url,
                                     "GET",
                                     headers={'User-Agent': 'python/httplib2',
                                              'Accepts-Language:': os.environ.get("HTTP_ACCEPT_LANGUAGE",'')}
                                     )
        return resp
    except (httplib2.HttpLib2Error) as err:
        log.error("Error when send request to google analytics: {}".format(err))
        return None

## Функция отправки данных о просмотре страницы в google analytics event
# @param domain домен google analytics
# @param account аккаунт в google analytics (UA-XXXXXXXX-X)
# @param path uri запрошенной страницы
# @param category категория google analytics
# @param action действие google analytics
# @param value значение
def track_event(domain, account, path, category='', action='', value=''):
    utm_url = UTM_GIF_LOCATION + '?utmwv=' + GA_VERSION + \
                                 '&utms=4' \
                                 '&utmn=2026077072' \
                                 '&utmhn=' + str(quote(domain)) + \
                                 '&utmcs=UTF-8' \
                                 '&utmsr=1920x1080' \
                                 '&utmvp=1073x922' \
                                 '&utmsc=24-bit' \
                                 '&utmul=en-us' \
                                 '&utmje=1' \
                                 '&utmfl=-' \
                                 '&utmdt=Tornado' \
                                 '&utmhid=1' \
                                 '&utmr=-' \
                                 '&utmp=' + quote(str(path)) + \
                                 '&utmht=' + str(time.time()) + \
                                 '&utmac=' + str(account) + \
                                 '&utmcc=__utma%3D1.975727192.1418076751.1418079453.1418086983.2%3B%2B__utmz%3D1.1418079453.1.1.utmcsr%3D(direct)%7Cutmccn%3D(direct)%7Cutmcmd%3D(none)%3B' \
                                 '&utmjid=' \
                                 '&utmu=6BAAAAAAAAAAAAAAAAAAQAAE~'

    utm_url += '&utmt=event&utme=5({}*{}*{})'.format(quote(str(category)), quote(str(action)), quote(str(value)))
    return send_request_to_google_analytics(utm_url)

if __name__ == '__main__':
    log = logging.getLogger('__main__')
    logging.basicConfig(format=u'%(filename)s[LINE:%(lineno)d]# %(levelname)-8s [%(asctime)s] %(name)s > %(message)s',
                        level=logging.INFO)
    import time
    try:
        i = 0
        while True:
            i += 1
            res = track_event(domain='none', account='UA-57454857-1', path='path', category=quote('Tornado Server'), action='GET',
                   )
            log.info(res)
            time.sleep(10)
    except:
        log.warning("Google Analitics Sender closed")
