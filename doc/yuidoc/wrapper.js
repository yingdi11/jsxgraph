#!/usr/bin/env node

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

var seeTags = require('./tags/see');

function postProcess(json) {
    var className, classMeta;

    seeTags.process(json);

    for (className in json.classes) {
        if (json.classes.hasOwnProperty(className)) {
            classMeta = json.classes[className];
            if (classMeta.pseudo) {
                console.log(className, 'is an element');
            }
        }
    }
}

function run() {
    var yuidoc, json, builder,
        Y = require('yuidocjs'),
        options = Y.Options(Y.Array(process.argv, 2));

    options = Y.Project.init(options);

    if (options.server) {
        Y.Server.start(options);
    } else {
        yuidoc = (new Y.YUIDoc(options));

        Y.DocParser.DIGESTERS['pseudo'] = function (tagname, value, target, block) {
            target.pseudo = true;
        };

        Y.DocParser.DIGESTERS['see'] = seeTags.digest;

        json = yuidoc.run();

        postProcess(json);

        options = Y.Project.mix(json, options);

        if (!options.parseOnly) {
            builder = new Y.DocBuilder(options, json);
            builder.compile();
        }
    }
}

run();