#--------

include config/common.mk

#--------

SASS = node-sass --include-path $(CSS_INCLUDE_PATH)
LINT = eslint
MINJS = uglifyjs
MINCSS = csso
WATCH = chokidar $(WATCH_FILES) -i '**/.*' -c

START = http-server -a $(SERVER_IP) -p $(SERVER_PORT) -c-1 $(DIST_DIR)
STOP = pkill -f http-server

TEST = karma start config/karma.conf.js --single-run
TEST_WATCH = karma start config/karma.conf.js
TEST_E2E = ./e2e-test

MAKE_VARS = config/make-vars.js
MAKE_VARS_CMD := node $(MAKE_VARS)

LINT_ENABLED = 1
LIBRARY =

LIB_JS_FILES =

#--------

include config/os.mk
include config/app.mk

VARS_FILE := $(BUILD_DIR)/vars.mk
-include $(VARS_FILE)

#--------

APP_OUT_JS_DIR := $(DIST_DIR)/js
APP_OUT_CSS_DIR := $(DIST_DIR)/css
APP_OUT_HTML_DIR := $(DIST_DIR)/tmpl
APP_OUT_FONT_DIR := $(DIST_DIR)/fonts

MAKEFILES := Makefile $(VARS_FILE) $(wildcard config/*.mk);

JS_FILES := $(call uniq,$(JS_FILES))
JS_FILES := $(filter-out $(JS_IGNORE),$(JS_FILES))
ifneq "$(strip $(JS_FILES))" ""
JS_FILES := $(APP_DIR)/umd/umd-start.js $(JS_FILES) $(APP_DIR)/umd/umd-end.js
endif

ifeq "$(strip $(CSS_TYPE))" "css"
	CSS_TYPE =
endif

ifeq "$(strip $(CSS_TYPE))" ""
CSS_FILES := $(CSS_FILES) $(foreach d,$(CSS_DIRS),\
                                    $(call rwildcard,$d/,*.css))
CSS_FILES := $(filter-out $(LIB_CSS_FILES) $(LIB_CSS_DEPS),$(CSS_FILES))
CSS_DEPS =
else
CSS_DEPS := $(CSS_FILES) $(foreach d,$(CSS_DIRS),\
                                     $(call rwildcards,$d/,*.css *.$(CSS_TYPE)))
CSS_DEPS := $(filter-out $(LIB_CSS_FILES) $(LIB_CSS_DEPS),$(CSS_DEPS))
CSS_INCLUDE_PATH := $(call join-with,:,$(CSS_DIRS) node_modules)
endif

LIB_FONT_TYPES_WILDCARD := $(subst %,*,$(LIB_FONT_TYPES))
LIB_FONTS :=
BUILD_FONTS :=

$(foreach \
    dirs,\
    $(join $(LIB_FONT_DIRS),$(addprefix -->,$(LIB_FONT_DIST_DIRS))),\
    $(eval $(call make-font-target,$(dirs)))\
)

ifneq "$(strip $(LIB_JS_FILES))" ""
LIB_JS := $(BUILD_DIR)/$(LIB_NAME).js
else
LIB_JS =
endif

ifneq "$(strip $(LIB_CSS_FILES))" ""
LIB_CSS := $(BUILD_DIR)/$(LIB_NAME).css
else
LIB_CSS =
endif

ifneq "$(strip $(JS_FILES))" ""
APP_JS := $(BUILD_DIR)/$(APP_NAME).js
else
APP_JS =
endif

ifneq "$(strip $(CSS_FILES))" ""
APP_CSS := $(BUILD_DIR)/$(APP_NAME).css
else
APP_CSS =
endif

ifneq "$(strip $(LIBRARY))" ""
BUILD_FILES := $(APP_JS) $(APP_CSS)
BUILD_FILES_MIN := $(BUILD_FILES:%.js=%.min.js)
BUILD_FILES_MIN := $(BUILD_FILES_MIN:%.css=%.min.css)

BUILD_FILES += $(BUILD_FILES_MIN)
BUILD_FILES_MIN := $(BUILD_FILES)
else
BUILD_FILES := $(LIB_JS) $(LIB_CSS) $(APP_JS) $(APP_CSS)
BUILD_FILES_MIN := $(BUILD_FILES:$(BUILD_DIR)%=$(MIN_DIR)%)
endif

BUILD_COPY := $(foreach p,$(COPY_FILES),$(p:$(APP_DIR)%=$(DIST_DIR)%))
BUILD_COPY_ALL := $(BUILD_FONTS) $(BUILD_COPY)

DIST_FILES:= $(BUILD_FILES:$(BUILD_DIR)%=$(DIST_DIR)%)

WATCH_FILES := '$(APP_DIR)/**/*' 'config/*' Makefile package.json

APP_OUT_DIRS := $(BUILD_DIR) $(DIST_DIR) $(MIN_DIR)

ifneq "$(strip $(filter %.js,$(DIST_FILES)))" ""
APP_OUT_DIRS += $(APP_OUT_JS_DIR)
endif

ifneq "$(strip $(filter %.css,$(DIST_FILES)))" ""
APP_OUT_DIRS += $(APP_OUT_CSS_DIR)
endif

ifeq "$(strip $(LIBRARY))" ""
ifneq "$(strip $(LIB_FONTS))" ""
APP_OUT_DIRS += $(APP_OUT_FONT_DIR)
endif
endif

VARS = MAKEFILES LIB_JS_FILES LIB_JS LIB_CSS LIB_CSS_FILES LIB_CSS_DEPS \
       LIB_FONTS JS_FILES CSS_FILES CSS_DEPS APP_JS APP_CSS \
       COPY_FILES BUILD_FILES BUILD_FILES_MIN BUILD_FONTS BUILD_COPY \
       CSS_INCLUDE_PATH DIST_FILES WATCH_FILES \
       TARGETS TEST_TARGETS LIST_TARGETS NPM_SCRIPTS LIST_NPM_SCRIPTS \
       APP_OUT_DIRS VARS_FILE

TARGETS = all min watch min-watch start stop rebuild clean \
          test test-watch test-e2e test-all install vars help
TEST_TARGETS := $(filter test%,$(TARGETS) $(NPM_SCRIPTS))

LIST_TARGETS := $(addprefix print-,$(TARGETS))

LIST_NPM_SCRIPTS := $(addprefix print-,$(NPM_SCRIPTS))

#--------

.DEFAULT_GOAL := all
.PHONY: $(TARGETS) $(LIST_TARGETS) $(NPM_SCRIPTS) $(LIST_NPM_SCRIPTS) $(VARS)

all: $(BUILD_FILES)

min: $(BUILD_FILES_MIN)

all min: $(BUILD_COPY_ALL) | $(APP_OUT_DIRS)
ifneq "$(strip $(APP_JS))" ""
	$(call prefix,[dist]     ,$(CPDIST) $(filter %.js,$^) $(APP_OUT_JS_DIR))
endif
ifneq "$(strip $(APP_CSS))" ""
	$(call prefix,[dist]     ,$(CPDIST) $(filter %.css,$^) $(APP_OUT_CSS_DIR))
endif

rebuild: clean all

rebuild-min: clean min

clean:
	$(call prefix,[clean]    ,$(RM) $(BUILD_DIR)/* $(DIST_DIR)/*)

watch:
	$(call prefix,[build]    ,-$(RESET_MAKE))
	$(call prefix,[watch]    ,$(WATCH) '$(RESET_MAKE)')

min-watch:
	$(call prefix,[build]    ,-$(RESET_MAKE) min)
	$(call prefix,[watch]    ,$(WATCH) '$(RESET_MAKE) min')

install::
	$(call prefix,[install]  ,npm install)

start: stop
	$(call prefix,[start]    ,$(START))

stop:
	$(call prefix,[stop]     ,-$(STOP))

test:
	$(call prefix,[test]     ,$(TEST))

test-watch:
	$(call prefix,[test]     ,$(TEST_WATCH))

test-e2e:
	$(call prefix,[test]     ,$(TEST_E2E))

test-all: test test-e2e

$(NPM_SCRIPTS):
	npm run $(subst -,:,$@) --silent

help: $(LIST_TARGETS) $(LIST_NPM_SCRIPTS)

#--------

$(LIST_TARGETS): print-targets-header
	@$(ECHO) '    ' $(@:print-%=%)

$(LIST_NPM_SCRIPTS): print-npm-header
	@$(ECHO) '    ' $(@:print-%=%)

print-npm-header:
	@$(ECHO) NPM scripts:

print-targets-header:
	@$(ECHO) Make targets:

#--------

node_modules:
	$(call prefix,[install]  ,$(MAKE) install)

$(APP_OUT_DIRS):
	$(call prefix,[mkdirs]   ,$(MKDIR) $@)

$(MIN_DIR)/%.css: $(BUILD_DIR)/%.css | $(MIN_DIR)
	$(call prefix,[min-css]  ,$(MINCSS) -i $< -o $@)

$(MIN_DIR)/%.js: $(BUILD_DIR)/%.js | $(MIN_DIR)
	$(call prefix,[min-js]   ,$(MINJS) $< -c -m >$@.tmp)
	$(call prefix,[min-js]   ,$(MV) $@.tmp $@)

$(BUILD_DIR)/%.min.css: $(BUILD_DIR)/%.css | $(MIN_DIR)
	$(call prefix,[min-css]  ,$(MINCSS) -i $< -o $@)

$(BUILD_DIR)/%.min.js: $(BUILD_DIR)/%.js | $(MIN_DIR)
	$(call prefix,[min-js]   ,$(MINJS) $< -c -m >$@.tmp)
	$(call prefix,[min-js]   ,$(MV) $@.tmp $@)

ifeq "$(CSS_TYPE)" "scss"

ifneq "$(strip $(LIB_CSS))" ""
$(LIB_CSS): $(LIB_CSS_FILES) $(LIB_CSS_DEPS) | $(BUILD_DIR)
	$(call prefix,[lib-css]  ,$(CAT) $(LIB_CSS_FILES) | $(SASS) >$@.tmp)
	$(call prefix,[lib-css]  ,$(MV) $@.tmp $@)
endif

ifneq "$(strip $(APP_CSS))" ""
$(APP_CSS): $(CSS_DEPS) | $(BUILD_DIR)
	$(call prefix,[sass]     ,$(CAT) $(CSS_FILES) | $(SASS) >$@.tmp)
	$(call prefix,[sass]     ,$(MV) $@.tmp $@)
endif

else ifeq "$(CSS_TYPE)" ""

ifneq "$(strip $(LIB_CSS))" ""
$(LIB_CSS): $(LIB_CSS_FILES) | $(BUILD_DIR)
	$(call prefix,[lib-css]  ,$(CAT) $^ >$@.tmp)
	$(call prefix,[lib-css]  ,$(MV) $@.tmp $@)
endif

ifneq "$(strip $(APP_CSS))" ""
$(APP_CSS): $(CSS_FILES) | $(BUILD_DIR)
	$(call prefix,[css-cat]  ,$(CAT) $^ >$@.tmp)
	$(call prefix,[css-cat]  ,$(MV) $@.tmp $@)
endif

else
$(error Unknown css type: $(CSS_TYPE))
endif

ifneq "$(strip $(LIB_JS))" ""
$(LIB_JS): $(LIB_JS_FILES) | $(BUILD_DIR)
	$(call prefix,[lib-js]   ,$(CAT) $^ >$@.tmp)
	$(call prefix,[lib-js]   ,$(MV) $@.tmp $@)
endif

ifneq "$(strip $(APP_JS))" ""
$(APP_JS): $(JS_FILES) | $(BUILD_DIR)
ifneq "$(strip $(LINT_ENABLED))" ""
	$(call prefix,[js-lint]  ,$(LINT) $?)
endif
	$(call prefix,[js-cat]   ,$(CAT) $^ >$@.tmp)
	$(call prefix,[js-cat]   ,$(MV) $@.tmp $@)
endif

$(eval $(call make-copy-target,$(BUILD_COPY),$(APP_DIR),$(DIST_DIR)))

#--------

ifneq "$(MAKECMDGOALS)" "install"
$(VARS_FILE): package.json config/make-vars.js config/override.js | $(BUILD_DIR) $(MAKE_VARS) node_modules
	$(call prefix,[vars]     ,$(MAKE_VARS_CMD) >$@.tmp)
	$(call prefix,[vars]     ,$(MV) $@.tmp $@)
endif

#--------

include config/deps.mk

#--------

$(VARS):
	@$(ECHO) "  " $@ = $($@)

vars: $(VARS)
