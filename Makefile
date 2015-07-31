.PHONY: test test-server

# build tools
REQUIREJS=./node_modules/.bin/r.js
UGLIFYJS=./node_modules/.bin/uglifyjs
JSDOC=./node_modules/.bin/yuidoc
LINT=./node_modules/.bin/jslint
HINT=./node_modules/.bin/jshint
JSTESTDRIVER=java -jar ./node_modules/jstestdriver/lib/jstestdriver.jar 

# general tools
CP=cp
CAT=cat
MKDIR=mkdir
RM=rm
CD=cd
ZIP=zip
UNZIP=unzip

# directories
OUTPUT=distrib
BUILD=build
TMP=tmp
BUILDBIN=$(BUILD)/bin
BUILDREADERS=$(BUILDBIN)/readers
JSDOCPLG=doc/jsdoc-tk/plugins
JSDOCTPL=doc/jsdoc-tk/template
JSDOCTPLSTAT=$(JSDOCTPL)/static

# flags
MKDIRFLAGS=-p
RMFLAGS=-rf
#JSDOCFLAGS=-p --destination $(TMP)/docs
JSDOCFLAGS=--outdir $(TMP)/docs

ZIPFLAGS=-r
JSTESTPORT=4224
JSTESTSERVER=localhost:4224
JSTESTFLAGS=--reset --captureConsole --tests all

