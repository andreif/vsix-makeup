import * as fs from 'fs';
import * as path from 'path';

export interface MakeTarget {
    name: string;
    description?: string;
    file: string;
}

export function parseMakefile(filePath: string): MakeTarget[] {
    const targets: MakeTarget[] = [];

    if (!fs.existsSync(filePath)) {
        return targets;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let previousComment = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('#')) {
            previousComment = line.substring(1).trim();
            continue;
        }

        if (line.startsWith('.PHONY:')) {
            previousComment = '';
            continue;
        }

        const targetMatch = line.match(/^([a-zA-Z0-9_%-]+):/);
        if (targetMatch && !line.startsWith('\t')) {
            const targetName = targetMatch[1];
            if (!targetName.startsWith('.') && targetName !== 'PHONY') {
                targets.push({
                    name: targetName,
                    description: previousComment || undefined,
                    file: filePath
                });
            }
            previousComment = '';
        } else if (line && !line.startsWith('#')) {
            previousComment = '';
        }
    }

    return targets;
}

export function findMakefiles(rootPath: string): string[] {
    const makefiles: string[] = [];

    const checkFile = (filePath: string) => {
        const basename = path.basename(filePath);
        if (basename === 'Makefile' || basename === 'makefile') {
            makefiles.push(filePath);
        }
    };

    const scanDirectory = (dirPath: string, depth: number = 0) => {
        if (depth > 5) return;

        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);

                if (entry.name.startsWith('.') || entry.name === 'node_modules') {
                    continue;
                }

                if (entry.isDirectory()) {
                    scanDirectory(fullPath, depth + 1);
                } else if (entry.isFile()) {
                    checkFile(fullPath);
                }
            }
        } catch (err) {
        }
    };

    scanDirectory(rootPath);
    return makefiles;
}

