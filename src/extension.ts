import * as vscode from 'vscode';
import { MakeTargetsProvider } from './makeTargetsProvider';
import { MakefileCodeLensProvider } from './makefileCodeLens';
import { MakefileDecorationProvider } from './makefileDecorations';

export function activate(context: vscode.ExtensionContext) {
    const targetsProvider = new MakeTargetsProvider();
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

    vscode.window.onDidChangeTextEditorSelection(event => {
        const editor = event.textEditor;
        const basename = editor.document.uri.path.split('/').pop()?.toLowerCase();
        if (basename === 'makefile' || basename === 'makefile') {
            const position = event.selections[0].active;
            const targetName = decorationProvider.getTargetAtLine(position.line);
            if (targetName && event.kind === vscode.TextEditorSelectionChangeKind.Mouse) {
                const lineText = editor.document.lineAt(position.line).text;
                if (position.character === 0 || (position.character < 3 && lineText.startsWith(targetName))) {
                    vscode.commands.executeCommand('makeup.runTargetByName', targetName);
                }
            }
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

