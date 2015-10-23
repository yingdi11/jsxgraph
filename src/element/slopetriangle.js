/*
    Copyright 2008-2014
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
 see define call
 */

/**
 * @fileoverview Example file for a triangle implemented as a extension to JSXGraph.
 */

define([
    'jxg', 'options', 'utils/type', 'base/constants', 'base/line', 'base/polygon', 'base/point', 'base/element'
], function (JXG, Options, Type, Const, Line, Polygon, Point, GeometryElement) {

    "use strict";

    var priv = {
            removeSlopeTriangle: function () {
                Polygon.Polygon.prototype.remove.call(this);

                this.board.removeObject(this.toppoint);
                this.board.removeObject(this.glider);

                this.board.removeObject(this.baseline);
                this.board.removeObject(this.basepoint);

                this.board.removeObject(this.label);

                if (this._isPrivateTangent) {
                    this.board.removeObject(this.tangent);
                }
            },
            Value: function () {
                return this.tangent.getSlope();
            }
        };

    /**
     * Slope triangle for a point on a line.
     *
     * @pseudo
     * @class Slopetriangle
     * @extends JXG.Line
     * @constructor
     * @type JXG.Polygon
     *
     * @param {JXG.Line} t A tangent based on a glider on some object, e.g. curve, circle, line or turtle.
     *
     * **Variant 2:**
     * @param {JXG.Point} p A glider on some element (curve, circle, line, ...).
     *
     * **Variant 3:**
     * @param {JXG.Line} li A line
     * @param {JXG.Point} p A point on that line.
     *  The user has to take care that the point is a member of the line.
     *
     * @throws {Error} If the element cannot be constructed with the given parent objects an exception is thrown.
     *
     * @example
     *     // Create a slopetriangle on a tangent
     *     var f = board.create('plot', ['sin(x)']),
     *         g = board.create('glider', [1, 2, f]),
     *         t = board.create('tangent', [g]),
     *
     *         st = board.create('slopetriangle', [t]);
     *
     * <div id="951ccb6a-52bc-4dc2-80e9-43db064f0f1b" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     * (function () {
     *   var board = JXG.JSXGraph.initBoard('951ccb6a-52bc-4dc2-80e9-43db064f0f1b', {boundingbox: [-5, 5, 5, -5], axis: true, showcopyright: false, shownavigation: false}),
     *   f = board.create('plot', ['sin(x)']),
     *   g = board.create('glider', [1, 2, f]),
     *   t = board.create('tangent', [g]),
     *   st = board.create('slopetriangle', [t]);
     * })();
     * </script>
     *
     * @example
     *     // Create a slopetriangle on a glider
     *     var f = board.create('plot', ['sin(x)']),
     *         g = board.create('glider', [1, 2, f]),
     *         st = board.create('slopetriangle', [g]);
     *
     * <div id="64da7d87-6308-469a-b822-dfbf3bbb1fb0" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     * (function () {
     *   var board = JXG.JSXGraph.initBoard('64da7d87-6308-469a-b822-dfbf3bbb1fb0', {boundingbox: [-5, 5, 5, -5], axis: true, showcopyright: false, shownavigation: false}),
     *   f = board.create('plot', ['sin(x)']),
     *   g = board.create('glider', [1, 2, f]),
     *   st = board.create('slopetriangle', [g]);
     * })();
     * </script>
     *
     * @example
     *     // Create a glider on a line and a slope triangle on that line
     *     var p1 = board.create('point', [-2, 3]),
     *         p2 = board.create('point', [2, -3]),
     *         li = board.create('line', [p1, p2]),
     *         p = board.create('glider', [0, 0, li]),
     *
     *         st = board.create('slopetriangle', [li, p]);
     *
     * <div id="b52f451c-22cf-4677-852a-0bb9d764ee95" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     * (function () {
     *   var board = JXG.JSXGraph.initBoard('b52f451c-22cf-4677-852a-0bb9d764ee95', {boundingbox: [-5, 5, 5, -5], axis: true, showcopyright: false, shownavigation: false}),
     *   p1 = board.create('point', [-2, 3]),
     *   p2 = board.create('point', [2, -3]),
     *   li = board.create('line', [p1, p2]),
     *   p = board.create('glider', [0, 0, li]),
     *   st = board.create('slopetriangle', [li, p]);
     * })();
     * </script>
     */
    JXG.createSlopeTriangle = function (board, parents, attributes) {
        var el, tangent, tglide, glider, toppoint, baseline, basepoint, label, attr,
            isPrivateTangent = false;

        if (parents.length === 1 && parents[0].type === Const.OBJECT_TYPE_TANGENT) {
            tangent = parents[0];
            tglide = tangent.glider;
        } else if (parents.length === 1 && parents[0].type === Const.OBJECT_TYPE_GLIDER) {
            tglide = parents[0];
            attr = Type.copyAttributes(attributes, board.options,  'slopetriangle', 'tangent');
            tangent = board.create('tangent', [tglide], attr);
            isPrivateTangent = true;
        } else if (parents.length === 2 &&
                parents[0].elementClass === Const.OBJECT_CLASS_LINE && Type.isPoint(parents[1])) {
            tangent = parents[0];
            tglide = parents[1];
        } else {
            throw new Error("JSXGraph: Can't create slope triangle with parent types '" + (typeof parents[0]) + "'.");
        }

        attr = Type.copyAttributes(attributes, board.options, 'slopetriangle', 'basepoint');
        basepoint = board.create('point', [function () {
            return [tglide.X() + 1,  tglide.Y()];
        }], attr);

        attr = Type.copyAttributes(attributes, board.options, 'slopetriangle', 'baseline');
        baseline = board.create('line', [tglide, basepoint], attr);

        attr = Type.copyAttributes(attributes, board.options, 'slopetriangle', 'glider');
        glider = board.create('glider', [tglide.X() + 1, tglide.Y(), baseline], attr);

        attr = Type.copyAttributes(attributes, board.options, 'slopetriangle', 'toppoint');
        toppoint = board.create('point', [function () {
            return [glider.X(), glider.Y() + (glider.X() - tglide.X()) * tangent.getSlope()];
        }], attr);

        attr = Type.copyAttributes(attributes, board.options, 'slopetriangle');
        el = board.create('polygon', [tglide, glider, toppoint], attr);

        el.Value = priv.Value;
        el.tangent = tangent;
        el._isPrivateTangent = isPrivateTangent;

        attr = Type.copyAttributes(attributes, board.options, 'slopetriangle', 'label');
        label = board.create('text', [
            function () { return glider.X() + 0.1; },
            function () { return (glider.Y() + toppoint.Y()) * 0.5; },
            function () { return ''; }
        ], attr);

        label._setText(function () { return el.Value().toFixed(label.visProp.digits); });
        label.prepareUpdate().update().updateRenderer();

        /**
         * The glider the slope triangle is bound to.
         *
         * @property glider
         * @type JXG.Point
         * @private
         */
        el.glider = glider;

        /**
         * The base point defining - together with the glider - the horizontal side of the slope triangle
         *
         * @property basepoint
         * @type JXG.Point
         * @private
         */
        el.basepoint = basepoint;

        /**
         * The baseline the glider is bound to.
         *
         * @property baseline
         * @type JXG.Line
         * @private
         */
        el.baseline = baseline;

        /**
         * Third point of the triangle, lying on the tangent
         *
         * @property toppoint
         * @type JXG.Point
         * @private
         */
        el.toppoint = toppoint;

        /**
         * Slope triangle label
         *
         * @property label
         * @type JXG.Text
         * @private
         */
        el.label = label;

        el.methodMap = JXG.deepCopy(el.methodMap, {
            tangent: 'tangent',
            glider: 'glider',
            basepoint: 'basepoint',
            baseline: 'baseline',
            toppoint: 'toppoint',
            label: 'label',
            Value: 'Value',
            V: 'Value'
        });

        el.remove = priv.removeSlopeTriangle;

        return el;
    };

    JXG.registerElement('slopetriangle', JXG.createSlopeTriangle);

    return {
        createSlopeTriangle: JXG.createSlopeTriangle
    };
});
