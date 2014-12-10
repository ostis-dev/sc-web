# -*- coding: utf-8 -*-
import tornado.web
import json
import redis

from keynodes import KeynodeSysIdentifiers, Keynodes
from sctp.logic import new_sctp_client
from sctp.types import ScAddr, SctpIteratorType, ScElementType

import api_logic as logic
import time
import base

## Стандартный класс обработки REST-запросов.
class DefaultHandler(base.BaseHandler):

    ## Метод создания sctp клиента
    def start_sctp_client(self):
        self.sctpClient = new_sctp_client()

    ## Метод закрытия sctp клиента
    def stop_sctp_client(self):
        self.sctpClient.shutdown()

    ## Функция возвращающая ответ сессии
    # @note после отправки ответа сессии закрывает sctp клиент
    # @param content_type тип ответа
    # @pararm result ответ
    # @param *args дополнительные аргументы
    # @parama **kwargs дополнительные именованные аргументы
    def serialize(self, content_type, result=None, *args, **kwargs):
        self.set_header("Content-Type", content_type)
        self.finish(result)
        self.stop_sctp_client()

    ## Функция возвращающая ошибку сессии
    # @note после отправки ошибки сессии закрывает sctp клиент
    # @param code код ошибки
    # @pararm message сообщение об ошибке
    # @param *args дополнительные аргументы
    # @parama **kwargs дополнительные именованные аргументы
    def serialize_error(self, code, message, *args, **kwargs):
        self.clear()
        self.set_status(code)
        self.finish(message)
        self.stop_sctp_client()

class Init(DefaultHandler):
    @tornado.web.asynchronous
    def get(self):
        self.start_sctp_client()
        result = '{}'
        keys = Keynodes(self.sctpClient)
        keynode_ui_main_menu = keys[KeynodeSysIdentifiers.ui_main_menu]
        keynode_ui_external_languages = keys[KeynodeSysIdentifiers.ui_external_languages]
        keynode_languages = keys[KeynodeSysIdentifiers.languages]

        # try to find main menu node
        cmds = logic.parse_menu_command(keynode_ui_main_menu, self.sctpClient, keys)
        if cmds is None:
            cmds = {}

        # try to find available output languages
        res_out_langs = self.sctpClient.iterate_elements(
            SctpIteratorType.SCTP_ITERATOR_3F_A_A,
            keynode_ui_external_languages,
            ScElementType.sc_type_arc_pos_const_perm,
            ScElementType.sc_type_node | ScElementType.sc_type_const
        )

        out_langs = []
        if (res_out_langs is not None):
            for items in res_out_langs:
                out_langs.append(items[2].to_id())

        # try to find available output natural languages
        langs = logic.get_languages_list(keynode_languages, self.sctpClient)
        langs_str = []
        for l in langs:
            langs_str.append(l.to_id())
        
        # get user sc-addr
        sc_session = logic.ScSession(self, self.sctpClient, keys)
        user_addr = sc_session.get_sc_addr()
        result = {'menu_commands': cmds,
                  'languages': langs_str,
                  'external_languages': out_langs,
                  'user': {
                            'sc_addr': user_addr.to_id(),
                            'is_authenticated': False,
                            'current_lang': sc_session.get_used_language().to_id(),
                            'default_ext_lang': sc_session.get_default_ext_lang().to_id()
                           }
        }
        self.serialize("application/json", json.dumps(result))
        
