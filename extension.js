const vscode = require('vscode');
const axios = require('axios');

function activate(context) {
    let disposable = vscode.commands.registerCommand('csslisible.sendFileContent', async function() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage(vscode.l10n.t('No active editor found'));
            return;
        }

        const document = editor.document;
        const config = vscode.workspace.getConfiguration('csslisible');
        const apiEndpoint = config.get('apiEndpoint');
        const url = apiEndpoint ? apiEndpoint : 'https://www.csslisible.com/';

        const highlightedText = editor.document.getText(editor.selection);
        const hasHighlightedText = highlightedText.length > 0;
        const textToClean = hasHighlightedText ? highlightedText : document.getText();

        try {
            if (!['css', 'scss', 'sass'].includes(document.languageId)) {
                vscode.window.showErrorMessage(vscode.l10n.t('Only CSS, SCSS and SASS files are supported'));
                return;
            }

            if(!textToClean.trim()) {
                vscode.window.showErrorMessage(vscode.l10n.t('The file is empty'));
                return;
            }

            const response = await axios.post(url, {
                api: 1,
                clean_css: textToClean,
                distance_selecteurs: config.get('distance_selecteurs'),
                selecteurs_multiples_separes: config.get('selecteurs_multiples_separes'),
                keep_empty_mediaqueries: config.get('keep_empty_mediaqueries')
            });

            if (response.data == textToClean) {
                vscode.window.showInformationMessage(vscode.l10n.t('CSS was already clean and formatted'));
                return;
            }

            const selectionStart = hasHighlightedText ? editor.selection.start : document.positionAt(0);
            const selectionEnd = hasHighlightedText ? editor.selection.end : document.positionAt(textToClean.length);

            const fullRange = new vscode.Range(
                selectionStart,
                selectionEnd
            );

            editor.edit(editBuilder => {
                editBuilder.replace(fullRange, response.data);
            });
            vscode.window.showInformationMessage(vscode.l10n.t('CSS has been cleaned and formatted'));
        } catch (error) {
            vscode.window.showErrorMessage(vscode.l10n.t('Failed to send file content:') + ' ' + error.message);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
