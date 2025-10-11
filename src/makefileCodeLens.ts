import * as vscode from 'vscode';

export class MakefileCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const basename = document.uri.path.split('/').pop()?.toLowerCase();
        if (basename !== 'makefile' && basename !== 'makefile') {
            return [];
        }

        const codeLenses: vscode.CodeLens[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('#') || trimmedLine.startsWith('.PHONY:')) {
                continue;
            }

            const targetMatch = line.match(/^([a-zA-Z0-9_-]+):/);
            if (targetMatch && !line.startsWith('\t')) {
                const targetName = targetMatch[1];
                if (!targetName.startsWith('.') && targetName !== 'PHONY') {
                    const range = new vscode.Range(i, 0, i, line.length);
                    const codeLens = new vscode.CodeLens(range, {
                        title: '▶ Run',
                        command: 'makeup.runTargetByName',
                        arguments: [targetName]
                    });
                    codeLenses.push(codeLens);
                }
            }
        }

        return codeLenses;
    }

    public refresh(): void {
        this._onDidChangeCodeLenses.fire();
    }
}

