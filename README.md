# MakeUp - Makefile Runner

Execute Makefile targets with a click in Cursor/VS Code.

## Features

- Automatically discovers Makefiles in your workspace
- Displays all make targets in a sidebar view
- Click any target to run it in the terminal
- Shows target descriptions from comments
- Auto-refreshes when Makefiles change

## Setup

This project uses mise for Node.js version management (Node 22).

1. Install mise: https://mise.jdx.dev/
2. Run `mise install` to set up Node 22 (reads from `.tool-versions`)
3. Run `make install` to install dependencies
4. Run `make compile` to build the extension
5. Press F5 in Cursor to debug the extension

## Make Targets

- `make install` - Install npm dependencies
- `make compile` - Compile TypeScript to JavaScript
- `make watch` - Watch mode for development
- `make dev` - Alias for watch
- `make clean` - Remove build artifacts
- `make package` - Package extension as .vsix

## Usage

1. Open a workspace containing a Makefile
2. Find the "Make Targets" view in the Explorer sidebar
3. Click on any target to execute it
4. Use the refresh button to reload targets