# filelists - required for docs, linters, and to build the readers
FILELIST=$(shell cat src/loadjsxgraph.js | grep "baseFiles\s*=\s*'\(\w*,\)\+" | awk -F \' '{ print $$2 }' | sed 's/,/.js src\//g')

# Lintlist - jessiecode.js is developed externally (github:jsxgraph/jessiecode) and won't be linted in here
LINTLIST=$(shell echo $(FILELIST) | sed 's/src\/parser\/jessiecode\.js//')
LINTFLAGS=--bitwise true --white true

READERSOUT=build/bin/readers/geonext.min.js build/bin/readers/geogebra.min.js build/bin/readers/intergeo.min.js build/bin/readers/sketch.min.js

# rules
all: core core-min readers docs moodle

core:
	$(MKDIR) $(MKDIRFLAGS) $(BUILDBIN)
	$(REQUIREJS) -o $(BUILD)/core.build.json


core-min:
	$(MKDIR) $(MKDIRFLAGS) $(BUILDBIN)
	$(REQUIREJS) -o $(BUILD)/core.build.json optimize=uglify2 out=$(BUILDBIN)/jsxgraphcore-min.js;
	{ $(CAT) COPYRIGHT; $(CAT) $(BUILDBIN)/jsxgraphcore-min.js; } > $(BUILDBIN)/jsxgraphcore.min.js
	$(CP) $(BUILDBIN)/jsxgraphcore.min.js $(OUTPUT)/jsxgraphcore.js

core-amd:
	$(REQUIREJS) -o $(BUILD)/core-amd.build.json
	{ $(CAT) COPYRIGHT; $(CAT) $(BUILDBIN)/jsxgraphcore-amd.js; } > $(BUILDBIN)/jsxgraphcore.amd.js


release: core-min docs
	$(MKDIR) $(MKDIRFLAGS) $(TMP)
	$(MKDIR) $(MKDIRFLAGS) $(OUTPUT)
	$(CP) $(BUILDBIN)/jsxgraphcore.min.js $(TMP)/jsxgraphcore.js
	$(CP) $(BUILDBIN)/jsxgraphcore.js $(TMP)/jsxgraphsrc.js
	$(CP) $(OUTPUT)/docs.zip $(TMP)/docs.zip
	$(CP) distrib/jsxgraph.css $(TMP)/jsxgraph.css
	$(CP) -r src/themes $(TMP)/themes
	$(CP) README.md LICENSE.MIT LICENSE.LGPL $(TMP)/
	$(CD) $(TMP) && $(ZIP) $(ZIPFLAGS) jsxgraph.zip jsxgraph* themes/ docs.zip README.md LICENSE.*
	$(CP) $(TMP)/jsxgraph.zip $(OUTPUT)/jsxgraph.zip

	$(RM) $(RMFLAGS) tmp

docs: core core-min
	# set up tmp dir
	$(MKDIR) $(MKDIRFLAGS) $(TMP)
	$(MKDIR) $(MKDIRFLAGS) $(OUTPUT)

	# update template related files
	$(CP) distrib/jquery.min.js $(JSDOCTPLSTAT)/jquery.min.js
	$(CP) $(BUILDBIN)/jsxgraphcore.min.js $(JSDOCTPLSTAT)/jsxgraphcore.js
	$(CP) distrib/jsxgraph.css $(JSDOCTPLSTAT)/jsxgraph.css

	# update the plugin
	$(CP) $(JSDOCPLG)/*.js ./node_modules/jsdoc/plugins/

	# run node-jsdoc
	$(JSDOC) $(JSDOCFLAGS) src/
	#src/loadjsxgraph.js src/$(FILELIST).js

	# zip -r tmp/docs.zip tmp/docs/
	$(CD) $(TMP) && $(ZIP) $(ZIPFLAGS) docs.zip docs/
	$(CP) $(TMP)/docs.zip $(OUTPUT)/docs.zip

	$(RM) $(RMFLAGS) tmp
	
	# Test
	$(CD) $(OUTPUT) && $(UNZIP) -o docs.zip

moodle: core core-min $(READERSOUT) 
	$(MKDIR) $(MKDIRFLAGS) $(TMP)
	$(MKDIR) $(MKDIRFLAGS) $(TMP)/jsxgraph
	$(CP) $(BUILDBIN)/jsxgraphcore.min.js $(TMP)/jsxgraph/jsxgraphcore.js	
	$(CP) distrib/jsxgraph.css $(TMP)/jsxgraph/jsxgraph.css
	$(CP) plugins/moodle/moodle2/*.php $(TMP)/jsxgraph/
	$(CP) plugins/moodle/moodle2/styles.css $(TMP)/jsxgraph/
	$(CP) plugins/moodle/moodle2/readme.txt $(TMP)/jsxgraph/
	$(CP) -r plugins/moodle/moodle2/lang $(TMP)/jsxgraph/
	$(CP) $(BUILDREADERS)/* $(TMP)/jsxgraph/

	# zip -r tmp/jsxgraph.zip tmp/jsxgraph
	$(CD) $(TMP) && $(ZIP) $(ZIPFLAGS) jsxgraph_moodle.zip jsxgraph/
	$(CP) $(TMP)/jsxgraph_moodle.zip $(OUTPUT)/jsxgraph_moodle.zip

	$(RM) $(RMFLAGS) tmp

readers: $(READERSOUT) 
	$(MKDIR) $(MKDIRFLAGS) $(OUTPUT)
	$(CP) $(BUILDREADERS)/* $(OUTPUT)

build/bin/readers/%.min.js: src/reader/%.js
	$(MKDIR) $(MKDIRFLAGS) $(BUILDREADERS)
	{ $(CAT) COPYRIGHT; $(UGLIFYJS) $^; } > $@

compressor: core
	$(REQUIREJS) -o build/compressor.build.json
	{ $(CAT) JSXCompressor/COPYING; $(CAT) $(BUILDBIN)/jsxcompressor.js; } > JSXCompressor/jsxcompressor.min.js
	$(CP) $(BUILDBIN)/jsxgraphcore.js JSXCompressor/jsxgraphcore.js
	$(CP) distrib/jsxgraph.css JSXCompressor/jsxgraph.css

plot:
	$(MKDIR) $(MKDIRFLAGS) $(BUILDBIN)
	$(REQUIREJS) -o build/plot.build.json

hint:
	$(HINT) src/$(LINTLIST).js

lint:
	$(LINT) $(LINTFLAGS) src/$(LINTLIST).js

test-server:
	$(JSTESTDRIVER) --port $(JSTESTPORT)

test: core
	$(JSTESTDRIVER) $(JSTESTSERVER) $(JSTESTFLAGS) --basePath ./ --config test/jsTestDriver.conf
