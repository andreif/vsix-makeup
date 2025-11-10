.PHONY: install compile watch clean package dev test

install:
	mise exec -- npm install

compile:
	mise exec -- npm run compile

watch:
	mise exec -- npm run watch

clean: clean-package
	rm -fr out node_modules

clean-package:
	rm -f *.vsix

package: compile clean-package
	mise exec -- npx --yes @vscode/vsce package --allow-missing-repository --no-dependencies

package-install: package
	cursor --install-extension *.vsix

dev:
	mise exec -- npm run watch

test: compile
	echo "No tests configured yet"
