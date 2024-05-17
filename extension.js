const vscode = require('vscode');
const axios = require('axios');

function activate(context) {
    let disposable = vscode.commands.registerCommand('csslisible.sendFileContent', async function() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const config = vscode.workspace.getConfiguration('csslisible');
        const apiEndpoint = config.get('apiEndpoint');

        const document = editor.document;
        const content = document.getText();
        const url = apiEndpoint ? apiEndpoint : 'https://www.csslisible.com/';

        try {
            const response = await axios.post(url, {
                clean_css: content,
                api: 1
            });
            const newText = response.data;

            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );

            editor.edit(editBuilder => {
                editBuilder.replace(fullRange, newText);
            });
            vscode.window.showInformationMessage('File content updated successfully');
        } catch (error) {
            vscode.window.showErrorMessage('Failed to send file content: ' + error.message);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