class CmdDo(DefaultHandler):
    
    @tornado.web.asynchronous
    def post(self):
        self.start_sctp_client()
        result = '[]'

        cmd_addr = ScAddr.parse_from_string(self.get_argument(u'cmd', None))
        # parse arguments
        first = True
        arg = None
        arguments = []
        idx = 0
        while first or (arg is not None):
            arg = ScAddr.parse_from_string(self.get_argument(u'%d_' % idx, None))
            if arg is not None:
                if self.sctpClient.check_element(arg):
                    arguments.append(arg)
                else:
                    return self.serialize_error(404, "Invalid argument: %s" % arg)

            first = False
            idx += 1

        if (len(arguments) > 0) and (cmd_addr is not None):

            keys = Keynodes(self.sctpClient)

            keynode_ui_rrel_commnad = keys[KeynodeSysIdentifiers.ui_rrel_commnad]
            keynode_ui_rrel_command_arguments = keys[KeynodeSysIdentifiers.ui_rrel_command_arguments]
            keynode_ui_nrel_command_result = keys[KeynodeSysIdentifiers.ui_nrel_command_result]
            keynode_ui_command_generate_instance = keys[KeynodeSysIdentifiers.ui_command_generate_instance]
            keynode_ui_command_initiated = keys[KeynodeSysIdentifiers.ui_command_initiated]
            keynode_ui_command_finished = keys[KeynodeSysIdentifiers.ui_command_finished]
            keynode_ui_nrel_command_result = keys[KeynodeSysIdentifiers.ui_nrel_command_result]
            keynode_ui_user = keys[KeynodeSysIdentifiers.ui_user]
            keynode_nrel_authors = keys[KeynodeSysIdentifiers.nrel_authors]
            keynode_question_initiated = keys[KeynodeSysIdentifiers.question_initiated]
            keynode_question = keys[KeynodeSysIdentifiers.question]
            keynode_system_element = keys[KeynodeSysIdentifiers.system_element]
            keynode_nrel_ui_nrel_command_lang_template = keys[KeynodeSysIdentifiers.nrel_ui_nrel_command_lang_template]
            keynode_languages = keys[KeynodeSysIdentifiers.languages]
            keynode_nrel_main_idtf = keys[KeynodeSysIdentifiers.nrel_main_idtf]

            # create command in sc-memory
            inst_cmd_addr = self.sctpClient.create_node(ScElementType.sc_type_node | ScElementType.sc_type_const)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, inst_cmd_addr)
            arc = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, keynode_ui_command_generate_instance, inst_cmd_addr)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, arc)

            inst_cmd_arc = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, inst_cmd_addr, cmd_addr)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, inst_cmd_arc)
            arc = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, keynode_ui_rrel_commnad, inst_cmd_arc)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, arc)

            # create arguments
            args_addr = self.sctpClient.create_node(ScElementType.sc_type_node | ScElementType.sc_type_const)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, args_addr)
            args_arc = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, inst_cmd_addr, args_addr)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, args_arc)
            arc = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, keynode_ui_rrel_command_arguments, args_arc)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, arc)

            idx = 1
            for arg in arguments:
                arg_arc = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, args_addr, arg)
                logic.append_to_system_elements(self.sctpClient, keynode_system_element, arg_arc)
                if arg_arc is None:
                    self.sctpClient.shutdown()
                    return self.serialize_error(self, 404, 'Error while create "create_instance" command')

                idx_addr = self.sctpClient.find_element_by_system_identifier(str(u'rrel_%d' % idx))
                if idx_addr is None:
                    self.sctpClient.shutdown()
                    return self.serialize_error(self, 404, 'Error while create "create_instance" command')
                idx += 1
                arc = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, idx_addr, arg_arc)
                logic.append_to_system_elements(self.sctpClient, keynode_system_element, arc)

            wait_time = 0
            wait_dt = 0.1
            
            # initialize command
            arc = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, keynode_ui_command_initiated, inst_cmd_addr)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, arc)

            cmd_finished = logic.check_command_finished(inst_cmd_addr, keynode_ui_command_finished, self.sctpClient)
            while cmd_finished is None:
                time.sleep(wait_dt)
                wait_time += wait_dt
                if wait_time > tornado.options.options.event_wait_timeout:
                    self.sctpClient.shutdown()
                    return self.serialize_error(self, 404, 'Timeout waiting for "create_instance" command finished')
                cmd_finished = logic.check_command_finished(inst_cmd_addr, keynode_ui_command_finished, self.sctpClient)


            # get command result
            cmd_result = self.sctpClient.iterate_elements(
                SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F,
                inst_cmd_addr,
                ScElementType.sc_type_arc_common | ScElementType.sc_type_const,
                ScElementType.sc_type_node | ScElementType.sc_type_const,
                ScElementType.sc_type_arc_pos_const_perm,
                keynode_ui_nrel_command_result
            )
            if cmd_result is None:
                return self.serialize_error(self, 404, 'Can\'t find "create_instance" command result')

            cmd_result = cmd_result[0][2]

            # @todo support all possible commands
            # try to find question node
            question = self.sctpClient.iterate_elements(
                SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F,
                keynode_question,
                ScElementType.sc_type_arc_pos_const_perm,
                ScElementType.sc_type_node | ScElementType.sc_type_const,
                ScElementType.sc_type_arc_pos_const_perm,
                cmd_result
            )
            if question is None:
                return self.serialize_error(self, 404, "Can't find question node")

            question = question[0][2]

            logic.append_to_system_elements(self.sctpClient, keynode_system_element, question)
            
            # generate main identifiers
            langs = logic.get_languages_list(keynode_languages, self.sctpClient)
            if langs:
                templates = self.sctpClient.iterate_elements(
                    SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F,
                    cmd_addr,
                    ScElementType.sc_type_arc_common | ScElementType.sc_type_const,
                    ScElementType.sc_type_link,
                    ScElementType.sc_type_arc_pos_const_perm,
                    keynode_nrel_ui_nrel_command_lang_template
                )
                if templates:
                    generated = {}
                    identifiers = {}
                    
                    # get identifiers
                    for l in langs:
                        identifiers[str(l)] = {}
                        for a in arguments:
                            idtf_value = logic.get_identifier_translated(a, l, keys, self.sctpClient)
                            if idtf_value:
                                identifiers[str(l)][str(a)] = idtf_value
                                
                    
                    for t in templates:
                        input_arcs = self.sctpClient.iterate_elements(
                                            SctpIteratorType.SCTP_ITERATOR_3A_A_F,
                                            ScElementType.sc_type_node | ScElementType.sc_type_const | ScElementType.sc_type_node_class,
                                            ScElementType.sc_type_arc_pos_const_perm,
                                            t[2])
                        if input_arcs:
                            for arc in input_arcs:
                                for l in langs:
                                    if not generated.has_key(str(l)) and arc[0] == l:
                                        lang_idtfs = identifiers[str(l)]
                                        # get content of link
                                        data = self.sctpClient.get_link_content(t[2]).decode('utf-8')
                                        if data:
                                            for idx in xrange(len(arguments)):
                                                value = arguments[idx].to_id()
                                                if lang_idtfs.has_key(str(arguments[idx])):
                                                    value = lang_idtfs[str(arguments[idx])]
                                                data = data.replace(u'$ui_arg_%d' % (idx + 1), value)
                                                
                                            
                                            # generate identifier
                                            idtf_link = self.sctpClient.create_link()
                                            self.sctpClient.set_link_content(idtf_link, str(data.encode('utf-8')))
                                            self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, l, idtf_link)
                                            
                                            bin_arc = self.sctpClient.create_arc(ScElementType.sc_type_arc_common | ScElementType.sc_type_const,
                                                                             question, idtf_link)
                                            self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm,
                                                                   keynode_nrel_main_idtf, bin_arc)
                                            
                                            generated[str(l)] = True

            # create author
            sc_session = logic.ScSession(self, self.sctpClient, keys)
            user_node = sc_session.get_sc_addr()
            if not user_node:
                return self.serialize_error(self, 404, "Can't resolve user node")
            
            arc = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, keynode_ui_user, user_node)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, arc)

            author_arc = self.sctpClient.create_arc(ScElementType.sc_type_arc_common | ScElementType.sc_type_const, question, user_node)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, author_arc)
            arc = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, keynode_nrel_authors, author_arc)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, arc)


            # initiate question
            arc = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, keynode_question_initiated, question)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, arc)

            # first of all we need to wait answer to this question
            #print self.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_A, keynode_question_initiated, 0, 0)
            
            result = { 'question': question.to_id() }
            
        self.serialize("application/json", json.dumps(result))

        
