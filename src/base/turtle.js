/*
    Copyright 2008-2015
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software dual licensed under the GNU LGPL or MIT License.

    You can redistribute it and/or modify it under the terms of the

      * GNU Lesser General Public License as published by
        the Free Software Foundation, either version 3 of the License, or
        (at your option) any later version
      OR
      * MIT License: https://github.com/jsxgraph/jsxgraph/blob/master/LICENSE.MIT

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License and
    the MIT License along with JSXGraph. If not, see <http://www.gnu.org/licenses/>
    and <http://opensource.org/licenses/MIT/>.
 */


/*global JXG: true, define: true*/
/*jslint nomen: true, plusplus: true*/

/* depends:
 jxg
 base/constants
 base/element
 utils/type
  elements:
   curve
   point
   line
   transform
 */

/**
 * @fileoverview The JSXGraph object Turtle is defined. It acts like
 * "turtle graphics".
 * @author A.W.
 */

define([
    'jxg', 'base/constants', 'base/element', 'utils/type', 'base/curve', 'base/point', 'base/line', 'base/transformation'
], function (JXG, Const, GeometryElement, Type, Curve, Point, Line, Transform) {

    "use strict";

    /**
     * Constructs a new Turtle object.
     *
     * It is derived from {@link JXG.GeometryElement}.
     * It stores all properties required
     * to move a turtle.
     *
     * @class JXG.Turtle
     * @constructor
     * @param {JXG.Board} board The board the new turtle is drawn on.
     * @param {Array} parents Start position and start direction of the turtle. Possible values are
     *
     * * [x, y, angle]
     * * [[x, y], angle]
     * * [x, y]
     * * [[x, y]]
     *
     * @param {Object} attributes Attributes to change the visual properties of the turtle object
     * All angles are in degrees.
     */
    JXG.Turtle = function (board, parents, attributes) {
        var x, y, dir;

        this.constructor(board, attributes, Const.OBJECT_TYPE_TURTLE, Const.OBJECT_CLASS_OTHER);

        this.turtleIsHidden = false;
        this.board = board;
        this.visProp.curveType = 'plot';

        // Save visProp in this._attributes.
        // this._attributes is overwritten by setPenSize, setPenColor...
        // Setting the color or size affects the turtle from the time of
        // calling the method,
        // whereas Turtle.setAttribute affects all turtle curves.
        this._attributes = Type.copyAttributes(this.visProp, board.options, 'turtle');
        delete this._attributes.id;

        x = 0;
        y = 0;
        dir = 90;

        if (parents.length !== 0) {
            // [x,y,dir]
            if (parents.length === 3) {
                // Only numbers are accepted at the moment
                x = parents[0];
                y = parents[1];
                dir = parents[2];
            } else if (parents.length === 2) {
                // [[x,y],dir]
                if (Type.isArray(parents[0])) {
                    x = parents[0][0];
                    y = parents[0][1];
                    dir = parents[1];
                // [x,y]
                } else {
                    x = parents[0];
                    y = parents[1];
                }
            // [[x,y]]
            } else {
                x = parents[0][0];
                y = parents[0][1];
            }
        }

        this.init(x, y, dir);

        this.methodMap = Type.deepCopy(this.methodMap, {
            forward: 'forward',
            fd: 'forward',
            back: 'back',
            bk: 'back',
            right: 'right',
            rt: 'right',
            left: 'left',
            lt: 'left',
            penUp: 'penUp',
            pu: 'penUp',
            penDown: 'penDown',
            pd: 'penDown',
            clearScreen: 'clearScreen',
            cs: 'clearScreen',
            clean: 'clean',
            setPos: 'setPos',
            home: 'home',
            hideTurtle: 'hideTurtle',
            ht: 'hideTurtle',
            showTurtle: 'showTurtle',
            st: 'showTurtle',
            penSize: 'setPenSize',
            penColor: 'setPenColor',
            pushTurtle: 'pushTurtle',
            push: 'pushTurtle',
            popTurtle: 'popTurtle',
            pop: 'popTurtle',
            lookTo: 'lookTo',
            pos: 'pos',
            moveTo: 'moveTo',
            X: 'X',
            Y: 'Y'
        });

        return this;
    };

    JXG.Turtle.prototype = new GeometryElement();

    JXG.extend(JXG.Turtle.prototype, /** @lends JXG.Turtle.prototype */ {
        /**
         * Initialize a new turtle or reinitialize a turtle after {@link JXG.Turtle#clearScreen}.
         *
         * @method init
         * @private
         * @param x {Number} initial x coordinate in user view
         * @param y {Number} initial y coordinate in user view
         * @param dir {Number} initial direction in degrees
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        init: function (x, y, dir) {
            var hiddenPointAttr = {
                    fixed: true,
                    name: '',
                    visible: false,
                    withLabel: false
                };

            this.arrowLen = 20 / Math.sqrt(this.board.unitX * this.board.unitX + this.board.unitY * this.board.unitY);

            this.pos = [x, y];
            this.isPenDown = true;

            /**
             * Turtle direction
             *
             * @property dir
             * @type {Number}
             * @private
             */
            this.dir = 90;

            /**
             * Turtle stack
             *
             * @property stack
             * @type {Array}
             * @private
             */
            this.stack = [];

            /**
             * Array containing all JSXgraph elements belonging to the turtle
             *
             * @property objects
             * @type {Array}
             */
            this.objects = [];

            /**
             * The actual turtle curve object
             *
             * @property curve
             * @type {JXG.Curve}
             */
            this.curve = this.board.create('curve', [[this.pos[0]], [this.pos[1]]], this._attributes);
            this.objects.push(this.curve);

            /**
             * Invisible point at the top of the turtle
             *
             * @property turtle
             * @type {JXG.Point}
             * @private
             */
            this.turtle = this.board.create('point', this.pos, hiddenPointAttr);
            this.objects.push(this.turtle);

            /**
             * Invisible point at the top of the arrow
             *
             * @property turtle2
             * @type {JXG.Point}
             * @private
             */
            this.turtle2 = this.board.create('point', [this.pos[0], this.pos[1] + this.arrowLen], hiddenPointAttr);
            this.objects.push(this.turtle2);

            this.visProp.arrow.lastArrow = true;
            this.visProp.arrow.straightFirst = false;
            this.visProp.arrow.straightLast = false;

            /**
             * Arrow as subsitute for a turtle image
             *
             * @property arrow
             * @type {JXG.Line}
             * @private
             */
            this.arrow = this.board.create('line', [this.turtle, this.turtle2], this.visProp.arrow);
            this.objects.push(this.arrow);

            this.right(90 - dir);
            this.board.update();

            return this;
        },

        /**
         * Move the turtle forward.
         *
         * @method forward
         * @param {Number} length of forward move in user coordinates
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        forward: function (len) {
            if (len === 0) {
                return this;
            }

            var t,
                dx = len * Math.cos(this.dir * Math.PI / 180),
                dy = len * Math.sin(this.dir * Math.PI / 180);

            if (!this.turtleIsHidden) {
                t = this.board.create('transform', [dx, dy], {type: 'translate'});

                t.applyOnce(this.turtle);
                t.applyOnce(this.turtle2);
            }

            if (this.isPenDown) {
                // IE workaround
                if (this.curve.dataX.length >= 8192) {
                    this.curve = this.board.create('curve', [[this.pos[0]], [this.pos[1]]], this._attributes);
                    this.objects.push(this.curve);
                }
            }

            this.pos[0] += dx;
            this.pos[1] += dy;

            if (this.isPenDown) {
                this.curve.dataX.push(this.pos[0]);
                this.curve.dataY.push(this.pos[1]);
            }

            this.board.update();
            return this;
        },

        /**
         * Move the turtle backwards.
         *
         * @method back
         * @param {Number} len of backwards move in user coordinates
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        back: function (len) {
            return this.forward(-len);
        },

        /**
         * Rotate the turtle direction to the right
         *
         * @method right
         * @param {Number} angle of the rotation in degrees
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        right: function (angle) {
            this.dir -= angle;
            this.dir %= 360;

            if (!this.turtleIsHidden) {
                var t = this.board.create('transform', [-angle * Math.PI / 180, this.turtle], {type: 'rotate'});
                t.applyOnce(this.turtle2);
            }

            this.board.update();
            return this;
        },

        /**
         * Rotate the turtle direction to the right.
         *
         * @method left
         * @param {Number} angle of the rotation in degrees
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        left: function (angle) {
            return this.right(-angle);
        },

        /**
         * Pen up, stops visible drawing
         *
         * @method penup
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        penUp: function () {
            this.isPenDown = false;
            return this;
        },

        /**
         * Pen down, continues visible drawing
         *
         * @method penDown
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        penDown: function () {
            this.isPenDown = true;
            this.curve = this.board.create('curve', [[this.pos[0]], [this.pos[1]]], this._attributes);
            this.objects.push(this.curve);

            return this;
        },

        /**
         * Removes the turtle curve from the board. The turtle stays in its position.
         *
         * @method clean
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        clean: function () {
            var i, el;

            for (i = 0; i < this.objects.length; i++) {
                el = this.objects[i];
                if (el.type === Const.OBJECT_TYPE_CURVE) {
                    this.board.removeObject(el);
                    this.objects.splice(i, 1);
                }
            }

            this.curve = this.board.create('curve', [[this.pos[0]], [this.pos[1]]], this._attributes);
            this.objects.push(this.curve);
            this.board.update();

            return this;
        },

        /**
         *  Removes the turtle completely and resets it to its initial position and direction.
         *
         * @method clearScreen
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        clearScreen: function () {
            var i, el,
                len = this.objects.length;

            for (i = 0; i < len; i++) {
                el = this.objects[i];
                this.board.removeObject(el);
            }

            this.init(0, 0, 90);
            return this;
        },

        /**
         *  Moves the turtle without drawing to a new position
         *
         * @method setPos
         * @param {Number} x new x- coordinate
         * @param {Number} y new y- coordinate
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        setPos: function (x, y) {
            var t;

            if (Type.isArray(x)) {
                this.pos = x;
            } else {
                this.pos = [x, y];
            }

            if (!this.turtleIsHidden) {
                this.turtle.setPositionDirectly(Const.COORDS_BY_USER, [x, y]);
                this.turtle2.setPositionDirectly(Const.COORDS_BY_USER, [x, y + this.arrowLen]);
                t = this.board.create('transform', [-(this.dir - 90) * Math.PI / 180, this.turtle], {type: 'rotate'});
                t.applyOnce(this.turtle2);
            }

            this.curve = this.board.create('curve', [[this.pos[0]], [this.pos[1]]], this._attributes);
            this.objects.push(this.curve);
            this.board.update();

            return this;
        },

        /**
         *  Sets the pen size. Equivalent to setAttribute({strokeWidth:size})
         * but affects only the future turtle.
         *
         * @method setPenSize
         * @param {Number} size
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        setPenSize: function (size) {
            //this.visProp.strokewidth = size;
            this.curve = this.board.create('curve', [[this.pos[0]], [this.pos[1]]], this.copyAttr('strokeWidth', size));
            this.objects.push(this.curve);
            return this;
        },

        /**
         *  Sets the pen color. Equivalent to setAttribute({strokeColor:color})
         * but affects only the future turtle.
         *
         * @method setPenColor
         * @param {String} color
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        setPenColor: function (color) {
            this.curve = this.board.create('curve', [[this.pos[0]], [this.pos[1]]], this.copyAttr('strokeColor', color));
            this.objects.push(this.curve);

            return this;
        },

        /**
         *  Sets the highlight pen color. Equivalent to setAttribute({highlightStrokeColor:color})
         * but affects only the future turtle.
         *
         * @method setHighlightPenColor
         * @param {String} color
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        setHighlightPenColor: function (color) {
            //this.visProp.highlightstrokecolor = colStr;
            this.curve = this.board.create('curve', [[this.pos[0]], [this.pos[1]]], this.copyAttr('highlightStrokeColor', color));
            this.objects.push(this.curve);
            return this;
        },

        /**
         * Sets properties of the turtle, see also {@link JXG.GeometryElement#setAttribute}.
         * Sets the property for all curves of the turtle in the past and in the future.
         *
         * @method setAttribute
         * @param {Object} attributes key:value pairs
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        setAttribute: function (attributes) {
            var i, el, tmp,
                len = this.objects.length;

            for (i = 0; i < len; i++) {
                el = this.objects[i];
                if (el.type === Const.OBJECT_TYPE_CURVE) {
                    el.setAttribute(attributes);
                }
            }

            // Set visProp of turtle
            tmp = this.visProp.id;
            this.visProp = Type.deepCopy(this.curve.visProp);
            this.visProp.id = tmp;
            this._attributes = Type.deepCopy(this.visProp);
            delete this._attributes.id;

            return this;
        },

        /**
         * Set a future attribute of the turtle.
         *
         * @method copyAttr
         * @private
         * @param {String} key
         * @param {Number|String} val
         * @return {Object} pointer to the attributes object
         */
        copyAttr: function (key, val) {
            this._attributes[key.toLowerCase()] = val;
            return this._attributes;
        },

        /**
         * Sets the visibility of the turtle head to true.
         *
         * @method showTurtle
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        showTurtle: function () {
            this.turtleIsHidden = false;
            this.arrow.setAttribute({visible: true});
            this.visProp.arrow.visible = false;
            this.setPos(this.pos[0], this.pos[1]);
            this.board.update();

            return this;
        },

        /**
         * Sets the visibility of the turtle head to false
         *
         * @method hideTurtle
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        hideTurtle: function () {
            this.turtleIsHidden = true;
            this.arrow.setAttribute({visible: false});
            this.visProp.arrow.visible = false;
            this.board.update();

            return this;
        },

        /**
         * Moves the turtle to position [0,0].
         *
         * @method home
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        home: function () {
            this.pos = [0, 0];
            this.setPos(this.pos[0], this.pos[1]);

            return this;
        },

        /**
         *  Pushes the position of the turtle on the stack.
         *
         * @method pushTurtle
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        pushTurtle: function () {
            this.stack.push([this.pos[0], this.pos[1], this.dir]);

            return this;
        },

        /**
         *  Gets the last position of the turtle on the stack, sets the turtle to this position and removes this
         * position from the stack.
         *
         * @method popTurtle
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        popTurtle: function () {
            var status = this.stack.pop();
            this.pos[0] = status[0];
            this.pos[1] = status[1];
            this.dir = status[2];
            this.setPos(this.pos[0], this.pos[1]);

            return this;
        },

        /**
         * Rotates the turtle into a new direction.
         * There are two possibilities:
         *
         * @method lookTo
         * @param {Number|Array} target If a number is given, it is interpreted as the new direction to look to; If an array
         * consisting of two Numbers is given targeted is used as a pair coordinates.
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        lookTo: function (target) {
            var ax, ay, bx, by, beta;

            if (Type.isArray(target)) {
                ax = this.pos[0];
                ay = this.pos[1];
                bx = target[0];
                by = target[1];

                // Rotate by the slope of the line [this.pos, target]
                beta = Math.atan2(by - ay, bx - ax);
                this.right(this.dir - (beta * 180 / Math.PI));
            } else if (Type.isNumber(target)) {
                this.right(this.dir - target);
            }
            return this;
        },

        /**
         * Moves the turtle to a given coordinate pair.
         * The direction is not changed.
         *
         * @method moveTo
         * @param {Array} target Coordinates of the point where the turtle looks to.
         * @return {JXG.Turtle} pointer to the turtle object
         * @chainable
         */
        moveTo: function (target) {
            var dx, dy, t;

            if (Type.isArray(target)) {
                dx = target[0] - this.pos[0];
                dy = target[1] - this.pos[1];

                if (!this.turtleIsHidden) {
                    t = this.board.create('transform', [dx, dy], {type: 'translate'});
                    t.applyOnce(this.turtle);
                    t.applyOnce(this.turtle2);
                }

                if (this.isPenDown) {
                    // IE workaround
                    if (this.curve.dataX.length >= 8192) {
                        this.curve = this.board.create('curve', [[this.pos[0]], [this.pos[1]]], this._attributes);
                        this.objects.push(this.curve);
                    }
                }

                this.pos[0] = target[0];
                this.pos[1] = target[1];

                if (this.isPenDown) {
                    this.curve.dataX.push(this.pos[0]);
                    this.curve.dataY.push(this.pos[1]);
                }
                this.board.update();
            }

            return this;
        },

        /**
         * Alias for {@link #forward}
         *
         * @method fd
         */
        fd: function (len) { return this.forward(len); },

        /**
         * Alias for {@link #back}
         *
         * @method bk
         */
        bk: function (len) { return this.back(len); },

        /**
         * Alias for {@link #left}
         *
         * @method lt
         */
        lt: function (angle) { return this.left(angle); },

        /**
         * Alias for {@link #right}
         *
         * @method rt
         */
        rt: function (angle) { return this.right(angle); },

        /**
         * Alias for {@link #penUp}
         *
         * @method pu
         */
        pu: function () { return this.penUp(); },

        /**
         * Alias for {@link #penDown}
         *
         * @method pd
         */
        pd: function () { return this.penDown(); },

        /**
         * Alias for {@link #hideTurtle}
         *
         * @method ht
         */
        ht: function () { return this.hideTurtle(); },

        /**
         * Alias for {@link #showTurtle}
         *
         * @method st
         */
        st: function () { return this.showTurtle(); },


        /**
         * Alias for {@link #clearScreen}
         *
         * @method cs
         */
        cs: function () { return this.clearScreen(); },

        /**
         * Alias for {@link #pushTurtle}
         *
         * @method push
         */
        push: function () { return this.pushTurtle(); },

        /**
         * Alias for {@link #popTurtle}
         *
         * @method pop
         */
        pop: function () { return this.popTurtle(); },

        /**
         * The `co`-coordinate of the turtle curve at position t is returned.
         *
         * @method evalAt
         * @param {Number} t parameter
         * @param {String} co. Either 'X' or 'Y'.
         * @return {Number}  x/y-coordinate of turtle at position t or x/y-coordinate of the turtle position if t > position.
         */
        evalAt: function (t, co) {
            var i, j, el, tc,
                len = this.objects.length;

            for (i = 0, j = 0; i < len; i++) {
                el = this.objects[i];

                if (el.elementClass === Const.OBJECT_CLASS_CURVE) {
                    if (j <= t && t < j + el.numberPoints) {
                        tc = (t - j);
                        return el[co](tc);
                    }
                    j += el.numberPoints;
                }
            }

            return this[co]();
        },

        /**
         * If t is not supplied the x-coordinate of the turtle is returned. Otherwise
         * the x-coordinate of the turtle curve at position t is returned.
         *
         * @method X
         * @param {Number} t parameter
         * @return {Number} x-coordinate of the turtle position or x-coordinate of turtle at position t
         */
        X: function (t) {
            if (!Type.exists(t)) {
                return this.pos[0];
            }

            return this.evalAt(t, 'X');
        },

        /**
         * If t is not supplied the y-coordinate of the turtle is returned. Otherwise
         * the y-coordinate of the turtle curve at position t is returned.
         *
         * @method Y
         * @param {Number} t parameter
         * @return {Number} y-coordinate of the turtle position or y-coordinate of turtle at position t
         */
        Y: function (t) {
            if (!Type.exists(t)) {
                return this.pos[1];
            }
            return this.evalAt(t, 'Y');
        },

        /**
         * @method Z
         * @return {Number} z-coordinate of the turtle position
         */
        Z: function (t) {
            return 1.0;
        },

        /**
         * Gives the lower bound of the parameter if the the turtle is treated as parametric curve.
         *
         * @method minX
         * @retun {Number} 0
         */
        minX: function () {
            return 0;
        },

        /**
         * Gives the upper bound of the parameter if the the turtle is treated as parametric curve.
         * May be overwritten in @see generateTerm.
         *
         * @method maxX
         * @return {Number}
         */
        maxX: function () {
            var i, el,
                len = this.objects.length,
                np = 0;

            for (i = 0; i < len; i++) {
                el = this.objects[i];
                if (el.elementClass === Const.OBJECT_CLASS_CURVE) {
                    np += this.objects[i].numberPoints;
                }
            }
            return np;
        },

        /**
         * Checks whether (x,y) is near the curve.
         *
         * @method hasPoint
         * @param {Number} x Coordinate in x direction, screen coordinates.
         * @param {Number} y Coordinate in y direction, screen coordinates.
         * @return {Boolean} True if (x,y) is near the curve, False otherwise.
         */
        hasPoint: function (x, y) {
            var i, el;

            // run through all curves of this turtle
            for (i = 0; i < this.objects.length; i++) {
                el = this.objects[i];

                if (el.type === Const.OBJECT_TYPE_CURVE) {
                    if (el.hasPoint(x, y)) {
                        // So what??? All other curves have to be notified now (for highlighting)
                        return true;
                        // This has to be done, yet.
                    }
                }
            }
            return false;
        }
    });

    /**
     * This element is used to provide a constructor for a turtle.
     *
     * @pseudo
     * @class Turtle
     * @extends JXG.Turtle
     * @constructor
     * @type JXG.Turtle
     *
     * @param {Array} parents Start position and start direction of the turtle. Possible values are
     *
     * * [x, y, angle]
     * * [[x, y], angle]
     * * [x, y]
     * * [[x, y]]
     *
     * @param {Object} attributes Object containing properties for the element such as stroke-color and visibility. See {@link JXG.GeometryElement#setAttribute}
     * @return {JXG.Turtle} Reference to the created turtle object.
     *
     * @example
     *
     *     var board = JXG.JSXGraph.initBoard('box', {boundingbox: [-300, 300, 300, -300]});
     *     var t = board.create('turtle');
     *
     *     var side = function(size, level) {
     *         if (level == 0) {
     *             t.fd(size);
     *             return;
     *         }
     *         side(size/3, level-1);
     *         t.lt(60);
     *         side(size/3, level-1);
     *         t.rt(120);
     *         side(size/3, level-1);
     *         t.lt(60);
     *         side(size/3, level-1);
     *     };
     *
     *     var snowflake = function (size, level) {
     *         var i;
     *         for (i = 0; i < 3; i++) {
     *             side(size, level);
     *             t.rt(120);
     *         };
     *     }
     *
     *     t.clearScreen().hideTurtle();
     *     t.setPenSize(1).setPenColor("#000000");
     *     t.lt(30).setPos(0, -100);
     *
     *     snowflake(250, 3);
     *
     * <div id="280aee5e-3c1c-11e5-8dd9-901b0e1b8723" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     * (function() {
     * var board = JXG.JSXGraph.initBoard('280aee5e-3c1c-11e5-8dd9-901b0e1b8723',
     *     {boundingbox: [-300, 300, 300, -300], axis: false, showcopyright: false, shownavigation: false});
     * var t = board.create('turtle');
     * var side = function(size, level) {
     * if (level == 0) {
     * t.fd(size);
     * return;
     * }
     * side(size/3, level-1);
     * t.lt(60);
     * side(size/3, level-1);
     * t.rt(120);
     * side(size/3, level-1);
     * t.lt(60);
     * side(size/3, level-1);
     * };
     * var snowflake = function (size, level) {
     * var i;
     * for (i = 0; i < 3; i++) {
     * side(size, level);
     * t.rt(120);
     * };
     * }
     * t.clearScreen().hideTurtle();
     * t.setPenSize(1).setPenColor("#000000");
     * t.lt(30).setPos(0, -100);
     * snowflake(250, 3);
     * })();
     * </script>
     *
     * @example
     *     var board = JXG.JSXGraph.initBoard('box', {boundingbox: [-300, 300, 300, -300]});
     *     var t = board.create('turtle');
     *
     *     var branch = function(length, level) {
     *         if  (level == 0)
     *             return;
     *
     *         t.fd(length).lt(45);
     *         branch(length / 2, level - 1);
     *         t.rt(90);
     *         branch(length / 2, level - 1);
     *         t.lt(45).bk(length);
     *     };
     *
     *     var lbranch = function(length, angle, level) {
     *         t.fd(2 * length);
     *         node(length, angle, level);
     *         t.bk(2 * length);
     *     };
     *
     *     var rbranch = function (length, angle, level) {
     *         t.fd(length);
     *         node(length, angle, level);
     *         t.bk(length);
     *     };
     *
     *     var node = function (length, angle, level) {
     *         if (level == 0)
     *             return;
     *
     *         t.lt(angle);
     *         lbranch(length, angle, level - 1);
     *         t.rt(2 * angle);
     *         rbranch(length, angle, level - 1);
     *         t.lt(angle);
     *     };
     *
     *     t.clearScreen().hideTurtle();
     *     t.setPenSize(5).setPenColor("#008800");
     *     t.setPos(30, -150);
     *     lbranch(25, 20, 7);
     *
     * <div id="092cf60c-3c1d-11e5-8dd9-901b0e1b8723" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     * (function() {
     * var board = JXG.JSXGraph.initBoard('092cf60c-3c1d-11e5-8dd9-901b0e1b8723',
     *     {boundingbox: [-300, 300, 300, -300], showcopyright: false, shownavigation: false});
     * var t = board.create('turtle');
     * var branch = function(length, level) {
     * if  (level == 0)
     * return;
     * t.fd(length).lt(45);
     * branch(length / 2, level - 1);
     * t.rt(90);
     * branch(length / 2, level - 1);
     * t.lt(45).bk(length);
     * };
     * var lbranch = function(length, angle, level) {
     * t.fd(2 * length);
     * node(length, angle, level);
     * t.bk(2 * length);
     * };
     * var rbranch = function (length, angle, level) {
     * t.fd(length);
     * node(length, angle, level);
     * t.bk(length);
     * };
     * var node = function (length, angle, level) {
     * if (level == 0)
     * return;
     * t.lt(angle);
     * lbranch(length, angle, level - 1);
     * t.rt(2 * angle);
     * rbranch(length, angle, level - 1);
     * t.lt(angle);
     * };
     * t.clearScreen().hideTurtle();
     * t.setPenSize(5).setPenColor("#008800");
     * t.setPos(30, -150);
     * lbranch(25, 20, 7);
     * })();
     * </script>
     *
     * @example
     *     var board = JXG.JSXGraph.initBoard('jxgbox',{boundingbox: [-250, 250, 250, -250]});
     *     var t = brd.create('turtle', [0, 0], {strokeOpacity:0.5});
     *     t.setPenSize(3);
     *     t.right(90);
     *     var alpha = 0;
     *
     *     var run = function() {
     *        t.forward(2);
     *        if (Math.floor(alpha / 360) % 2 === 0) {
     *           t.left(1);        // turn left by 1 degree
     *        } else {
     *           t.right(1);       // turn right by 1 degree
     *        }
     *
     *        alpha += 1;
     *
     *        if (alpha < 1440) {  // stop after two rounds
     *            setTimeout(run, 20);
     *        }
     *     }
     *
     *     run();
     *
     * <div id="af9140b6-3c1d-11e5-8dd9-901b0e1b8723" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     * (function() {
     * var board = JXG.JSXGraph.initBoard('af9140b6-3c1d-11e5-8dd9-901b0e1b8723',
     *     {boundingbox: [-250, 250, 250, -250], showcopyright: false, shownavigation: false});
     * var t = board.create('turtle',[0, 0], {strokeOpacity:0.5});
     * t.setPenSize(3);
     * t.right(90);
     * var alpha = 0;
     * var run = function() {
     * t.forward(2);
     * if (Math.floor(alpha / 360) % 2 === 0) {
     * t.left(1);        // turn left by 1 degree
     * } else {
     * t.right(1);       // turn right by 1 degree
     * }
     * alpha += 1;
     * if (alpha < 1440) {  // stop after two rounds
     * setTimeout(run, 20);
     * }
     * }
     * run();
     * })();
     * </script>
     *
     */
    JXG.createTurtle = function (board, parents, attributes) {
        var attr;
        parents = parents || [];

        attr = Type.copyAttributes(attributes, board.options, 'turtle');
        return new JXG.Turtle(board, parents, attr);
    };

    JXG.registerElement('turtle', JXG.createTurtle);

    return {
        Turtle: JXG.Turtle,
        createTurtle: JXG.createTurtle
    };
});
