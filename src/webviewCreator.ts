import { promises as fs } from "fs";
import { join } from "path";
import { window, ViewColumn, Uri } from "vscode";

/**
 * Creates a webview panel with a react app.
 *
 * @param contextPath - The path to the extension's context.
 */
async function webviewCreator(contextPath: string) {
  // The code you place here will be executed every time your command is executed
  // Display a message box to the user
  try {
    //bundle for react code
    const bundlePath = join(
      contextPath,
      "webview-react-app",
      "dist",
      "bundle.js"
    );
    const bundleContent = await fs.readFile(bundlePath, "utf-8");
    //html in the webview to put our react code into
    let webview = window.createWebviewPanel(
      "Next.Nav",
      "Next.Nav",
      ViewColumn.One,
      {
        enableScripts: true,
        //make the extension persist on tab
        retainContextWhenHidden: true,
      }
    );

    const styleUri = webview.webview.asWebviewUri(
      Uri.file(
        join(contextPath, "webview-react-app", "dist", "assets", "index.css")
      )
    );
    webview.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Next.Nav</title>
          <link rel="icon" type="image/x-icon" href="">
          <link rel="stylesheet" href="${styleUri}">

        </head>
        <body>
          <div id="root"></div>
          <script>
          ${bundleContent}
          </script>
        </body>
        </html>`;
  } catch (err) {
    console.log(err);
  }
  window.showInformationMessage("Hello World from testExtension!");
}

export default webviewCreator;