class QuestionAnswerTranslate(DefaultHandler):
    
    @tornado.web.asynchronous
    def post(self):
        self.start_sctp_client()
        question_addr = ScAddr.parse_from_string(self.get_argument(u'question', None))
        format_addr = ScAddr.parse_from_string(self.get_argument(u'format', None))
        
        keys = Keynodes(self.sctpClient)
        keynode_nrel_answer = keys[KeynodeSysIdentifiers.question_nrel_answer]
        keynode_nrel_translation = keys[KeynodeSysIdentifiers.nrel_translation]
        keynode_nrel_format = keys[KeynodeSysIdentifiers.nrel_format]
        keynode_system_element = keys[KeynodeSysIdentifiers.system_element]
        
        # try to find answer for the question
        wait_time = 0
        wait_dt = 0.1
        
        answer = logic.find_answer(question_addr, keynode_nrel_answer, self.sctpClient)
        while answer is None:
            time.sleep(wait_dt)
            wait_time += wait_dt
            if wait_time > tornado.options.options.event_wait_timeout:
                return self.serialize_error(self, 404, 'Timeout waiting for answer')
            
            answer = logic.find_answer(question_addr, keynode_nrel_answer, self.sctpClient)
        
        if answer is None:
            return self.serialize_error(self, 404, 'Answer not found')
        
        answer_addr = answer[0][2]
        
        # try to find translation to specified format
        result_link_addr = logic.find_translation_with_format(answer_addr, format_addr, keynode_nrel_format, keynode_nrel_translation, self.sctpClient)
        
        # if link addr not found, then run translation of answer to specified format
        if result_link_addr is None:
            trans_cmd_addr = self.sctpClient.create_node(ScElementType.sc_type_node | ScElementType.sc_type_const)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, trans_cmd_addr)
            
            arc_addr = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, trans_cmd_addr, answer_addr)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, arc_addr)
            
            arc_addr = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, keys[KeynodeSysIdentifiers.ui_rrel_source_sc_construction], arc_addr)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, arc_addr)
            
            arc_addr = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, trans_cmd_addr, format_addr)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, arc_addr)
            
            arc_addr = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, keys[KeynodeSysIdentifiers.ui_rrel_output_format], arc_addr)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, arc_addr)
            
            # add into translation command set
            arc_addr = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, keys[KeynodeSysIdentifiers.ui_command_translate_from_sc], trans_cmd_addr)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, arc_addr)
            
            # initialize command
            arc_addr = self.sctpClient.create_arc(ScElementType.sc_type_arc_pos_const_perm, keys[KeynodeSysIdentifiers.ui_command_initiated], trans_cmd_addr)
            logic.append_to_system_elements(self.sctpClient, keynode_system_element, arc_addr)
            
            # now we need to wait translation result
            wait_time = 0
            translation = logic.find_translation_with_format(answer_addr, format_addr, keynode_nrel_format, keynode_nrel_translation, self.sctpClient)
            while translation is None:
                time.sleep(wait_dt)
                wait_time += wait_dt
                if wait_time > tornado.options.options.event_wait_timeout:
                    return self.serialize_error(self, 404, 'Timeout waiting for answer translation')
 
                translation = logic.find_translation_with_format(answer_addr, format_addr, keynode_nrel_format, keynode_nrel_translation, self.sctpClient)
                
            if translation is not None:
                result_link_addr = translation
    
        # if result exists, then we need to return it content
        if result_link_addr is not None:
            result = json.dumps({"link": result_link_addr.to_id()})
    
        self.serialize("application/json", result)
        
