/*
 Copyright 2015
 Matthias Ehmann,
 Michael Gerhaeuser,
 Carsten Miller,
 Alfred Wassermann

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

var _for = require('./common/for'),
    _resolve = require('./common/resolve');


function replaceReference(json, item, name) {
    var ref = _resolve.reference(json, item, name);

    return ref.crossLink;
}

function processJSON(json) {
    _for.eachItem(json, function (json, item) {
        var replacer = function (match, substring) {
            return replaceReference(json, item, substring);
        };

        if (item.description) {
            item.description = item.description.replace(/{@link\s+(.*?)}/g, replacer);
        }
    });
}

module.exports = {
    process: processJSON
};