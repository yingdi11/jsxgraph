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
    _is = require('./common/is');

function digest(tagname, value, target, block) {
    target.references = target.references || [];
    target.references.push(value);
}


function findMemberOfClass(json, className, propertyName) {
    var member;

    _for.eachClassItem(json, function (json, item) {
        var itemName = item.name,
            itemClass = item['class'];

        if (itemName === propertyName && itemClass === className) {
            member = item;
            return true;
        }
    });

    return member;
}

function resolveAbsoluteReference(json, className, propertyName) {
    var referenceData, link,
        member = findMemberOfClass(json, className, propertyName);

    if (member) {
        link = '../classes/' + member['class'] + '.html';
        link += '#' + member.itemtype + '_' + member.name;

        referenceData = {
            name: member['class'] + '#' + member.name,
            link: link,
            resolved: true
        };
    } else {
        referenceData = {
            name: className + '#' + propertyName,
            resolved: false
        };
    }

    return referenceData;
}

function resolveRelativeReference(json, item, reference) {
    return resolveAbsoluteReference(json, item['class'], reference);
}

function resolveClassOrModule(json, reference) {
    var referenceData, folder;

    if (_is.aClass(json, reference)) {
        folder = 'classes';
    }

    if (_is.aModule(json, reference)) {
        folder = 'modules';
    }

    if (folder) {
        referenceData = {
            name: reference,
            link: '../' + folder + '/' + reference + '.html',
            resolved: true
        };

        return referenceData;
    } else {
        referenceData = {
            name: reference,
            resolved: false
        };

        return referenceData;
    }
}

function resolveReference(json, item, reference) {
    var split = reference.split('#'),
        isAbsoluteReference = (split.length > 1);

    if (isAbsoluteReference) {
        return resolveAbsoluteReference(json, split[0], split[1]);
    } else {
        if (_is.aRelativeReference(json, reference)) {
            return resolveRelativeReference(json, item, reference);
        } else {
            return resolveClassOrModule(json, reference);
        }
    }
}

function processReferences(json, itemData) {
    var i, references;

    if (itemData.hasOwnProperty('references')) {
        references = itemData.references;
        for (i = 0; i < references.length; ++i) {
            references[i] = resolveReference(json, itemData, references[i]);
        }
    }
}

function processJSON(json) {
    _for.eachItem(json, processReferences);
}

module.exports = {
    process: processJSON,
    digest: digest
};