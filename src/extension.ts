import * as vscode from 'vscode';
import { MakeTargetsProvider } from './makeTargetsProvider';
import { MakefileCodeLensProvider } from './makefileCodeLens';

export function activate(context: vscode.ExtensionContext) {
    const targetsProvider = new MakeTargetsProvider();
    const codeLensProvider = new MakefileCodeLensProvider();

    vscode.window.registerTreeDataProvider('makeupTargets', targetsProvider);

    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            { pattern: '**/[Mm]akefile' },
            codeLensProvider
        )
    );

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
    });
    watcher.onDidCreate(() => {
        targetsProvider.refresh();
        codeLensProvider.refresh();
    });
    watcher.onDidDelete(() => {
        targetsProvider.refresh();
        codeLensProvider.refresh();
    });
    context.subscriptions.push(watcher);
}

export function deactivate() {}

