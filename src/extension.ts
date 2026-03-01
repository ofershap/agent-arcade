import * as vscode from 'vscode';
import { AgentArcadePanelProvider } from './panelProvider';

export function activate(context: vscode.ExtensionContext) {
  const provider = new AgentArcadePanelProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      AgentArcadePanelProvider.viewType,
      provider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('agentArcade.show', () => {
      vscode.commands.executeCommand('agentArcade.office.focus');
    })
  );
}

export function deactivate() {}
