LINT_ENABLED = 1
LIBRARY = 1

APP_NAME = graph-editor

APP_DIR = src
BUILD_DIR = build
MIN_DIR := $(BUILD_DIR)/min
DIST_DIR = dist

LIB_NAME = vendor
LIB_FONT_DIRS =
LIB_FONT_DIST_DIRS =
LIB_FONT_TYPES = %.otf %.eot %.svg %.ttf %.woff %.woff2

HTML_DIRS =
HTML_FILES =

JS_DIRS := $(APP_DIR)/js
JS_IGNORE = %.test.js

JS_FILES := $(APP_DIR)/main.js
JS_FILES += $(foreach d,$(JS_DIRS),$(call rwildcard,$d/,*.js))

CSS_TYPE = scss
CSS_DIRS = $(APP_DIR)/css
CSS_FILES := $(APP_DIR)/css/$(APP_NAME).scss
LIB_CSS_FILES =
LIB_CSS_DEPS =

COPY_DIRS := $(APP_DIR)
COPY_FILE_TYPES = %.jpg %.jpe %.jpeg %.png %.gif %.svg %.ico %.html \
                  %.scss
COPY_FILE_TYPES_WILDCARD := $(subst %,*,$(COPY_FILE_TYPES))

COPY_FILES =
COPY_FILES += $(foreach d,$(COPY_DIRS),\
                $(call rwildcards,$d/,$(COPY_FILE_TYPES_WILDCARD)))

NPM_SCRIPTS =

SERVER_IP := 127.0.0.1
SERVER_PORT := 57005
