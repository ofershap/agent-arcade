import * as vscode from 'vscode';
import { CursorWatcher } from './cursorWatcher';
import { ParsedStatus } from './transcriptParser';

export class AgentArcadePanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'agentArcade.office';

  private view?: vscode.WebviewView;
  private watcher: CursorWatcher;

  constructor(private readonly extensionUri: vscode.Uri) {
    this.watcher = new CursorWatcher((status: ParsedStatus) => {
      this.sendStatus(status);
    });
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    this.watcher.start();

    webviewView.onDidDispose(() => {
      this.watcher.dispose();
    });
  }

  private sendStatus(status: ParsedStatus) {
    if (!this.view) return;
    this.view.webview.postMessage({
      type: 'agentStatus',
      activity: status.activity,
      statusText: status.statusText,
    });
  }

  private getHtml(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview.js')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #1e1e2e;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      overflow: hidden;
    }
    #officeCanvas {
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
  </style>
</head>
<body>
  <canvas id="officeCanvas"></canvas>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  dispose() {
    this.watcher.dispose();
  }
}

function getNonce(): string {
  let text = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
