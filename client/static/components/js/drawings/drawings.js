/* --- src/drawings-common.js --- */
var Drawings = {};

function extend(child, parent) {
    var F = function () {
    };
    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
}

Drawings.DrawingMode = {
    POINT: 0,
    LINE: 1,
    SEGMENT: 2,
    TRIANGLE: 3,
    CIRCLE: 4
};

/* --- src/drawings-utils.js --- */
/**
 * Utils.
 */

Drawings.Utils = {

    getObjectById: function (objects, objectId) {
        return objects.filter(function (object) {
            return object.getId() == objectId;
        })[0];
    },

    randomUUID: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

/* --- src/model/drawings-shape.js --- */
/**
 * Shape model.
 */

Drawings.Shape = function Shape(points) {
    this.id = Drawings.Utils.randomUUID();
    this.name = '';
    this.points = points;
    this.className = this.constructor.name;
};

Drawings.Shape.prototype.getId = function () {
    return this.id;
};

Drawings.Shape.prototype.setId = function (id) {
    this.id = id;
};

Drawings.Shape.prototype.getName = function () {
    return this.name;
};

Drawings.Shape.prototype.setName = function (name) {
    return this.name = name;
};

Drawings.Shape.prototype.getPoints = function () {
    return this.points;
};

Drawings.Shape.prototype.getPoint = function (pointId) {
    return Drawings.Utils.getObjectById(this.points, pointId);
};

/* --- src/model/drawings-point.js --- */
/**
 * Point model.
 */

Drawings.Point = function Point(x, y) {
    this.id = Drawings.Utils.randomUUID();
    this.x = x;
    this.y = y;
    this.name = '';
};

Drawings.Point.prototype = {

    getId: function () {
        return this.id;
    },

    setId: function(id) {
        this.id = id;
    },

    getX: function () {
        return this.x;
    },

    setX: function (x) {
        this.x = x;
    },

    getY: function () {
        return this.y;
    },

    setY: function (y) {
        return this.y = y;
    },

    setXY: function (x, y) {
        this.x = x;
        this.y = y;
    },

    getName: function () {
        return this.name;
    },

    setName: function (name) {
        this.name = name;
    }
};

/* --- src/model/drawings-line.js --- */
/**
 * Line model.
 */

Drawings.Line = function Line(point1, point2) {
    Drawings.Line.superclass.constructor.apply(this, [[point1, point2]]);
};

extend(Drawings.Line, Drawings.Shape);

Drawings.Line.prototype.point1 = function () {
    return this.points[0];
};

Drawings.Line.prototype.point2 = function () {
    return this.points[1];
};

/* --- src/model/drawings-segment.js --- */
/**
 * Segment model.
 */

Drawings.Segment = function Segment(point1, point2) {
    Drawings.Segment.superclass.constructor.apply(this, [[point1, point2]]);
    this.length = null;
};

extend(Drawings.Segment, Drawings.Shape);

Drawings.Segment.prototype.point1 = function () {
    return this.points[0];
};

Drawings.Segment.prototype.point2 = function () {
    return this.points[1];
};

Drawings.Segment.prototype.setLength = function (length) {
    this.length = length;
};


/* --- src/model/drawings-triangle.js --- */
/**
 * Triangle model.
 */

Drawings.Triangle = function Triangle(point1, point2, point3) {
    Drawings.Triangle.superclass.constructor.apply(this, [[point1, point2, point3]]);
    this.square = null;
};

extend(Drawings.Triangle, Drawings.Shape);

Drawings.Triangle.prototype.point1 = function () {
    return this.points[0];
};

Drawings.Triangle.prototype.point2 = function () {
    return this.points[1];
};

Drawings.Triangle.prototype.point3 = function () {
    return this.points[2];
};

Drawings.Triangle.prototype.setSquare = function (square) {
    this.square = square;
};

/* --- src/model/drawings-circle.js --- */
Drawings.Circle = function Circle(point1, point2) {
    Drawings.Circle.superclass.constructor.apply(this, [[point1, point2]]);
    this.radius = null;
};

extend(Drawings.Circle, Drawings.Shape);

Drawings.Circle.prototype.point1 = function () {
    return this.points[0];
};

Drawings.Circle.prototype.point2 = function () {
    return this.points[1];
};

Drawings.Circle.prototype.setRadius = function (radius) {
    this.radius = radius;
};


/* --- src/model/drawings-model.js --- */
/**
 * Drawings model.
 */

Drawings.Model = function Model() {
    this.points = [];
    this.shapes = [];
};

Drawings.Model.prototype = {

    onUpdateCallback: null,

    getPoints: function () {
        return this.points;
    },

    getShapes: function () {
        return this.shapes;
    },

    getPoint: function (pointId) {
        return Drawings.Utils.getObjectById(this.points, pointId);
    },

    getShape: function (shapeId) {
        return Drawings.Utils.getObjectById(this.shapes, shapeId);
    },

    addPoint: function (point) {
        this.points.push(point);
        this._added([point]);
    },

    addPoints: function (points) {
        this.points = this.points.concat(points);
        this._added(points);
    },

    addShape: function (shape) {
        this.shapes.push(shape);
        this._added([shape]);
    },

    addShapes: function (shapes) {
        this.shapes = this.shapes.concat(shapes);
        this._added(shapes);
    },

    clear: function () {
        this._removed(this.shapes);
        this._removed(this.points);

        this.shapes.length = 0;
        this.points.length = 0;
    },

    onUpdate: function (callback) {
        this.onUpdateCallback = callback;
    },

    _added: function (objectsToAdd) {
        this.onUpdateCallback([], objectsToAdd, [])
    },

    _updated: function (objectsToUpdate) {
        this.onUpdateCallback([], [], objectsToUpdate);
    },

    _removed: function(objectsToRemove) {
        this.onUpdateCallback(objectsToRemove, [], []);
    }
};

/* --- src/translator/drawings-jsonTranslator.js --- */
/**
 * Json translator.
 */

Drawings.JsonTranslator = {

    toJson: function (model) {
        return JSON.stringify(model);
    },

    fromJson: function (json) {
        var jsonModel = JSON.parse(json);
        var points = this._fromJsonPoints(jsonModel.points);
        var shapes = this._fromJsonShapes(jsonModel.shapes, points);
        return {points: points, shapes: shapes};
    },

    _fromJsonPoints: function (jsonPoints) {
        var points = [];

        jsonPoints.forEach(function (jsonPoint) {
            var point = new Drawings.Point(jsonPoint.x, jsonPoint.y);
            point.setName(jsonPoint.name);
            point.setId(jsonPoint.id);
            points.push(point);
        });

        return points;
    },

    _fromJsonShapes: function (jsonShapes, points) {
        var shapes = [];

        var parseMethodsMap = {};
        parseMethodsMap["Line"] = this._parseJsonLine;
        parseMethodsMap["Segment"] = this._parseJsonSegment;
        parseMethodsMap["Circle"] = this._parseJsonCircle;
        parseMethodsMap["Triangle"] = this._parseJsonTriangle;

        jsonShapes.forEach(function (jsonShape) {
            var shape = parseMethodsMap[jsonShape.className](jsonShape, points);
            shapes.push(shape);
        });

        return shapes;
    },

    _parseJsonLine: function(jsonLine, points) {
        var point1 = Drawings.Utils.getObjectById(points, jsonLine.points[0].id);
        var point2 = Drawings.Utils.getObjectById(points, jsonLine.points[1].id);

        var line = new Drawings.Line(point1, point2);
        line.setId(jsonLine.id);
        line.setName(jsonLine.name);
        return line;
    },

    _parseJsonCircle: function(jsonCircle, points) {
        var point1 = Drawings.Utils.getObjectById(points, jsonCircle.points[0].id);
        var point2 = Drawings.Utils.getObjectById(points, jsonCircle.points[1].id);

        var circle = new Drawings.Circle(point1, point2);
        circle.setId(jsonCircle.id);
        circle.setName(jsonCircle.name);
        circle.setRadius(jsonCircle.radius);
        return circle;
    },

    _parseJsonSegment: function(jsonSegment, points) {
        var point1 = Drawings.Utils.getObjectById(points, jsonSegment.points[0].id);
        var point2 = Drawings.Utils.getObjectById(points, jsonSegment.points[1].id);

        var segment = new Drawings.Segment(point1, point2);
        segment.setId(jsonSegment.id);
        segment.setName(jsonSegment.name);
        segment.setLength(jsonSegment.length);
        return segment;
    },

    _parseJsonTriangle: function(jsonTriangle, points) {
        var point1 = Drawings.Utils.getObjectById(points, jsonTriangle.points[0].id);
        var point2 = Drawings.Utils.getObjectById(points, jsonTriangle.points[1].id);
        var point3 = Drawings.Utils.getObjectById(points, jsonTriangle.points[2].id);

        var triangle = new Drawings.Triangle(point1, point2, point3);
        triangle.setId(jsonTriangle.id);
        triangle.setName(jsonTriangle.name);
        triangle.setSquare(jsonTriangle.square);
        return triangle;
    }
};

/* --- src/editor/drawings-controller.js --- */
/**
 * Controller.
 */

Drawings.Controller = function (paintPanel, model) {
    this.paintPanel = paintPanel;
    this.model = model;
    this.modify = false;
};

Drawings.Controller.prototype = {

    drawingMode: Drawings.DrawingMode.POINT,

    points: [],

    mouseDownEvent: {},

    setDrawingMode: function(drawingMode) {
        this.drawingMode = drawingMode;
        this.points.length = 0;
    },

    handleEvent: function(event) {
        var LEFT_MOUSE_BUTTON = 1;
        if (event.type == 'mousedown' && event.which == LEFT_MOUSE_BUTTON) {
            this._handleLeftMouseDownEvent(event);
        }
        else if (event.type == 'mouseup' && event.which == LEFT_MOUSE_BUTTON) {
            this._handleLeftMouseUpEvent(event);
        }
    },

    _handleLeftMouseDownEvent: function(event) {
        this.mouseDownEvent = event;
    },

    _handleLeftMouseUpEvent: function(event) {
        var mouseDownCoordinates = this.paintPanel.getMouseCoordinates(this.mouseDownEvent);
        var mouseUpCoordinates = this.paintPanel.getMouseCoordinates(event);

        var x1 = mouseDownCoordinates[0];
        var y1 = mouseDownCoordinates[1];
        var x2 = mouseUpCoordinates[0];
        var y2 = mouseUpCoordinates[1];

        var distance = Math.sqrt((x1 - x2)^2 + (y1 - y2)^2);

        if (distance < 0.25) {
            this._handleLeftMouseClickEvent(event);
        }
    },

    _handleLeftMouseClickEvent: function(event) {
        if(this.modify == false) {
            var point = this._getOrCreatePoint(event);
            this._addPoint(point);
        } else {
            var jxgElement = this.paintPanel.getJxgElement(event);
            this._showDialog(jxgElement, event);
        }
    },

    _showDialog: function(jxgElement, event) {
        if(jxgElement instanceof JXG.Point) {
            this._setPointName(jxgElement);
        }
        else if(jxgElement instanceof JXG.Line) {
            this._setLineLength(jxgElement);
        } else {
            this._checkPolygons(event);
        }
    },

    _checkPolygons: function(event) {
        var polygons = this.paintPanel._getPolygons(event);
        if(polygons.length != 0) {
            this._setPolygonSquare(polygons);
        }
    },

    _setPolygonSquare: function(polygons) {
        var minAreaPolygon = polygons[0];
        if(polygons.length > 1){
            minAreaPolygon = this._getMinAreaPolygon(polygons);
        }
        this._setSquare(minAreaPolygon);
    },

    _setSquare: function(polygon) {
        var triangle = this.model.getShape(polygon.id);
        var square = prompt("Введите площадь");
        if(isNaN(parseInt(square)) || !isFinite(square)) {
            alert("Введите число!!")
        } else {
            triangle.setSquare(square);
            this.paintPanel.createTextLabel(polygon, square);
        }
    },

    _getMinAreaPolygon: function(polygons) {
        var minAreaPolygon = polygons[0];
        polygons.forEach(function(polygon) {
            if(polygon.Area() < minAreaPolygon.Area()) {
                minAreaPolygon = polygon;
            }
        })
        return minAreaPolygon;
    },

    _setPointName: function(jxgPoint) {
        var name = prompt("Введите имя точки")
        if(name) {
            jxgPoint.name = name;
            var point = this.model.getPoint(jxgPoint.id)
            point.setName(name);
        }
    },

    _setLineLength: function(jxgLine) {
        var line = this.model.getShape(jxgLine.id);
        if(line instanceof Drawings.Segment) {
            var length = prompt("Введите длину отрезка");
            if(isNaN(parseInt(length)) || !isFinite(length)) {
                alert("Введите число!!")
            } else {
                line.setLength(length);
                this.paintPanel.createTextLabel(jxgLine, length);
            }
        }
    },

    _getOrCreatePoint: function(event) {
        var point;

        var jxgPoint = this.paintPanel.getJxgPoint(event);

        if (jxgPoint) {
            point = this.model.getPoint(jxgPoint.id);
        }
        else {
            var coordinates = this.paintPanel.getMouseCoordinates(event);
            point = this._createPoint(coordinates);
        }

        return point;
    },

    _createPoint: function(coordinates) {
        var point = new Drawings.Point(coordinates[0], coordinates[1]);
        this.model.addPoint(point);
        return point;
    },

    _addPoint: function (point) {
        this.points.push(point);

        if (this.drawingMode == Drawings.DrawingMode.POINT) {
            this.points.length = 0;
        }
        else if (this.drawingMode == Drawings.DrawingMode.LINE) {
            this._createLineIfPossible();
        }
        else if (this.drawingMode == Drawings.DrawingMode.SEGMENT) {
            this._createSegmentIfPossible();
        }
        else if (this.drawingMode == Drawings.DrawingMode.TRIANGLE) {
            this._createTriangleIfPossible();
        }
        else if (this.drawingMode == Drawings.DrawingMode.CIRCLE) {
            this._createCircleIfPossible();
        }
    },

    _createLineIfPossible: function() {
        if (this.points.length == 2) {
            var line = new Drawings.Line(this.points[0], this.points[1]);
            line.setName(this._generateLineName(line));

            this.model.addShape(line);

            this.points.length = 0;
        }
    },

    _generateLineName: function(line) {
        var point1Name = line.point1().getName();
        var point2Name = line.point2().getName();
        return point1Name && point2Name ? 'Прямая(' + point1Name + ';' + point2Name + ')' : '';
    },

    _createSegmentIfPossible: function() {
        if (this.points.length == 2) {
            var segment = new Drawings.Segment(this.points[0], this.points[1]);
            segment.setName(this._generateSegmentName(segment));

            this.model.addShape(segment);

            this.points.length = 0;
        }
    },

    _createCircleIfPossible: function() {
        if (this.points.length == 2) {
            var circle = new Drawings.Circle(this.points[0], this.points[1]);
            circle.setName(this._generateCircleName(circle));
            this.model.addShape(circle);
            this.points.length = 0;
        }
    },

    _generateCircleName: function(circle) {
        var point1Name = circle.point1().getName();
        var point2Name = circle.point2().getName();
        return point1Name && point2Name ? 'Окр(' + point1Name + ';' + point2Name + ')' : '';
    },

    _generateSegmentName: function(segment) {
        var point1Name = segment.point1().getName();
        var point2Name = segment.point2().getName();
        return point1Name && point2Name ? 'Отр(' + point1Name + ';' + point2Name + ')' : '';
    },

    _createTriangleIfPossible: function() {
        if (this.points.length == 3) {
            var triangle = new Drawings.Triangle(this.points[0], this.points[1], this.points[2]);
            triangle.setName(this._generateTriangleName(triangle));

            this.model.addShape(triangle);

            this.points.length = 0;
        }
    },

    _generateTriangleName: function(triangle) {
        var point1Name = triangle.point1().getName();
        var point2Name = triangle.point2().getName();
        var point3Name = triangle.point3().getName();
        return point1Name && point2Name && point3Name ?
            'Треугк(' + point1Name + ';' + point2Name + ';' + point3Name + ')' : '';
    }
};

/* --- src/editor/drawings-paintPanel.js --- */
Drawings.PaintPanel = function (containerId, model) {
    this.containerId = containerId;

    this.model = model;

    this.controller = null;

    this.board = null;
};

Drawings.PaintPanel.prototype = {

    init: function () {
        this._initMarkup(this.containerId);

        this.board = this._createBoard();

        this._configureModel();

        this.controller = new Drawings.Controller(this, this.model);
    },

    getJxgElement: function(event) {
        var element = this.board.getAllObjectsUnderMouse(event)[0];
        return element;
    },

    getJxgPoint: function (event) {
        var jxgPoints = this._getJxgPoints(event);
        return jxgPoints.length > 0 ? jxgPoints[0] : null;
    },

    getMouseCoordinates: function (event) {
        var coordinates = this.board.getUsrCoordsOfMouse(event);
        return [coordinates[0], coordinates[1]];
    },

    _initMarkup: function (containerId) {
        var container = $('#' + containerId);
        var paintPanel = this;

        // root element
        container.append('<div id="geometryEditor" class="geometryEditor"></div>');
        var editor = $('#geometryEditor');

        // initialize toolbar markup
        editor.append('<div id="toolbar" class="toolbar"></div>');

        var toolbar = $('#toolbar');
        toolbar.append('<div id="pointButton" class="button point" title="Точка"></div>');
        toolbar.append('<div id="lineButton" class="button line" title="Прямая"></div>');
        toolbar.append('<div id="segmentButton" class="button segment" title="Отрезок"></div>');
        toolbar.append('<div id="triangleButton" class="button triangle" title="Треугольник"></div>');
        toolbar.append('<div id="circleButton" class="button circle" title="Окружность"></div>');
        toolbar.append('<div id="clearButton" class="button clear" title="Очистить"></div>');
        toolbar.append('<div id="saveToFile" class="button save" title="Сохранить"></div>');

        toolbar.append('<div id="load" class="button load" title="Загрузить"></div>');
        toolbar.append('<input id="fileInput" type="file">');
        toolbar.append('<div id="editButton" class="button edit" title="Редактировать"></div>');

        $('#pointButton').click(function () {
            paintPanel.controller.modify = false;
            paintPanel._setMode(Drawings.DrawingMode.POINT);
        });

        $('#lineButton').click(function () {
            paintPanel.controller.modify = false;
            paintPanel._setMode(Drawings.DrawingMode.LINE);
        });

        $('#segmentButton').click(function () {
            paintPanel.controller.modify = false;
            paintPanel._setMode(Drawings.DrawingMode.SEGMENT);
        });

        $('#triangleButton').click(function () {
            paintPanel.controller.modify = false;
            paintPanel._setMode(Drawings.DrawingMode.TRIANGLE);
        });

        $('#circleButton').click(function () {
            paintPanel.controller.modify = false;
            paintPanel._setMode(Drawings.DrawingMode.CIRCLE);
        });

        $('#clearButton').click(function () {
            paintPanel.controller.modify = false;
            paintPanel._clear();
        });

        $('#saveToFile').click(function () {
            paintPanel.controller.modify = false;
            paintPanel._saveToFile();
        });

        $('#load').click(function () {
            paintPanel.controller.modify = false;
            $("#fileInput").click();
        });

        $('#fileInput').change(function () {
            paintPanel.controller.modify = false;
            paintPanel._loadFromFile();
        });

        $('#editButton').click(function () {
            paintPanel.controller.modify = true;
        });

        // initialize board
        editor.append('<div id="board" class="board jxgbox"></div>');
    },

    _setMode: function (mode) {
        this.controller.setDrawingMode(mode);
    },

    _clear: function () {
        this.model.clear();
    },

    _saveToFile: function () {
        var json = Drawings.JsonTranslator.toJson(this.model);
        this._download("model.js", json);
    },

    _download: function (filename, content) {
        var downloadLink = document.createElement('a');
        downloadLink.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(content));
        downloadLink.setAttribute('download', filename);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    },

    _loadFromFile: function () {
        var file = $('#fileInput')[0].files[0];
        var reader = new FileReader();

        var paintPanel = this;
        reader.onload = function () {
            var result = Drawings.JsonTranslator.fromJson(reader.result);

            paintPanel.model.clear();

            paintPanel.model.addPoints(result.points);
            paintPanel.model.addShapes(result.shapes);
        };

        if (file) {
            reader.readAsText(file);
        }
    },

    _createBoard: function () {
        var board = JXG.JSXGraph.initBoard('board', {boundingbox: [-20, 20, 20, -20], showCopyright: false, grid: true, unitX: 20, unitY: 20});

        var paintPanel = this;

        board.on('mousedown', function (event) {
            paintPanel.controller.handleEvent(event);
        });

        board.on('mouseup', function (event) {
            paintPanel.controller.handleEvent(event);
        });

        return board;
    },

    _createSegmentLabel: function(segment, length){
        var point1 = segment.point1;
        var point2 = segment.point2;
        var segmentLabel = this.board.create('text',[
            function(){return (point1.X() + point2.X()) / 1.95 + 0.5;},
            function(){return (point1.Y() + point2.Y()) / 1.95 + 0.6;},
        length],{fontSize: 16});
        if(segment.textLabel) {
            segment.textLabel.setText("");
        }
        segment.textLabel = segmentLabel;
    },

    createTextLabel: function(jxgObject, text) {
        if(jxgObject instanceof  JXG.Line) {
            this._createSegmentLabel(jxgObject, text);
        } else if(jxgObject instanceof JXG.Polygon) {
            this._createPolygonLabel(jxgObject, text);
        }
    },

    _createPolygonLabel: function(triangle, square){
        var point1 = triangle.vertices[0];
        var point2 = triangle.vertices[1];
        var point3 = triangle.vertices[2];
        var textLabel = this.board.create('text',[
            function(){return (point1.X() + point2.X() + point3.X()) / 3;},
            function(){return (point1.Y() + point2.Y() + point3.Y()) / 3;},
            square],{fontSize: 16});
        if(triangle.textLabel) {
            triangle.textLabel.setText("");
        }
        triangle.textLabel = textLabel;
    },

    _configureModel: function () {
        var paintPanel = this;

        paintPanel._drawModel(paintPanel.model);

        paintPanel.model.onUpdate(function (objectsToRemove, objectsToAdd, objectsToUpdate) {
            paintPanel._erase(objectsToRemove);

            paintPanel._draw(objectsToAdd);

            paintPanel._erase(objectsToUpdate);
            paintPanel._draw(objectsToUpdate);
        });
    },

    _drawModel: function (model) {
        var objectsToDraw = [];
        objectsToDraw = objectsToDraw.concat(model.getPoints());
        objectsToDraw = objectsToDraw.concat(model.getShapes());
        this._draw(objectsToDraw);
    },

    _erase: function (modelObjects) {
        var jxgElement;
        for (var i = 0; i < modelObjects.length; i++) {
            jxgElement = this._getJxgObjectById(modelObjects[i].getId());
            if(jxgElement.textLabel) {
                this.board.removeObject(jxgElement.textLabel);
            }
            this.board.removeObject(jxgElement);
        }
    },

    _draw: function (modelObjects) {
        for (var i = 0; i < modelObjects.length; i++) {
            var modelObject = modelObjects[i];

            if (modelObject instanceof Drawings.Point) {
                this._drawPoint(modelObject);
            }
            else if (modelObject instanceof Drawings.Line) {
                this._drawLine(modelObject);
            }
            else if (modelObject instanceof Drawings.Segment) {
                this._drawSegment(modelObject);
            }
            else if (modelObject instanceof Drawings.Triangle) {
                this._drawTriangle(modelObject);
            }
            else if (modelObject instanceof Drawings.Circle) {
                this._drawCircle(modelObject);
            }
        }
    },

    _drawPoint: function (point) {
        var jxgPoint = this.board.create('point', [point.getX(), point.getY()],
            {id: point.getId(), name: point.getName(), showInfobox: false});

        var paintPanel = this;

        jxgPoint.coords.on('update', function () {
            var point = paintPanel.model.getPoint(this.id);
            point.setXY(this.X(), this.Y());
        }, jxgPoint);
    },

    _drawLine: function (line) {
        var jxgPoint1 = this._getJxgObjectById(line.point1().getId());
        var jxgPoint2 = this._getJxgObjectById(line.point2().getId());

        this.board.create('line', [jxgPoint1, jxgPoint2],
            {id: line.getId(), name: line.getName()});
    },

    _drawSegment: function (segment) {
        var jxgPoint1 = this._getJxgObjectById(segment.point1().getId());
        var jxgPoint2 = this._getJxgObjectById(segment.point2().getId());

        var jxgSegment = this.board.create('line', [jxgPoint1, jxgPoint2],
            {id: segment.getId(), name: segment.getName(), straightFirst: false, straightLast: false, strokeOpacity: 0.4});
        if(segment.length != "") {
            this._createSegmentLabel(jxgSegment, segment.length);
        }
    },

    _drawCircle: function (circle) {
        var jxgPoint1 = this._getJxgObjectById(circle.point1().getId());
        var jxgPoint2 = this._getJxgObjectById(circle.point2().getId());

        var jxgCircle = this.board.create('circle', [jxgPoint1, jxgPoint2],
            {id: circle.getId(), name: circle.getName(), straightFirst: false, straightLast: false, strokeOpacity: 0.4});
    },

    _drawTriangle: function (triangle) {
        var jxgPoint1 = this._getJxgObjectById(triangle.point1().getId());
        var jxgPoint2 = this._getJxgObjectById(triangle.point2().getId());
        var jxgPoint3 = this._getJxgObjectById(triangle.point3().getId());

        var polygon = this.board.create('polygon', [jxgPoint1, jxgPoint2, jxgPoint3],
            {id: triangle.getId(), name: triangle.getName(), straightFirst: false, straightLast: false, hasInnerPoints: true});
        if(triangle.square != "") {
            this._createPolygonLabel(polygon, triangle.square);
        }
    },

    _getJxgPoints: function (event) {
        return this.board.getAllObjectsUnderMouse(event).filter(function (element) {
            return element instanceof JXG.Point;
        });
    },

    _getJxgObjectById: function (id) {
        return this.board.select(function(jxgObject) {
            return jxgObject.id == id;
        }).objectsList[0];
    },

    _getPolygons: function(event){
        var elements =  this.board.select(function(jxgObject) {
            if(jxgObject instanceof  JXG.Polygon && jxgObject.hasPoint(event.layerX, event.layerY)) {
                return jxgObject;
            }
        }).objectsList;
        return elements;
    }
};

