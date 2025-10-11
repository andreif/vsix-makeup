import * as vscode from 'vscode';
import * as path from 'path';

export class MakefileDecorationProvider {
    private decorationType: vscode.TextEditorDecorationType;
    private targetMap: Map<number, string> = new Map();

    constructor(context: vscode.ExtensionContext) {
        const iconPath = vscode.Uri.file(
            path.join(context.extensionPath, 'resources', 'play-icon.svg')
        );
        this.decorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: iconPath,
            gutterIconSize: 'contain'
        });
    }

    public updateDecorations(editor: vscode.TextEditor): void {
        const basename = editor.document.uri.path.split('/').pop()?.toLowerCase();
        if (basename !== 'makefile' && basename !== 'makefile') {
            this.targetMap.clear();
            return;
        }

        this.targetMap.clear();
        const decorations: vscode.DecorationOptions[] = [];
        const text = editor.document.getText();
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
                    this.targetMap.set(i, targetName);
                    const range = new vscode.Range(i, 0, i, 0);
                    const decoration: vscode.DecorationOptions = {
                        range,
                        hoverMessage: `Click to run make ${targetName}`
                    };
                    decorations.push(decoration);
                }
            }
        }

        editor.setDecorations(this.decorationType, decorations);
    }

    public getTargetAtLine(line: number): string | undefined {
        return this.targetMap.get(line);
    }

    public dispose(): void {
        this.decorationType.dispose();
    }
}

