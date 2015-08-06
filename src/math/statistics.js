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
 utils/type
 */

define(['jxg', 'math/math', 'utils/type'], function (JXG, Mat, Type) {

    "use strict";

    /**
     * Functions for mathematical statistics. Most functions are like in the statistics package R.
     * 
     * @class JXG.Math.Statistics
     */
    Mat.Statistics = {
        /**
         * Sums up all elements of the given array.
         * 
         * @method sum
         * @param {Array} arr An array of numbers.
         * @return {Number}
         */
        sum: function (arr) {
            var i,
                len = arr.length,
                res = 0;

            for (i = 0; i < len; i++) {
                res += arr[i];
            }
            return res;
        },

        /**
         * Multiplies all elements of the given array.
         * 
         * @method prod
         * @param {Array} arr An array of numbers.
         * @return {Number}
         * @memberof JXG.Math.Statistics
         */
        prod: function (arr) {
            var i,
                len = arr.length,
                res = 1;

            for (i = 0; i < len; i++) {
                res *= arr[i];
            }
            return res;
        },

        /**
         * Determines the mean value of the values given in an array.
         * 
         * @method mean
         * @param {Array} arr
         * @return {Number}
         * @memberof JXG.Math.Statistics
         */
        mean: function (arr) {
            if (arr.length > 0) {
                return this.sum(arr) / arr.length;
            }

            return 0.0;
        },

        /**
         * The median of a finite set of values is the value that divides the set
         * into two equal sized subsets.
         * 
         * @method median
         * @param {Array} arr The set of values.
         * @return {Number}
         * @memberof JXG.Math.Statistics
         */
        median: function (arr) {
            var tmp, len;

            if (arr.length > 0) {
                tmp = arr.slice(0);
                tmp.sort(function (a, b) {
                    return a - b;
                });
                len = tmp.length;

                if (len % 2 === 1) {
                    return tmp[parseInt(len * 0.5, 10)];
                }

                return (tmp[len * 0.5 - 1] + tmp[len * 0.5]) * 0.5;
            }

            return 0.0;
        },

        /**
         * Bias-corrected sample variance. A variance is a measure of how far a
         * set of numbers are spread out from each other.
         * 
         * @method variance
         * @param {Array} arr
         * @return {Number}
         * @memberof JXG.Math.Statistics
         */
        variance: function (arr) {
            var m, res, i, len = arr.length;

            if (len > 1) {
                m = this.mean(arr);
                res = 0;
                for (i = 0; i < len; i++) {
                    res += (arr[i] - m) * (arr[i] - m);
                }
                return res / (arr.length - 1);
            }

            return 0.0;
        },

        /**
         * Determines the <strong>s</strong>tandard <strong>d</strong>eviation which shows how much
         * variation there is from the average value of a set of numbers.
         * 
         * @method sd
         * @param {Array} arr
         * @return {Number}
         * @memberof JXG.Math.Statistics
         */
        sd: function (arr) {
            return Math.sqrt(this.variance(arr));
        },

        /**
         * Weighted mean value is basically the same as {@link JXG.Math.Statistics#mean} but here the values
         * are weighted, i.e. multiplied with another value called <em>weight</em>. The weight values are given
         * as a second array with the same length as the value array..
         * 
         * @method weightedMean
         * @throws {Error} If the dimensions of the arrays don't match.
         * @param {Array} arr Set of alues.
         * @param {Array} w Weight values.
         * @return {Number}
         * @memberof JXG.Math.Statistics
         */
        weightedMean: function (arr, w) {
            if (arr.length !== w.length) {
                throw new Error('JSXGraph error (Math.Statistics.weightedMean): Array dimension mismatch.');
            }

            if (arr.length > 0) {
                return this.mean(this.multiply(arr, w));
            }

            return 0.0;
        },

        /**
         * Extracts the maximum value from the array.
         * 
         * @method max
         * @param {Array} arr
         * @return {Number} The highest number from the array. It returns <tt>NaN</tt> if not every element could be
         * interpreted as a number and <tt>-Infinity</tt> if an empty array is given or no element could be interpreted
         * as a number.
         * @memberof JXG.Math.Statistics
         */
        max: function (arr) {
            return Math.max.apply(this, arr);
        },

        /**
         * Extracts the minimum value from the array.
         * 
         * @method min
         * @param {Array} arr
         * @return {Number} The lowest number from the array. It returns <tt>NaN</tt> if not every element could be
         * interpreted as a number and <tt>Infinity</tt> if an empty array is given or no element could be interpreted
         * as a number.
         * @memberof JXG.Math.Statistics
         */
        min: function (arr) {
            return Math.min.apply(this, arr);
        },

        /**
         * Determines the lowest and the highest value from the given array.
         * 
         * @method range
         * @param {Array} arr
         * @return {Array} The minimum value as the first and the maximum value as the second value.
         * @memberof JXG.Math.Statistics
         */
        range: function (arr) {
            return [this.min(arr), this.max(arr)];
        },

        /**
         * Determines the absolute value of every given value.
         * 
         * @method abs
         * @param {Array|Number} arr
         * @return {Array|Number}
         * @memberof JXG.Math.Statistics
         */
        abs: function (arr) {
            var i, len, res;

            if (Type.isArray(arr)) {
                len = arr.length;
                res = [];

                for (i = 0; i < len; i++) {
                    res[i] = Math.abs(arr[i]);
                }
            } else {
                res = Math.abs(arr);
            }

            return res;
        },

        /**
         * Adds up two (sequences of) values. If one value is an array and the other one is a number the number
         * is added to every element of the array. If two arrays are given and the lengths don't match the shortest
         * length is taken.
         * 
         * @method add
         * @param {Array|Number} arr1
         * @param {Array|Number} arr2
         * @return {Array|Number}
         * @memberof JXG.Math.Statistics
         */
        add: function (arr1, arr2) {
            var i, len, res = [];

            arr1 = Type.evalSlider(arr1);
            arr2 = Type.evalSlider(arr2);

            if (Type.isArray(arr1) && Type.isNumber(arr2)) {
                len = arr1.length;

                for (i = 0; i < len; i++) {
                    res[i] = arr1[i] + arr2;
                }
            } else if (Type.isNumber(arr1) && Type.isArray(arr2)) {
                len = arr2.length;

                for (i = 0; i < len; i++) {
                    res[i] = arr1 + arr2[i];
                }
            } else if (Type.isArray(arr1) && Type.isArray(arr2)) {
                len = Math.min(arr1.length, arr2.length);

                for (i = 0; i < len; i++) {
                    res[i] = arr1[i] + arr2[i];
                }
            } else {
                res = arr1 + arr2;
            }

            return res;
        },

        /**
         * Divides two (sequences of) values. If two arrays are given and the lengths don't match the shortest length
         * is taken.
         * 
         * @method div
         * @param {Array|Number} arr1 Dividend
         * @param {Array|Number} arr2 Divisor
         * @return {Array|Number}
         * @memberof JXG.Math.Statistics
         */
        div: function (arr1, arr2) {
            var i, len, res = [];

            arr1 = Type.evalSlider(arr1);
            arr2 = Type.evalSlider(arr2);

            if (Type.isArray(arr1) && Type.isNumber(arr2)) {
                len = arr1.length;

                for (i = 0; i < len; i++) {
                    res[i] = arr1[i] / arr2;
                }
            } else if (Type.isNumber(arr1) && Type.isArray(arr2)) {
                len = arr2.length;

                for (i = 0; i < len; i++) {
                    res[i] = arr1 / arr2[i];
                }
            } else if (Type.isArray(arr1) && Type.isArray(arr2)) {
                len = Math.min(arr1.length, arr2.length);

                for (i = 0; i < len; i++) {
                    res[i] = arr1[i] / arr2[i];
                }
            } else {
                res = arr1 / arr2;
            }

            return res;
        },

        /**
         * Use {@link JXG.Math.Statistics#div} instead.
         * @method divide
         * @deprecated 
         * @memberof JXG.Math.Statistics
         */
        divide: function () {
            JXG.deprecated('Statistics.divide()', 'Statistics.div()');
            Mat.Statistics.div.apply(Mat.Statistics, arguments);
        },

        /**
         * Divides two (sequences of) values and returns the remainder. If two arrays are given and the lengths don't
         * match the shortest length is taken.
         * 
         * @method mod
         * @param {Array|Number} arr1 Dividend
         * @param {Array|Number} arr2 Divisor
         * @param {Boolean} [math=false] Mathematical mod or symmetric mod? Default is symmetric, the JavaScript <tt>%</tt> operator.
         * @return {Array|Number}
         * @memberof JXG.Math.Statistics
         */
        mod: function (arr1, arr2, math) {
            var i, len, res = [], mod = function (a, m) {
                return a % m;
            };

            math = Type.def(math, false);

            if (math) {
                mod = Mat.mod;
            }

            arr1 = Type.evalSlider(arr1);
            arr2 = Type.evalSlider(arr2);

            if (Type.isArray(arr1) && Type.isNumber(arr2)) {
                len = arr1.length;

                for (i = 0; i < len; i++) {
                    res[i] = mod(arr1[i], arr2);
                }
            } else if (Type.isNumber(arr1) && Type.isArray(arr2)) {
                len = arr2.length;

                for (i = 0; i < len; i++) {
                    res[i] = mod(arr1, arr2[i]);
                }
            } else if (Type.isArray(arr1) && Type.isArray(arr2)) {
                len = Math.min(arr1.length, arr2.length);

                for (i = 0; i < len; i++) {
                    res[i] = mod(arr1[i], arr2[i]);
                }
            } else {
                res = mod(arr1, arr2);
            }

            return res;
        },

        /**
         * Multiplies two (sequences of) values. If one value is an array and the other one is a number the number
         * is multiplied to every element of the array. If two arrays are given and the lengths don't match the shortest
         * length is taken.
         * 
         * @method multiply
         * @param {Array|Number} arr1
         * @param {Array|Number} arr2
         * @return {Array|Number}
         * @memberof JXG.Math.Statistics
         */
        multiply: function (arr1, arr2) {
            var i, len, res = [];

            arr1 = Type.evalSlider(arr1);
            arr2 = Type.evalSlider(arr2);

            if (Type.isArray(arr1) && Type.isNumber(arr2)) {
                len = arr1.length;

                for (i = 0; i < len; i++) {
                    res[i] = arr1[i] * arr2;
                }
            } else if (Type.isNumber(arr1) && Type.isArray(arr2)) {
                len = arr2.length;

                for (i = 0; i < len; i++) {
                    res[i] = arr1 * arr2[i];
                }
            } else if (Type.isArray(arr1) && Type.isArray(arr2)) {
                len = Math.min(arr1.length, arr2.length);

                for (i = 0; i < len; i++) {
                    res[i] = arr1[i] * arr2[i];
                }
            } else {
                res = arr1 * arr2;
            }

            return res;
        },

        /**
         * Subtracts two (sequences of) values. If two arrays are given and the lengths don't match the shortest
         * length is taken.
         * 
         * @method subtract
         * @param {Array|Number} arr1 Minuend
         * @param {Array|Number} arr2 Subtrahend
         * @return {Array|Number}
         * @memberof JXG.Math.Statistics
         */
        subtract: function (arr1, arr2) {
            var i, len, res = [];

            arr1 = Type.evalSlider(arr1);
            arr2 = Type.evalSlider(arr2);

            if (Type.isArray(arr1) && Type.isNumber(arr2)) {
                len = arr1.length;

                for (i = 0; i < len; i++) {
                    res[i] = arr1[i] - arr2;
                }
            } else if (Type.isNumber(arr1) && Type.isArray(arr2)) {
                len = arr2.length;

                for (i = 0; i < len; i++) {
                    res[i] = arr1 - arr2[i];
                }
            } else if (Type.isArray(arr1) && Type.isArray(arr2)) {
                len = Math.min(arr1.length, arr2.length);

                for (i = 0; i < len; i++) {
                    res[i] = arr1[i] - arr2[i];
                }
            } else {
                res = arr1 - arr2;
            }

            return res;
        },

        /**
         * The Theil-Sen estimator can be used to determine a more robust linear regression of a set of sample
         * points than least squares regression in {@link JXG.Math.Numerics.regressionPolynomial}.
         * 
         * @method TheilSenRegression
         * @param {Array} coords Array of {@link JXG.Coords}.
         * @return {Array} The stdform of the regression line.
         * @memberof JXG.Math.Statistics
         */
        TheilSenRegression: function (coords) {
            var i, j,
                slopes = [],
                tmpslopes = [],
                yintercepts = [];

            for (i = 0; i < coords.length; i++) {
                tmpslopes.length = 0;

                for (j = 0; j < coords.length; j++) {
                    if (Math.abs(coords[j].usrCoords[1] - coords[i].usrCoords[1]) > Mat.eps) {
                        tmpslopes[j] = (coords[j].usrCoords[2] - coords[i].usrCoords[2]) /
                            (coords[j].usrCoords[1] - coords[i].usrCoords[1]);
                    }
                }

                slopes[i] = this.median(tmpslopes);
                yintercepts.push(coords[i].usrCoords[2] - slopes[i] * coords[i].usrCoords[1]);
            }

            return [this.median(yintercepts), this.median(slopes), -1];
        }
    };

    return Mat.Statistics;
});
