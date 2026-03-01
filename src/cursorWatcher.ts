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

  constructor(onStatusChange: (status: ParsedStatus) => void) {
    this.onStatusChange = onStatusChange;
  }

  start(workspacePath?: string) {
    this.transcriptsDir = this.findTranscriptsDir(workspacePath);
    if (!this.transcriptsDir) {
      console.log('[Agent Arcade] No Cursor transcripts directory found');
      console.log('[Agent Arcade] Workspace:', workspacePath || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);
      return;
    }

    console.log('[Agent Arcade] Watching transcripts at:', this.transcriptsDir);
    this.scanAll();

    try {
      this.dirWatcher = fs.watch(this.transcriptsDir, { persistent: false }, () => {
        this.scanAll();
      });
      this.watchers.push(this.dirWatcher);
    } catch (e) {
      console.log('[Agent Arcade] Cannot watch dir, falling back to polling');
    }

    this.scanInterval = setInterval(() => this.scanAll(), 2000);
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
      if (fs.existsSync(transcriptsDir)) {
        console.log('[Agent Arcade] Found transcripts via candidate:', candidate);
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
          console.log('[Agent Arcade] Found transcripts via basename scan:', entry.name);
          return transcriptsDir;
        }
      }
    } catch { /* ignore */ }

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
          console.log('[Agent Arcade] New transcript found:', entry.name);
          this.watchFile(jsonlPath);
        }
        if (this.filePositions.has(jsonlPath)) {
          this.readNewContent(jsonlPath);
        }
      }
    } catch (e) {
      console.log('[Agent Arcade] Scan error:', e);
    }
  }

  private watchFile(filePath: string) {
    try {
      const stat = fs.statSync(filePath);
      this.filePositions.set(filePath, Math.max(0, stat.size - 500));

      const watcher = fs.watch(filePath, { persistent: false }, () => {
        this.readNewContent(filePath);
      });
      this.watchers.push(watcher);

      this.readNewContent(filePath);
    } catch (e) {
      console.log('[Agent Arcade] Watch error:', filePath, e);
    }
  }

  private readNewContent(filePath: string) {
    const prevPos = this.filePositions.get(filePath) ?? 0;
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch { return; }

    if (stat.size <= prevPos) return;

    try {
      const buf = Buffer.alloc(stat.size - prevPos);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buf, 0, buf.length, prevPos);
      fs.closeSync(fd);
      this.filePositions.set(filePath, stat.size);

      const text = buf.toString('utf-8');
      const lines = text.split('\n').filter(l => l.trim());

      for (const line of lines) {
        const status = parseTranscriptLine(line);
        if (status) {
          console.log('[Agent Arcade] Activity:', status.activity, status.statusText);
          this.onStatusChange(status);
          this.resetIdleTimer();
        }
      }
    } catch (e) {
      console.log('[Agent Arcade] Read error:', e);
    }
  }

  private resetIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.onStatusChange({ activity: 'idle', statusText: null });
    }, 8000);
  }

  dispose() {
    for (const w of this.watchers) {
      try { w.close(); } catch {}
    }
    this.watchers = [];
    if (this.scanInterval) clearInterval(this.scanInterval);
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.filePositions.clear();
  }
}
