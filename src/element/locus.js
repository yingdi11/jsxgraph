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
 jxg
 math/math
 math/geometry
 math/numerics
 math/statistics
 math/symbolic
 base/composition
 base/coords
 base/constants
 utils/type
 elements:
 line
 circle
 transform
 point
 glider
 text
 curve
 */

define([
    'jxg', 'math/symbolic', 'utils/type', 'base/constants', 'base/curve'
], function (JXG, Symbolic, Type, Const, Curve) {

    "use strict";

    /**
     * The locus element is used to visualize the curve a given point describes.
     *
     * @pseudo
     * @constructor
     * @class Locus
     * @type JXG.Curve
     * @extends JXG.Curve
     * @throws {Error} If the element cannot be constructed with the given parent objects an exception is thrown.
     * @param {JXG.Point} p The constructed curve is the geometric locus of the given point.
     * @example
     *     // This examples needs JXG.Server up and running, otherwise it won't work.
     *     p1 = board.create('point', [0, 0]);
     *     p2 = board.create('point', [6, -1]);
     *     c1 = board.create('circle', [p1, 2]);
     *     c2 = board.create('circle', [p2, 1.5]);
     *     g1 = board.create('glider', [6, 3, c1]);
     *     c3 = board.create('circle', [g1, 4]);
     *     g2 = board.create('intersection', [c2,c3,0]);
     *     m1 = board.create('midpoint', [g1,g2]);
     *     loc = board.create('locus', [m1], {strokeColor: 'red'});
     * <div id="d45d7188-6624-4d6e-bebb-1efa2a305c8a" style="width: 400px; height: 400px;"></div>
     * <script type="text/javascript">
     * (function(){
     *  board = JXG.JSXGraph.initBoard('d45d7188-6624-4d6e-bebb-1efa2a305c8a', {boundingbox:[-4, 6, 10, -6], axis: true, grid: false, keepaspectratio: true});
     *  p1 = board.create('point', [0, 0]);
     *  p2 = board.create('point', [6, -1]);
     *  c1 = board.create('circle', [p1, 2]);
     *  c2 = board.create('circle', [p2, 1.5]);
     *  g1 = board.create('glider', [6, 3, c1]);
     *  c3 = board.create('circle', [g1, 4]);
     *  g2 = board.create('intersection', [c2,c3,0]);
     *  m1 = board.create('midpoint', [g1,g2]);
     *  loc = board.create('locus', [m1], {strokeColor: 'red'});
     * })();
     * </script>
     */
    JXG.createLocus = function (board, parents, attributes) {
        var c, p;

        if (Type.isArray(parents) && parents.length === 1 && Type.isPoint(parents[0])) {
            p = parents[0];
        } else {
            throw new Error("JSXGraph: Can't create locus with parent of type other than point." +
                "\nPossible parent types: [point]");
        }

        c = board.create('curve', [[null], [null]], attributes);
        c.dontCallServer = false;

        c.elType = 'locus';
        c.setParents([p.id]);

        /**
         * should be documented in JXG.Curve
         * @ignore
         */
        c.updateDataArray = function () {
            var spe, cb, data;

            if (c.board.mode > 0) {
                return;
            }

            spe = Symbolic.generatePolynomials(board, p, true).join('|');
            if (spe === c.spe) {
                return;
            }

            c.spe = spe;

            cb = function (x, y, eq, t) {
                c.dataX = x;
                c.dataY = y;

                /**
                 * The implicit definition of the locus.
                 * @memberOf Locus.prototype
                 * @property eq
                 * @type String
                 */
                c.eq = eq;

                /**
                 * The time it took to calculate the locus
                 * @memberOf Locus.prototype
                 * @property ctime
                 * @type Number
                 */
                c.ctime = t;

                // convert equation and use it to build a generatePolynomial-method
                c.generatePolynomial = (function (equations) {
                    return function (point) {
                        var i,
                            x = '(' + point.symbolic.x + ')',
                            y = '(' + point.symbolic.y + ')',
                            res = [];

                        for (i = 0; i < equations.length; i++) {
                            res[i] = equations[i].replace(/\*\*/g, '^').replace(/x/g, x).replace(/y/g, y);
                        }

                        return res;
                    };
                }(eq));
            };
            data = Symbolic.geometricLocusByGroebnerBase(board, p, cb);

            cb(data.datax, data.datay, data.polynomial, data.exectime);
        };
        return c;
    };

    JXG.registerElement('locus', JXG.createLocus);

    return {
        createLocus: JXG.createLocus
    };
});
