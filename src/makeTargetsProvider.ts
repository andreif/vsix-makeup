import * as vscode from 'vscode';
import * as path from 'path';
import { parseMakefile, findMakefiles, MakeTarget } from './makefileParser';

class MakeTargetItem extends vscode.TreeItem {
    constructor(
        public readonly target: MakeTarget,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        iconPath: vscode.Uri,
        emptyIconPath: vscode.Uri
    ) {
        super(target.name, collapsibleState);
        this.tooltip = "Jump to";
        this.description = target.description;
        this.contextValue = target.isPattern ? 'makePatternTarget' : 'makeTarget';
        this.iconPath = target.isPattern ? emptyIconPath : iconPath;
        this.command = {
            command: 'makeup.jumpToTarget',
            title: 'Jump to Target',
            arguments: [this.target]
        };
    }
}

class MakefileItem extends vscode.TreeItem {
    constructor(
        public readonly filePath: string,
        public readonly targets: MakeTarget[],
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const relativePath = workspaceFolder
            ? path.relative(workspaceFolder.uri.fsPath, filePath)
            : filePath;

        super(relativePath, collapsibleState);
        this.tooltip = filePath;
        this.description = `(${targets.length} targets)`;
        this.contextValue = 'makefile';
        this.iconPath = new vscode.ThemeIcon('file-code');
    }
}

export class MakeTargetsProvider implements vscode.TreeDataProvider<MakefileItem | MakeTargetItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<MakefileItem | MakeTargetItem | undefined | null | void> = new vscode.EventEmitter<MakefileItem | MakeTargetItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<MakefileItem | MakeTargetItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private makefiles: Map<string, MakeTarget[]> = new Map();
    private iconPath: vscode.Uri;
    private emptyIconPath: vscode.Uri;

    constructor(context: vscode.ExtensionContext) {
        this.iconPath = vscode.Uri.file(
            path.join(context.extensionPath, 'resources', 'play-icon.svg')
        );
        this.emptyIconPath = vscode.Uri.file(
            path.join(context.extensionPath, 'resources', 'empty-icon.svg')
        );
        this.loadMakefiles();
    }

    refresh(): void {
        this.loadMakefiles();
        this._onDidChangeTreeData.fire();
    }

    private loadMakefiles(): void {
        this.makefiles.clear();

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }

        for (const folder of workspaceFolders) {
            const makefilePaths = findMakefiles(folder.uri.fsPath);
            for (const makefilePath of makefilePaths) {
                const targets = parseMakefile(makefilePath);
                if (targets.length > 0) {
                    this.makefiles.set(makefilePath, targets);
                }
            }
        }
    }

    getTreeItem(element: MakefileItem | MakeTargetItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: MakefileItem | MakeTargetItem): Thenable<(MakefileItem | MakeTargetItem)[]> {
        if (!element) {
            if (this.makefiles.size === 0) {
                return Promise.resolve([]);
            }

            if (this.makefiles.size === 1) {
                const [, targets] = Array.from(this.makefiles.entries())[0];
                return Promise.resolve(
                    targets.map(target => new MakeTargetItem(target, vscode.TreeItemCollapsibleState.None, this.iconPath, this.emptyIconPath))
                );
            }

            return Promise.resolve(
                Array.from(this.makefiles.entries()).map(([filePath, targets]) =>
                    new MakefileItem(filePath, targets, vscode.TreeItemCollapsibleState.Expanded)
                )
            );
        }

        if (element instanceof MakefileItem) {
            return Promise.resolve(
                element.targets.map(target => new MakeTargetItem(target, vscode.TreeItemCollapsibleState.None, this.iconPath, this.emptyIconPath))
            );
        }

        return Promise.resolve([]);
    }
}

