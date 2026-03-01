import * as vscode from 'vscode';
import { CursorOfficePanelProvider } from './panelProvider';

export function activate(context: vscode.ExtensionContext) {
  const provider = new CursorOfficePanelProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      CursorOfficePanelProvider.viewType,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('cursorOffice.show', () => {
      vscode.commands.executeCommand('cursorOffice.panel.focus');
    })
  );

  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    -100
  );
  statusBar.text = '$(home) Cursor Office';
  statusBar.tooltip = 'Open Cursor Office';
  statusBar.command = 'cursorOffice.show';
  statusBar.backgroundColor = new vscode.ThemeColor(
    'statusBarItem.prominentBackground'
  );
  statusBar.show();
  context.subscriptions.push(statusBar);
}

export function deactivate() {}