class LinkContent(DefaultHandler):
    
    @tornado.web.asynchronous
    def get(self):
        self.start_sctp_client()
        keys = Keynodes(self.sctpClient)
        keynode_nrel_format = keys[KeynodeSysIdentifiers.nrel_format]
        keynode_nrel_mimetype = keys[KeynodeSysIdentifiers.nrel_mimetype]
    
        # parse arguments
        addr = ScAddr.parse_from_string(self.get_argument('addr', None))
        if addr is None:
            return self.serialize_error(self, 404, 'Invalid arguments')
    
        result = self.sctpClient.get_link_content(addr)
        if result is None:
            return self.serialize_error(self, 404, 'Content not found')
    
        self.serialize(logic.get_link_mime(addr, keynode_nrel_format, keynode_nrel_mimetype, self.sctpClient), result)

        
class LinkFormat(DefaultHandler):
    
    @tornado.web.asynchronous
    def post(self):
        self.start_sctp_client()
        # parse arguments
        first = True
        arg = None
        arguments = []
        idx = 0
        while first or (arg is not None):
            arg_str = u'%d_' % idx
            arg = ScAddr.parse_from_string(self.get_argument(arg_str, None))
            if arg is not None:
                arguments.append(arg)
            first = False
            idx += 1

        keys = Keynodes(self.sctpClient)
        keynode_nrel_format = keys[KeynodeSysIdentifiers.nrel_format]
        keynode_format_txt = keys[KeynodeSysIdentifiers.format_txt]

        result = {}
        for arg in arguments:

            # try to resolve format
            format = self.sctpClient.iterate_elements(
                SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F,
                arg,
                ScElementType.sc_type_arc_common | ScElementType.sc_type_const,
                ScElementType.sc_type_node | ScElementType.sc_type_const,
                ScElementType.sc_type_arc_pos_const_perm,
                keynode_nrel_format
            )
            if format is not None:
                result[arg.to_id()] = format[0][2].to_id()
            else:
                result[arg.to_id()] = keynode_format_txt.to_id()

        self.serialize("application/json", json.dumps(result))

        
        
