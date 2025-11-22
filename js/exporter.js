import { into_tokens, trim_lines, into_lines, into_nodes, nodeToHTML } from './parser.js';

export function setupExporter() {
    document.getElementById('exportBtn').addEventListener('click', exportHTML);
}

function exportHTML() {
    const editorContent = document.getElementById('editor').value;
    const { tokenList, indentList } = into_tokens(editorContent);
    trim_lines(tokenList);
    const lineList = into_lines(tokenList);
    const root = into_nodes("root", indentList, lineList);

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.getElementById('filename').value || 'local'}</title>
  <link rel="stylesheet" href="https://fleetinglore.github.io/collection/collection.css">
</head>
<body>
  <details open>
      <summary>${root.name}</summary>
      <div style="margin-left:17px">\n`;

    root.rails.forEach(node => {
        html += nodeToHTML(node, 2);
    });

    html += `    </div>
  </details>
</body>
</html>`;

    let filename = document.getElementById('filename').value.trim() || 'root';
    filename = filename.replace(/\.html$/g, '') + '.html';

    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}
