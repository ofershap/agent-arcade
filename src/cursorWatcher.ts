import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as vscode from 'vscode';
import { parseTranscriptLine, ParsedStatus } from './transcriptParser';

export class CursorWatcher implements vscode.Disposable {
  private watchers: fs.FSWatcher[] = [];
  private filePositions = new Map<string, number>();
  private scanInterval: ReturnType<typeof setInterval> | null = null;
  private transcriptsDir: string | null = null;
  private onStatusChange: (status: ParsedStatus) => void;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(onStatusChange: (status: ParsedStatus) => void) {
    this.onStatusChange = onStatusChange;
  }

  start(workspacePath?: string) {
    this.transcriptsDir = this.findTranscriptsDir(workspacePath);
    if (!this.transcriptsDir) {
      console.log('[Agent Arcade] No Cursor transcripts directory found');
      return;
    }

    console.log('[Agent Arcade] Watching:', this.transcriptsDir);
    this.scanExisting();

    this.scanInterval = setInterval(() => this.scanForNew(), 3000);
  }

  private findTranscriptsDir(workspacePath?: string): string | null {
    const wsPath = workspacePath || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!wsPath) return null;

    const cursorRoot = path.join(os.homedir(), '.cursor', 'projects');
    if (!fs.existsSync(cursorRoot)) return null;

    const dirName = wsPath.replace(/[^a-zA-Z0-9-]/g, '-');
    const candidates = [
      dirName,
      dirName.replace(/^-+/, ''),
    ];

    for (const candidate of candidates) {
      const transcriptsDir = path.join(cursorRoot, candidate, 'agent-transcripts');
      if (fs.existsSync(transcriptsDir)) return transcriptsDir;
    }

    const wsBase = path.basename(wsPath);
    try {
      const dirs = fs.readdirSync(cursorRoot, { withFileTypes: true });
      for (const entry of dirs) {
        if (!entry.isDirectory() || !entry.name.includes(wsBase)) continue;
        const transcriptsDir = path.join(cursorRoot, entry.name, 'agent-transcripts');
        if (fs.existsSync(transcriptsDir)) return transcriptsDir;
      }
    } catch { /* ignore */ }

    return null;
  }

  private scanExisting() {
    if (!this.transcriptsDir) return;

    try {
      const entries = fs.readdirSync(this.transcriptsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const jsonlPath = path.join(this.transcriptsDir, entry.name, entry.name + '.jsonl');
        if (fs.existsSync(jsonlPath)) {
          this.watchFile(jsonlPath);
        }
      }
    } catch { /* ignore */ }
  }

  private scanForNew() {
    if (!this.transcriptsDir) return;

    try {
      const entries = fs.readdirSync(this.transcriptsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const jsonlPath = path.join(this.transcriptsDir, entry.name, entry.name + '.jsonl');
        if (fs.existsSync(jsonlPath) && !this.filePositions.has(jsonlPath)) {
          this.watchFile(jsonlPath);
        }
      }
    } catch { /* ignore */ }
  }

  private watchFile(filePath: string) {
    const stat = fs.statSync(filePath);
    this.filePositions.set(filePath, stat.size);

    try {
      const watcher = fs.watch(filePath, () => this.readNewContent(filePath));
      this.watchers.push(watcher);
    } catch {
      fs.watchFile(filePath, { interval: 1000 }, () => this.readNewContent(filePath));
    }
  }

  private readNewContent(filePath: string) {
    const prevPos = this.filePositions.get(filePath) || 0;
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch { return; }

    if (stat.size <= prevPos) return;

    const stream = fs.createReadStream(filePath, {
      start: prevPos,
      end: stat.size - 1,
      encoding: 'utf-8',
    });

    let buffer = '';
    stream.on('data', (chunk: string) => { buffer += chunk; });
    stream.on('end', () => {
      this.filePositions.set(filePath, stat!.size);

      const lines = buffer.split('\n').filter(l => l.trim());
      for (const line of lines) {
        const status = parseTranscriptLine(line);
        if (status) {
          this.onStatusChange(status);
          this.resetIdleTimer();
        }
      }
    });
  }

  private resetIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.onStatusChange({ activity: 'idle', statusText: null });
    }, 5000);
  }

  dispose() {
    for (const w of this.watchers) w.close();
    this.watchers = [];
    if (this.scanInterval) clearInterval(this.scanInterval);
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.filePositions.clear();
  }
}
