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
  private dirWatcher: fs.FSWatcher | null = null;
  private log: vscode.OutputChannel;

  constructor(onStatusChange: (status: ParsedStatus) => void) {
    this.onStatusChange = onStatusChange;
    this.log = vscode.window.createOutputChannel('Cursor Office');
  }

  start(workspacePath?: string) {
    const wsPath = workspacePath || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    this.log.appendLine(`[start] workspace: ${wsPath}`);
    this.transcriptsDir = this.findTranscriptsDir(wsPath);
    if (!this.transcriptsDir) {
      this.log.appendLine('[start] No transcripts directory found — watcher inactive');
      return;
    }

    this.log.appendLine(`[start] Watching: ${this.transcriptsDir}`);
    this.scanAll();

    try {
      this.dirWatcher = fs.watch(this.transcriptsDir, { persistent: false }, (_event, filename) => {
        this.log.appendLine(`[fs.watch] event on dir, filename=${filename}`);
        this.scanAll();
      });
      this.watchers.push(this.dirWatcher);
    } catch (e) {
      this.log.appendLine(`[start] fs.watch failed: ${e}`);
    }

    this.scanInterval = setInterval(() => this.scanAll(), 2000);
  }

  private findTranscriptsDir(wsPath?: string): string | null {
    if (!wsPath) {
      this.log.appendLine('[find] No workspace path');
      return null;
    }

    const cursorRoot = path.join(os.homedir(), '.cursor', 'projects');
    if (!fs.existsSync(cursorRoot)) {
      this.log.appendLine(`[find] Cursor root missing: ${cursorRoot}`);
      return null;
    }

    const dirName = wsPath.replace(/[^a-zA-Z0-9-]/g, '-');
    const candidates = [
      dirName,
      dirName.replace(/^-+/, ''),
    ];

    this.log.appendLine(`[find] candidates: ${JSON.stringify(candidates)}`);

    for (const candidate of candidates) {
      const transcriptsDir = path.join(cursorRoot, candidate, 'agent-transcripts');
      if (fs.existsSync(transcriptsDir)) {
        this.log.appendLine(`[find] Match via candidate: ${candidate}`);
        return transcriptsDir;
      }
    }

    const wsBase = path.basename(wsPath);
    try {
      const dirs = fs.readdirSync(cursorRoot, { withFileTypes: true });
      for (const entry of dirs) {
        if (!entry.isDirectory() || !entry.name.includes(wsBase)) continue;
        const transcriptsDir = path.join(cursorRoot, entry.name, 'agent-transcripts');
        if (fs.existsSync(transcriptsDir)) {
          this.log.appendLine(`[find] Match via basename scan: ${entry.name}`);
          return transcriptsDir;
        }
      }
    } catch { /* ignore */ }

    this.log.appendLine('[find] No match found in any candidate');
    return null;
  }

  private scanAll() {
    if (!this.transcriptsDir) return;

    try {
      const entries = fs.readdirSync(this.transcriptsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const jsonlPath = path.join(this.transcriptsDir, entry.name, entry.name + '.jsonl');
        if (fs.existsSync(jsonlPath) && !this.filePositions.has(jsonlPath)) {
          this.log.appendLine(`[scan] New transcript: ${entry.name}`);
          this.watchFile(jsonlPath);
        }
        if (this.filePositions.has(jsonlPath)) {
          this.readNewContent(jsonlPath);
        }
      }
    } catch (e) {
      this.log.appendLine(`[scan] Error: ${e}`);
    }
  }

  private watchFile(filePath: string) {
    try {
      const fd = fs.openSync(filePath, 'r');
      const stat = fs.fstatSync(fd);
      fs.closeSync(fd);
      this.filePositions.set(filePath, Math.max(0, stat.size - 500));
      this.log.appendLine(`[watch] ${path.basename(filePath)} from pos ${this.filePositions.get(filePath)}`);

      const watcher = fs.watch(filePath, { persistent: false }, () => {
        this.readNewContent(filePath);
      });
      this.watchers.push(watcher);

      this.readNewContent(filePath);
    } catch (e) {
      this.log.appendLine(`[watch] Error: ${filePath} ${e}`);
    }
  }

  private readNewContent(filePath: string) {
    const prevPos = this.filePositions.get(filePath) ?? 0;

    let fd: number;
    try {
      fd = fs.openSync(filePath, 'r');
    } catch { return; }

    try {
      const stat = fs.fstatSync(fd);
      if (stat.size <= prevPos) {
        fs.closeSync(fd);
        return;
      }

      const bytesToRead = stat.size - prevPos;
      const buf = Buffer.alloc(bytesToRead);
      fs.readSync(fd, buf, 0, buf.length, prevPos);
      fs.closeSync(fd);
      this.filePositions.set(filePath, stat.size);

      this.log.appendLine(`[read] ${path.basename(filePath)} +${bytesToRead} bytes (${prevPos} → ${stat.size})`);

      const text = buf.toString('utf-8');
      const lines = text.split('\n').filter(l => l.trim());

      for (const line of lines) {
        const status = parseTranscriptLine(line);
        if (status) {
          this.log.appendLine(`[activity] ${status.activity}: ${status.statusText}`);
          this.onStatusChange(status);
          this.resetIdleTimer();
        }
      }
    } catch (e) {
      try { fs.closeSync(fd); } catch {}
      this.log.appendLine(`[read] Error: ${e}`);
    }
  }

  private resetIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.onStatusChange({ activity: 'idle', statusText: null });
    }, 30000);
  }

  dispose() {
    for (const w of this.watchers) {
      try { w.close(); } catch {}
    }
    this.watchers = [];
    if (this.scanInterval) clearInterval(this.scanInterval);
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.filePositions.clear();
    this.log.dispose();
  }
}
