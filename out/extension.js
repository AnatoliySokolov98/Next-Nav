"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const path = require("path");
const makeTree_1 = require("./makeTree");
const fs_1 = require("fs");
//get the directory to send to the React
async function sendUpdatedDirectory(webview, src, app) {
    try {
        //tree maker builds it
        const result = await (0, makeTree_1.default)(src, app);
        const sendString = JSON.stringify(result);
        webview.webview.postMessage({ command: 'sendString', data: sendString });
    }
    catch (error) {
        console.error('Error sending updated directory:', error.message);
        vscode.window.showErrorMessage('Error sending updated directory: ' + error.message);
    }
}
function activate(context) {
    console.log('Congratulations, your extension "next-extension" is now active!');
    //runs when extension is called every time
    let disposable = vscode.commands.registerCommand('next-extension.helloWorld', async () => {
        //create a webview to put React on
        const webview = vscode.window.createWebviewPanel('reactWebview', 'React Webview', vscode.ViewColumn.One, {
            enableScripts: true,
            //make the extnsion persist on tab
            retainContextWhenHidden: true
        });
        //When we get requests from React
        webview.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                //send directory to React
                case 'getRequest':
                    await sendUpdatedDirectory(webview, message.src, message.app);
                    break;
                // open a file in the extension
                case 'open_file':
                    const filePath = message.filePath;
                    try {
                        const document = await vscode.workspace.openTextDocument(filePath);
                        await vscode.window.showTextDocument(document);
                        console.log(`Switched to tab with file: ${filePath}`);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(`Error opening file: ${err.message}`);
                        console.error(`Error opening file: ${err}`);
                    }
                    break;
                //add a new file in at specified path
                case 'addFile':
                    try {
                        const filePath = path.join(message.path, message.fileName);
                        await fs_1.promises.writeFile(filePath, 'This is your new file!');
                        //let the React know we added a file
                        webview.webview.postMessage({ command: 'added_addFile' });
                    }
                    catch (error) {
                        console.error('Error creating file:', error.message);
                        vscode.window.showErrorMessage('Error creating file: ' + error.message);
                    }
                    break;
                //delete a file at specified path
                case 'deleteFile':
                    try {
                        const filePath = path.join(message.path, message.fileName);
                        if (await fs_1.promises.stat(filePath)) {
                            await fs_1.promises.unlink(filePath);
                        }
                        else {
                            throw new Error('File does not exist');
                        }
                        //let the React know we deleted a file
                        webview.webview.postMessage({ command: 'added_deleteFile' });
                    }
                    catch (error) {
                        console.error('Error deleting file:', error.message);
                        vscode.window.showErrorMessage('Error deleting file: ' + error.message);
                    }
                    break;
            }
        }, undefined, context.subscriptions);
        try {
            //bundle for react code
            const bundlePath = path.join(context.extensionPath, 'webview-react-app', 'dist', 'bundle.js');
            const bundleContent = await fs_1.promises.readFile(bundlePath, 'utf-8');
            //html in the webview to put our react code into
            webview.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>React Webview</title>
        </head>
        <body>
          <div id="root"></div>
          <script>
          ${bundleContent}
          </script>
        </body>
        </html>`;
        }
        catch (err) {
            console.error('Error reading bundle.js:', err);
        }
        vscode.window.showInformationMessage('Hello, World!');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map