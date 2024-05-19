const vscode = require('vscode');
const axios = require('axios');

function activate(context) {
    let disposable = vscode.commands.registerCommand('csslisible.sendFileContent', async function() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const document = editor.document;

        const config = vscode.workspace.getConfiguration('csslisible');
        const apiEndpoint = config.get('apiEndpoint');
        const url = apiEndpoint ? apiEndpoint : 'https://www.csslisible.com/';

        try {
            const response = await axios.post(url, {
                api: 1,
                clean_css: document.getText(),
                distance_selecteurs: config.get('distance_selecteurs'),
                selecteurs_multiples_separes: config.get('selecteurs_multiples_separes'),
                keep_empty_mediaqueries: config.get('keep_empty_mediaqueries')
            });

            if (response.data == document.getText()) {
                vscode.window.showInformationMessage('CSS was already clean and formatted!');
                return;
            }

            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );

            editor.edit(editBuilder => {
                editBuilder.replace(fullRange, response.data);
            });
            vscode.window.showInformationMessage('CSS has been cleaned and formatted!');
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
