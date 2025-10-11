.PHONY: install compile watch clean package dev test

install:
	npm install

compile:
	npm run compile

watch:
	npm run watch

clean:
	rm -rf out node_modules *.vsix

package:
	npm install -g @vscode/vsce
	vsce package

dev:
	npm run watch

test: compile
	echo "No tests configured yet"

