.PHONY: install compile watch clean package dev test

install:
	mise exec -- npm install

compile:
	mise exec -- npm run compile

watch:
	mise exec -- npm run watch

clean:
	rm -rf out node_modules *.vsix

package: compile package-clean
	mise exec -- npx --yes @vscode/vsce package --allow-missing-repository --no-dependencies

package-clean:
	rm -f *.vsix

package-install: package
	cursor --install-extension *.vsix

dev:
	mise exec -- npm run watch

test: compile
	echo "No tests configured yet"
