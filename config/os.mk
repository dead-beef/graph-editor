MV = mv -f
RM = rm -rfv
CP = cp -f
#CPDIST = cp -f
CPDIST = ln -f
MKDIR = mkdir -p
ECHO = echo
CAT = cat
RESET_MAKE := env -u MAKELEVEL -u MAKEFILES $(MAKE)

#VER := $(shell ver)
#ifeq "$(findstring Windows, $(VER))" "Windows"
#	MV = ren
#	RM = del /f /s
#	CP = copy
#	MKDIR = mkdir
#	CAT = type
#endif
