CodeMirror.defineMode("scn", function() {


    var CONNECTORS = new RegExp("^((\\.\\.>)|(<\\.\\.)|" +
        "(\\->)|(<\\-)|(<=>)|(_<=>)|(=>)|(<=)|(_=>)|(_<=)|(_\\->)|(_<\\-)|(\\-\\|>)|(<\\|\\-)|(_\\-\\|>)|" +
        "(_<\\|\\-)|(\\-/>)|(</\\-)|(_\\-/>)|(_</\\-)|" +
        "(~\\|>)|(<\\|~)|(_~\\|>)|(_<~)|(~>)|(<~)|(_~>)|(_<~)|(~/>)|(</~)|(_~/>)|(_</~)|(=)|(<>)|(<)|(>))");

    var NAME = new RegExp("^[\\.a-zA-Z0-9_#]+");

    var LPAR_CONT = new RegExp("^\\[");
    var RPAR_CONT = new RegExp("^\\]");

    var ALIASNONAME = new RegExp("^\\*{3}");

    var PARENTHESES = new RegExp("^((\\(\\*)|(\\*\\))|(\\{)|(\\})|(<)|(>)|(\\()|(\\)))");

    var SEPARATORS = new RegExp("^((\\|)|(:)|(;;)|(;)|(=))");

    var URL = new RegExp("^\"");

    var LINE_COMMENT = new RegExp("^//");
    var BLOCK_COMMENT = new RegExp("^/!\\*");

    var ELEMTYPE = new RegExp('^((sc_arc_main)|(sc_arc_common)|(sc_link)|(sc_node)|(sc_edge)|(sc_arc_access))\\b');

    var indent = 0;

    CodeMirror.scnView = document.createElement("div");
    CodeMirror.scnView.className = "scnView";

    var curNodeContainer = CodeMirror.scnView;

    var indentUnit = 15;

    function defineLevel() {
        return indentUnit * indent;
    }

    function getFirstLevelContainer(keyword) {
        var keywordsContents = CodeMirror.scnView.getElementsByClassName("container");
        if (keywordsContents.length == 0)
            return undefined;
        for (var i in keywordsContents) {
            var keywordContent = keywordsContents[i];
            for (var j in keywordContent.childNodes) {
                var conKeyWord = keywordContent.childNodes[j].firstChild;
                if (conKeyWord && conKeyWord.className == "SCnKeyword" && conKeyWord.textContent == keyword) {
                    return keywordsContents[i];
                }
            }
        }
        return undefined;
    }

    function createContainer(className) {
        var container = document.createElement("div");
        if (typeof(className) == "string") {
            container.className = className;
        }
        return container;
    }

    function createRow(className) {
        var row = document.createElement("div");
        if (typeof(className) == "string") {
            row.className = className;
        }
        return row;
    }

    function shiftWithIndent(row) {
        row.style.paddingLeft = defineLevel() + "px";
    }

    function createShiftedRow(className) {
        var row = createRow(className);
        shiftWithIndent(row);
        return row;
    }

    function appendValueToRow(value, row, className) {
        var node = document.createElement("span");
        node.textContent = value;
        if (typeof(className) == "string") {
            node.className = className;
        }
        row.appendChild(node);
        return node;
    }

    function isBelow(first, second) {
        var nodes = curNodeContainer.childNodes;
        for (var i in nodes) {
            if(nodes[i] == first)
                return false;
            if(nodes[i] == second)
                return true;
        }
    }

    function getConnectorRow(container) {
        var cons = container.childNodes;
        var row;
        var rowWithAttr;
        for (var i in cons) {
            if (cons[i].className && cons[i].className.match("firstAttr"))
                row = cons[i];
            if (cons[i].className && cons[i].className.match("withAttr"))
                rowWithAttr = cons[i];
        }
        if (rowWithAttr && isBelow(rowWithAttr, row))
            return row.getElementsByClassName("SCnFieldMarker")[0].cloneNode(true);
        return row? row.cloneNode(true): null;
    }

    function findExtraAttributeForNode() {
        if (curNodeContainer.lastChild && !curNodeContainer.lastChild.className.match("withAttr")
            && !curNodeContainer.lastChild.className.match("connector")
            ) {
            var con = getConnectorRow(curNodeContainer);
            if (con) {
                curNodeContainer.appendChild(con);
            }
        }
    }

    function isSetInContainer() {
        var bracketNode = curNodeContainer.firstChild && curNodeContainer.firstChild.lastChild;
        return bracketNode && bracketNode.textContent == "{";
    }

    //tokenizer
    function tokenBase(stream, state) {

        if (stream.eatSpace()) {
            return null;
        }

        var ch = stream.peek();

        //handle comments
        if (ch == "/") {
            if (stream.match(BLOCK_COMMENT)) {
                state.tokenize = tokenComment;
                return tokenComment(stream, state);
            }
            if (stream.match(LINE_COMMENT)) {
                stream.skipToEnd();
                return;
            }
        }

        if (stream.match(ELEMTYPE)) {
            return;
        }

        // Handle urls
        if (stream.match(URL)) {
            state.tokenize = tokenStringFactory(stream.current());
            state.tokenize(stream, state);
            return;
        }

        // Handle connectors
        if (stream.match(CONNECTORS)) {

            var cssClasses = "SCnFieldValue connector firstAttr";

            var row = createShiftedRow(cssClasses);
            appendValueToRow(stream.current(), row, "SCnFieldMarker");
            curNodeContainer.appendChild(row);

            indent += 1;
            return;
        }

        if (stream.match(SEPARATORS)) {
            if (stream.current() == ";;") {
                indent = 0;
            }
            return;
        }

        // Handle content
        if (stream.match(LPAR_CONT)) {

            state.tokenize = tokenContentFactory();
            return;
        }
        if (stream.match(RPAR_CONT)) {

            return;
        }

        // Handle parentheses
        if (stream.match(PARENTHESES)) {

            if (stream.current() == "{" || stream.current() == "}") {
                if (stream.current() == "{") {
                    findExtraAttributeForNode();
                    var container = createContainer("container");
                    curNodeContainer.appendChild(container);
                    var setNode = document.createElement("div");
                    setNode.className = "set";
                    container.appendChild(setNode);
                    curNodeContainer = setNode;
                }

                var row = createShiftedRow("SCnFieldValue");

                appendValueToRow(stream.current(), row);
                curNodeContainer.appendChild(row);

                if (stream.current() == "}") {
                    curNodeContainer = curNodeContainer.parentNode.parentNode;
                }
            } else if (stream.current() == "(*") {
                curNodeContainer = curNodeContainer.lastChild;
            } else if (stream.current() == "*)") {
                curNodeContainer = curNodeContainer.parentNode;
                indent -= 1;
            }

            return;
        }

        if (stream.match(NAME)) {
            if(stream.match(/^\s?:/, false)) {
                var row = curNodeContainer;
                if (curNodeContainer.lastChild.className.match("connector") || curNodeContainer.lastChild.className.match("withAttr")) {
                    row = curNodeContainer.lastChild;
                } else if (!curNodeContainer.lastChild.className.match("withAttr")) {
                    if (!isSetInContainer()) {
                        var firstAttrRow = getConnectorRow(curNodeContainer);
                        var con = firstAttrRow.getElementsByClassName("SCnFieldMarker")[0];
                        row = createRow("SCnFieldValue withAttr");
                        row.style.paddingLeft = firstAttrRow.style.paddingLeft;
                        row.appendChild(con);
                        curNodeContainer.appendChild(row);
                    } else {
                        row = createShiftedRow("SCnFieldValue withAttr");
                        curNodeContainer.appendChild(row);
                    }
                }

                appendValueToRow(stream.current(), row, "attr");
                appendValueToRow(":", row);
                return;
            }

            var row = createShiftedRow("SCnFieldValue");
            if (isSetInContainer()) {
                appendValueToRow("*", row, "SCnFieldMarker");
            } else if(indent != 0) {
                findExtraAttributeForNode();
            }

            var nameNode = appendValueToRow(stream.current(), row);
            var container = createContainer("container");

            if (indent == 0 && !isSetInContainer()) {
                var contElem = getFirstLevelContainer(stream.current());
                if (contElem) {
                    curNodeContainer = contElem;
                    return;
                }
                nameNode.className = "SCnKeyword";
                CodeMirror.scnView.appendChild(container);
                curNodeContainer = container;

            } else {
                curNodeContainer.appendChild(container);
            }

            container.appendChild(row);

            return;
        }

        if (stream.match(ALIASNONAME)) {
            return;
        }

        // Handle non-detected items
        stream.next();
    }

    function tokenStringFactory(delimiter) {

        var txt = "";

        function tokenString(stream, state) {
            while (!stream.eol()) {
                stream.eatWhile(/[^\"]/);
                if (stream.match(delimiter)) {
                    state.tokenize = tokenBase;

                    txt += stream.current();

                    var row = createShiftedRow("SCnFieldValue");
                    if (isSetInContainer()) {
                        appendValueToRow("*", row, "SCnFieldMarker");
                    } else if(indent != 0) {
                        findExtraAttributeForNode();
                    }
                    appendValueToRow(txt, row, "SCnNoTransContent");
                    var container = createContainer("container");
                    container.appendChild(row);
                    curNodeContainer.appendChild(container);

                    return;
                }
            }
            txt += stream.current();
        }
        return tokenString;
    }

    function tokenContentFactory() {

        var txt = "";

        function tokenContent(stream, state) {
            while (!stream.eol()) {
                stream.eatWhile(/[^\]]/);
                if (stream.match(/^\]/, false)) {
                    state.tokenize = tokenBase;
                    txt += stream.current();

                    var row = createShiftedRow("SCnFieldValue");
                    if (isSetInContainer()) {
                        appendValueToRow("*", row, "SCnFieldMarker");
                    } else if(indent != 0) {
                        findExtraAttributeForNode();
                    }
                    appendValueToRow(txt, row, "SCnNoTransContent");
                    var container = createContainer("container");
                    container.appendChild(row);
                    curNodeContainer.appendChild(container);
                    return;
                }
            }
            txt += stream.current() + "\n";
        }
        return tokenContent;
    }

    function tokenComment(stream, state) {
        var maybeEnd = false, ch;
        while (ch = stream.next()) {
            if (ch == "/" && maybeEnd) {
                state.tokenize = tokenBase;
                break;
            }
            maybeEnd = (ch == "*");
        }
    }


    //interface

    var external = {
        startState: function() {
            return {
                tokenize: tokenBase
            };
        },

        token: function(stream, state) {
            state.tokenize(stream, state);
        }
    };

    return external;
});

