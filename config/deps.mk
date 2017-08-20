$(TEST_TARGETS): all

ifneq "$(strip $(LIBRARY))" ""
$(TEST_TARGETS): $(LIB_JS)
endif