/* --- src/drawings-component.js --- */
/**
 * Drawings component.
 */
 
Drawings.GeomDrawComponent = {
    ext_lang: 'geometry_code',
    formats: ['format_geometry_json'],
    struct_support: true,
    factory: function(sandbox) {
        return new Drawings.GeomDrawWindow(sandbox);
    }
};

Drawings.GeomDrawWindow = function(sandbox) {
    this.sandbox = sandbox;

    this.model = new Drawings.Model();
    this.paintPanel = new Drawings.PaintPanel(this.sandbox.container, this.model);
    this.paintPanel.init();

    this.recieveData = function(data) {
        /// @todo Process data - json file data
    };

    // resolve keynodes
    var self = this;
    var scElements = {};
    
    this.needUpdate = false;
    
    this.requestUpdate = function() {
        var updateVisual = function() {
            
            for (var addr in scElements) {
                var obj = scElements[addr];
                
                if (!obj || obj.translated) continue;
                
                // check if object is an arc
                if (obj.data.type & sc_type_arc_pos_const_perm) {
                    
                    var begin = scElements[obj.data.begin];
                    var end = scElements[obj.data.end];

                    // if it connect point set and point, then create the last one
                    if (begin && end && begin.data.addr == self.keynodes.point) {
                        var point = new Drawings.Point((Math.random() - 0.5) * 15.0, (Math.random() - 0.5) * 15.0);
                        self.model.addPoint(point);
                        
                        obj.translated = true;
                    }
                }
            }
            
            /// @todo: Don't update if there are no new elements
            window.clearTimeout(self.structTimeout);
            delete self.structTimeout;
            
            if (self.needUpdate)
                self.requestUpdate();
        };
        
        
        
        self.needUpdate = true;
        if (!self.structTimeout) {
            self.needUpdate = false;
            self.structTimeout = window.setTimeout(updateVisual, 1000);
        }
    }
    
    this.keynodes = new Object();
    
    SCWeb.core.Server.resolveScAddr(['concept_geometric_point',
                                    ], function(keynodes) {
       
        self.keynodes.point = keynodes['concept_geometric_point'];
        
        self.needUpdate = true;
        self.requestUpdate();
    });

    this.eventStructUpdate = function(added, element, arc) {
        window.sctpClient.get_arc(arc).done(function (r) {
            var addr = r.result[1];
            window.sctpClient.get_element_type(addr).done(function (t) {
                var type = t.result;
                
                var obj = new Object();
                obj.data = new Object();
                
                obj.data.type = type;
                obj.data.addr = addr;
                
                if (type & sc_type_arc_mask) {
                    
                    window.sctpClient.get_arc(addr).done(function (a) {
                        obj.data.begin = a.result[0];
                        obj.data.end = a.result[1];
                        
                        scElements[addr] = obj;
                        self.requestUpdate();
                    });
                    
                } else {
                    scElements[addr] = obj;
                    self.requestUpdate();
                }
            });
        });
    };

    // delegate event handlers
    this.sandbox.eventDataAppend = $.proxy(this.receiveData, this);
    this.sandbox.eventStructUpdate = $.proxy(this.eventStructUpdate, this);

    this.sandbox.updateContent();
};

SCWeb.core.ComponentManager.appendComponentInitialize(Drawings.GeomDrawComponent);


