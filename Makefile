define rwildcard
	$(sort $(wildcard $1$2)) \
	$(foreach d,$(sort $(wildcard $1*)),$(call rwildcard,$d/,$2))
endef

BUILD_DIR := build
DIST_DIR := dist
DOC_DIR := docs
DIRS := $(BUILD_DIR) $(DIST_DIR)/js $(DIST_DIR)/css

NAME := graph-editor

JS_FILES := src/umd/umd-start.js \
            src/main.js \
            $(sort $(wildcard src/js/util/*.js)) \
            $(sort $(wildcard src/js/path/*.js)) \
            $(sort $(wildcard src/js/shape/*.js)) \
            $(sort $(filter-out %/common.js,$(wildcard src/js/*.js))) \
            src/umd/umd-end.js

CSS_MAIN := src/css/$(NAME).scss
CSS_DARK_MAIN := src/css/$(NAME)-dark.scss
CSS_DEPS := $(BUILD_DIR)/deps.mk

DIST_FILES := $(DIST_DIR)/js/$(NAME).js \
              $(DIST_DIR)/js/$(NAME).min.js \
              $(DIST_DIR)/css/$(NAME).scss \
              $(DIST_DIR)/css/$(NAME).css \
              $(DIST_DIR)/css/$(NAME).min.css \
              $(DIST_DIR)/css/$(NAME)-dark.scss \
              $(DIST_DIR)/css/$(NAME)-dark.css \
              $(DIST_DIR)/css/$(NAME)-dark.min.css

.PHONY: all clean install rebuild lint docs watch test test-watch

all: $(BUILD_DIR)/install.touch $(DIST_FILES)

install:
	npm install

watch:
	chokidar 'src/**/*' package.json Makefile -i '**/.*' -c 'env -u MAKEFILES make'

clean:
	rm -rf $(BUILD_DIR) $(DIST_DIR)

rebuild:
	make clean
	make

test: all
	karma start karma.conf.js --single-run

test-watch:
	karma start karma.conf.js

lint:
	eslint src

docs:
	rm -rf $(DOC_DIR)/*
	jsdoc -c jsdoc.conf.js
	mv $(DOC_DIR)/$(NAME)/*/* $(DOC_DIR)/
	rm -rf $(DOC_DIR)/$(NAME)

$(DIST_DIR)/js/$(NAME).js: $(JS_FILES) | $(DIST_DIR)/js
	eslint $?
	cat $(JS_FILES) >$@

$(DIST_DIR)/css/$(NAME).css: $(CSS_MAIN) | $(BUILD_DIR) $(DIST_DIR)/css
	node-sass $< >$(BUILD_DIR)/tmp.css
	postcss $(BUILD_DIR)/tmp.css --use autoprefixer --no-map -o $@

$(DIST_DIR)/css/$(NAME).scss: $(CSS_MAIN) | $(DIST_DIR)/css
	cp -f $< $@

$(DIST_DIR)/css/$(NAME)-dark.css: $(CSS_DARK_MAIN) | $(BUILD_DIR) $(DIST_DIR)/css
	node-sass $< >$(BUILD_DIR)/tmp.css
	postcss $(BUILD_DIR)/tmp.css --use autoprefixer --no-map -o $@

$(DIST_DIR)/css/$(NAME)-dark.scss: $(CSS_DARK_MAIN) | $(DIST_DIR)/css
	cp -f $< $@

%.min.js: %.js
	uglifyjs $< -c -m -o $@

%.min.css: %.css
	csso -i $< -o $@

$(DIRS):
	mkdir -p $@

$(CSS_DEPS): $(CSS_MAIN) $(CSS_DARK_MAIN) | $(BUILD_DIR)
	sass-makedepend -m -r -p $(DIST_DIR)/css/ $^ >$(BUILD_DIR)/tmp.mk
	mv -f $(BUILD_DIR)/tmp.mk $@

$(BUILD_DIR)/install.touch: package.json | $(BUILD_DIR)
	npm install
	touch $@

-include $(CSS_DEPS)
