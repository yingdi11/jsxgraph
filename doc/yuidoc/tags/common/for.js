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

function forEach(what, json, handler) {
    var itemName, itemData,
        items = json[what] || {};

    for (itemName in items) {
        if (items.hasOwnProperty(itemName)) {
            itemData = items[itemName];
            if (handler(json, itemData)) {
                break;
            }
        }
    }
}

function forEachClass(json, handler) {
    forEach('classes', json, handler);
}

function forEachModule(json, handler) {
    forEach('modules', json, handler);
}

function forEachElement(json, handler) {
    forEach('elements', json, handler);
}

function forEachClassItem(json, handler) {
    var i, itemData,
        items = json.classitems;

    for (i = 0; i < items.length; ++i) {
        itemData = items[i];
        if (handler(json, itemData)) {
            break;
        }
    }
}

function forEachItem(json, handler) {
    forEachModule(json, handler);
    forEachClass(json, handler);
    forEachElement(json, handler);
    forEachClassItem(json, handler);
}

module.exports = {
    eachClass: forEachClass,
    eachElement: forEachElement,
    eachModule: forEachModule,
    eachClassItem: forEachClassItem,
    eachItem: forEachItem
};
