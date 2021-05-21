window.__intmode_wrap = function(arg) {
    return "<em>" + arg + "</em>";
};

SCWeb.ui.SearchPanel.intmode.modules["module_ims"] = {
    tokens : {
        lang_ru : "Bearer GRMMPDROAGTOXPQT4NHOGIXW2IKQRO4Y",
        lang_en : "Bearer CZAFPYDDJVTBJI5KQZC4AIZOQRHK2JBM"
    },

    url_prefixes : {
        lang_ru : "https://api.wit.ai/message?v=20210514&q=",
        lang_en : "https://api.wit.ai/message?v=20210330&q="
    },

    flag_element : "ui_menu_view_full_semantic_neighborhood", //the module is always enabled if flag_element is empty

    question_defaults : {
        minimal_confidence : 0.5,
        arguments : {
            count : 1,
            descriptors : [
                {
                    entity : "wit$message_subject:message_subject"
                }
            ]
        },
        flags : {
            is_enabled : true
        }
    },

    questions : [
        {
            lang : "lang_en",
            question_idtf : "ui_menu_view_full_semantic_neighborhood",
            intent : "what_is",
            translate : function(arguments) {
                return "What is " + __intmode_wrap(arguments[0]) + "?";
            }
        },
        {
            lang : "lang_en",
            question_idtf : "ui_menu_view_authors",
            intent : "who_is_author",
            translate : function(arguments) {
                return "Who is the author of " + __intmode_wrap(arguments[0]) + "?";
            }
        },
        {
            lang : "lang_en",
            question_idtf : "ui_menu_view_decomposition",
            intent : "variants_of_decomposition",
            translate : function(arguments) {
                return "What are the variants of decomposition of " + __intmode_wrap(arguments[0]) + "?";
            }
        },
        {
            lang : "lang_en",
            question_idtf : "ui_menu_view_all_input_const_pos_arc_in_the_agreed_part_of_kb",
            intent : "sets_contain_entity",
            translate : function(arguments) {
                return "What sets do contain " + __intmode_wrap(arguments[0]) + "?";
            }
        },
        {
            lang : "lang_en",
            question_idtf : "ui_menu_view_all_subclasses_in_quasybinary_relation",
            intent : "particular_entities",
            translate : function(arguments) {
                return "Which entities are particular to " + __intmode_wrap(arguments[0]) + "?";
            }
        },
        {
            lang : "lang_en",
            question_idtf : "ui_menu_view_all_output_const_pos_arc_in_the_agreed_part_of_kb",
            intent : "members_of_set",
            translate : function(arguments) {
                return "What are elements of " + __intmode_wrap(arguments[0]) + "?";
            }
        },
        {
            lang : "lang_en",
            question_idtf : "ui_menu_view_all_superclasses_in_quasybinary_relation",
            intent : "general_entities",
            translate : function(arguments) {
                return "Which entities are general to " + __intmode_wrap(arguments[0]) + "?";
            }
        },
        {
            lang : "lang_en",
            question_idtf : "ui_menu_view_translation",
            intent : "external_languages",
            translate : function(arguments) {
                return "What does " + __intmode_wrap(arguments[0]) + " look like in external languages?";
            }
        },
        {
            lang : "lang_en",
            question_idtf : "ui_menu_view_all_identifiers",
            intent : "external_identifiers",
            translate : function(arguments) {
                return "What are external identifiers of " + __intmode_wrap(arguments[0]) + "?";
            }
        },

        //russian versions
        {
            lang : "lang_ru",
            question_idtf : "ui_menu_view_full_semantic_neighborhood",
            intent : "what_is",
            translate : function(arguments) {
                return "Что такое " + __intmode_wrap(arguments[0]) + "?";
            }
        },
        {
            lang : "lang_ru",
            question_idtf : "ui_menu_view_authors",
            intent : "who_is_author",
            translate : function(arguments) {
                return "Кто является автором " + __intmode_wrap(arguments[0]) + "?";
            }
        },
        {
            lang : "lang_ru",
            question_idtf : "ui_menu_view_decomposition",
            intent : "variants_of_decomposition",
            translate : function(arguments) {
                return "Какие варианты декомпозиции существуют для " + __intmode_wrap(arguments[0]) + "?";
            }
        },
        {
            lang : "lang_ru",
            question_idtf : "ui_menu_view_all_input_const_pos_arc_in_the_agreed_part_of_kb",
            intent : "sets_contain_entity",
            translate : function(arguments) {
                return "Элементом каких множеств является " + __intmode_wrap(arguments[0]) + "?";
            }
        },
        {
            lang : "lang_ru",
            question_idtf : "ui_menu_view_all_subclasses_in_quasybinary_relation",
            intent : "particular_entities",
            translate : function(arguments) {
                return "Какие сущности являются частными относительно " + __intmode_wrap(arguments[0]) + "?";
            }
        },
        {
            lang : "lang_ru",
            question_idtf : "ui_menu_view_all_output_const_pos_arc_in_the_agreed_part_of_kb",
            intent : "members_of_set",
            translate : function(arguments) {
                return "Какие элементы содержатся в " + __intmode_wrap(arguments[0]) + "?";
            }
        },
        {
            lang : "lang_ru",
            question_idtf : "ui_menu_view_all_superclasses_in_quasybinary_relation",
            intent : "general_entities",
            translate : function(arguments) {
                return "Какие сущности являются общими относительно " + __intmode_wrap(arguments[0]) + "?";
            }
        },
        {
            lang : "lang_ru",
            question_idtf : "ui_menu_view_translation",
            intent : "external_languages",
            translate : function(arguments) {
                return "Как выглядит " + __intmode_wrap(arguments[0]) + " на внешних языках?";
            }
        },
        {
            lang : "lang_ru",
            question_idtf : "ui_menu_view_all_identifiers",
            intent : "external_identifiers",
            translate : function(arguments) {
                return "Какие внешние идентификаторы соответствуют " + __intmode_wrap(arguments[0]) + "?";
            }
        }
    ]
};