class Languages(DefaultHandler):
    
    @tornado.web.asynchronous
    def get(self):
        self.start_sctp_client()
        keys = Keynodes(self.sctpClient)
        langs = logic.get_languages_list(keys[KeynodeSysIdentifiers.languages], self.sctpClient)
        self.serialize("Content-Type", "application/json", json.dumps(langs))
    
class LanguageSet(DefaultHandler):
    
    @tornado.web.asynchronous
    def post(self):
        self.start_sctp_client()
        lang_addr = ScAddr.parse_from_string(self.get_argument(u'lang_addr', None))
        
        keys = Keynodes(self.sctpClient)
    
        sc_session = logic.ScSession(self, self.sctpClient, keys)
        sc_session.set_current_lang_mode(lang_addr)
        
        self.serialize("application/json")
    
class IdtfFind(DefaultHandler):
    
    @tornado.web.asynchronous
    def get(self):
        self.start_sctp_client()
        # get arguments
        substr = self.get_argument('substr', None)
        substrLen = float(len(substr))
        # connect to redis an try to find identifiers
        r = redis.StrictRedis(host = tornado.options.options.redis_host, 
                              port = tornado.options.options.redis_port,
                              db = tornado.options.options.redis_db_idtf)
        result = {}
        sys = []
        main = []
        common = []
        max_n = tornado.options.options.idtf_serach_limit
        
        # first of all need to find system identifiers
        cursor = 0
        while True:
            reply = r.scan(cursor, u"idtf:*%s*" % substr, 200)
            if not reply or len(reply) == 0:
                break
            cursor = int(reply[0])
            if cursor == 0:
                break
            for idtf in reply[1]:
                if len(sys) == max_n and len(main) == max_n and len(common) == max_n:
                    break
                
                rep = r.get(idtf)
                utf = idtf.decode('utf-8')
                addr = ScAddr.parse_binary(rep)
                if utf.startswith(u"idtf:sys:") and len(sys) < max_n:
                    # get text
                    text = utf[9:]
                    # create list: [idtf, autocomplete text, value comparison criterion]
                    sys.append([addr.to_id(), text, float(substrLen)/float(len(text))])
                elif utf.startswith(u"idtf:main:") and len(main) < max_n:
                    text = utf[1:]
                    main.append([addr.to_id(), text, float(substrLen)/float(len(text))])
                elif utf.startswith(u"idtf:common:") and len(common) < max_n:
                    text = utf[9:]
                    common.append([addr.to_id(), text, float(substrLen)/float(len(text))])
        # sort lists by third element(value comparison criterion) and exclude it from list
        sys = [[item[0], item[1]] for item in sorted(sys, key=lambda x: x[2])]
        main = [[item[0], item[1]] for item in sorted(main, key=lambda x: x[2])]
        common = [[item[0], item[1]] for item in sorted(common, key=lambda x: x[2])]

                    

        keys = Keynodes(self.sctpClient)
        keynode_nrel_main_idtf = keys[KeynodeSysIdentifiers.nrel_main_idtf]
        keynode_nrel_system_identifier = keys[KeynodeSysIdentifiers.nrel_system_identifier]
        keynode_nrel_idtf = keys[KeynodeSysIdentifiers.nrel_idtf]
                    
        result[keynode_nrel_system_identifier.to_id()] = sys
        result[keynode_nrel_main_idtf.to_id()] = main
        result[keynode_nrel_idtf.to_id()] = common

        self.serialize("application/json", json.dumps(result))

