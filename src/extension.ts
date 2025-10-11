import * as vscode from 'vscode';
import { MakeTargetsProvider } from './makeTargetsProvider';

export function activate(context: vscode.ExtensionContext) {
    const targetsProvider = new MakeTargetsProvider();

    vscode.window.registerTreeDataProvider('makeupTargets', targetsProvider);

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

    const watcher = vscode.workspace.createFileSystemWatcher('**/[Mm]akefile');
    watcher.onDidChange(() => targetsProvider.refresh());
    watcher.onDidCreate(() => targetsProvider.refresh());
    watcher.onDidDelete(() => targetsProvider.refresh());
    context.subscriptions.push(watcher);
}

export function deactivate() {}

