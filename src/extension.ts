import * as vscode from 'vscode';
import { MakeTargetsProvider } from './makeTargetsProvider';
import { MakefileCodeLensProvider } from './makefileCodeLens';
import { MakefileDecorationProvider } from './makefileDecorations';

export function activate(context: vscode.ExtensionContext) {
    const targetsProvider = new MakeTargetsProvider(context);
    const codeLensProvider = new MakefileCodeLensProvider();
    const decorationProvider = new MakefileDecorationProvider(context);

    vscode.window.registerTreeDataProvider('makeupTargets', targetsProvider);

    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            { pattern: '**/[Mm]akefile' },
            codeLensProvider
        )
    );

    const updateDecorations = (editor: vscode.TextEditor | undefined) => {
        if (editor) {
            decorationProvider.updateDecorations(editor);
        }
    };

    if (vscode.window.activeTextEditor) {
        updateDecorations(vscode.window.activeTextEditor);
    }

    vscode.window.onDidChangeActiveTextEditor(editor => {
        updateDecorations(editor);
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            updateDecorations(editor);
        }
    }, null, context.subscriptions);

    context.subscriptions.push(
        vscode.commands.registerCommand('makeup.refreshTargets', () => {
            targetsProvider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('makeup.runTarget', async (target) => {
            if (target && target.label) {
                const terminal = vscode.window.createTerminal('Make');
                terminal.show();
                terminal.sendText(`make ${target.label}`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('makeup.runTargetByName', async (targetName: string) => {
            if (targetName) {
                const terminal = vscode.window.createTerminal('Make');
                terminal.show();
                terminal.sendText(`make ${targetName}`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('makeup.jumpToTarget', async (target: any) => {
            if (target && target.file && target.name) {
                const document = await vscode.workspace.openTextDocument(target.file);
                const text = document.getText();
                const lines = text.split('\n');

                let targetLine = 0;
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const targetMatch = line.match(/^([a-zA-Z0-9_%-]+):/);
                    if (targetMatch && targetMatch[1] === target.name && !line.startsWith('\t')) {
                        targetLine = i;
                        break;
                    }
                }

                const editor = await vscode.window.showTextDocument(document);
                const position = new vscode.Position(targetLine, 0);
                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
            }
        })
    );

    const watcher = vscode.workspace.createFileSystemWatcher('**/[Mm]akefile');
    watcher.onDidChange(() => {
        targetsProvider.refresh();
        codeLensProvider.refresh();
        updateDecorations(vscode.window.activeTextEditor);
    });
    watcher.onDidCreate(() => {
        targetsProvider.refresh();
        codeLensProvider.refresh();
        updateDecorations(vscode.window.activeTextEditor);
    });
    watcher.onDidDelete(() => {
        targetsProvider.refresh();
        codeLensProvider.refresh();
    });
    context.subscriptions.push(watcher);

    context.subscriptions.push(decorationProvider);
}

export function deactivate() {}