class IdtfResolve(DefaultHandler):
    
    @tornado.web.asynchronous
    def post(self):
        self.start_sctp_client()

        # get arguments
        idx = 1
        arguments = []
        arg = ''
        while arg is not None:
            arg = self.get_argument(u'%d_' % idx, None)
            if arg is not None:
                arguments.append(arg)
            idx += 1

        keys = Keynodes(self.sctpClient)
        
        sc_session = logic.ScSession(self, self.sctpClient, keys)
        used_lang = sc_session.get_used_language()
        

        result = {}
        # get requested identifiers for arguments
        for addr_str in arguments:
            addr = ScAddr.parse_from_string(addr_str)
            if addr is None:
                self.serialize_error(404, 'Can\'t parse sc-addr from argument: %s' % addr_str)

            found = False

            idtf_value = logic.get_identifier_translated(addr, used_lang, keys, self.sctpClient)
            if idtf_value:
                result[addr_str] = idtf_value
        
        self.serialize("application/json", json.dumps(result))

        
class AddrResolve(DefaultHandler):
    
    @tornado.web.asynchronous
    def post(self):
        self.start_sctp_client()
        # parse arguments
        first = True
        arg = None
        arguments = []
        idx = 0
        while first or (arg is not None):
            arg_str = u'%d_' % idx
            arg = self.get_argument(arg_str, None)
            if arg is not None:
                arguments.append(arg)
            first = False
            idx += 1

        res = {}
        for idtf in arguments:
            addr = self.sctpClient.find_element_by_system_identifier(str(idtf))
            if addr is not None:
                res[idtf] = addr.to_id()

        self.serialize("application/json", json.dumps(res))

        
class InfoTooltip(DefaultHandler):
    
    @tornado.web.asynchronous
    def post(self):
        self.start_sctp_client()
        # parse arguments
        first = True
        arg = None
        arguments = []
        idx = 0
        while first or (arg is not None):
            arg_str = u'%d_' % idx
            arg = self.get_argument(arg_str, None)
            if arg is not None:
                arguments.append(arg)
            first = False
            idx += 1
            
        keys = Keynodes(self.sctpClient)
        sc_session = logic.ScSession(self, self.sctpClient, keys)

        res = {}
        for addr in arguments:
            tooltip = logic.find_tooltip(ScAddr.parse_from_string(addr), self.sctpClient, keys, sc_session.get_used_language())
            res[addr] = tooltip

        self.serialize("application/json", json.dumps(res))

    
    
class User(DefaultHandler):
    
    @tornado.web.asynchronous
    def get(self):
        self.start_sctp_client()
        keys = Keynodes(self.sctpClient)
        
        # get user sc-addr
        sc_session = logic.ScSession(self, self.sctpClient, keys)
        user_addr = sc_session.get_sc_addr()
        result = {
                    'sc_addr': user_addr.to_id(),
                    'is_authenticated': False,
                    'current_lang': sc_session.get_used_language().to_id(),
                    'default_ext_lang': sc_session.get_default_ext_lang().to_id()
        }
    
        self.serialize("application/json", json.dumps(result))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   