import { into_tokens, trim_lines, into_lines, into_nodes, nodeToHTML } from './parser.js';

export function setupExporter() {
    document.getElementById('exportBtn').addEventListener('click', exportHTML);
}

function exportHTML() {
    const editorContent = document.getElementById('editor').value;
    const { tokenList, indentList } = into_tokens(editorContent);
    trim_lines(tokenList);
    const lineList = into_lines(tokenList);
    const root = into_nodes("а╢╫су╬", indentList, lineList);

    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${document.getElementById('filename').value || 'а╢╫су╬'}</title>
    <style>
:root {
    --back_ground: #fffff7;
    --text: #001e3b;
    --local: #c6c0ff;
    --shadow: #d7d9db;
    --block: #7d7d7e;
}
body {
    background: var(--back_ground);
    color: var(--text);
    font-family: "Fira Sans", sans-serif;
    padding: 20px;
}
details {
    background: var(--back_ground);
    margin-bottom: 5px;
}
details[open] {
    background: var(--back_ground);
}
summary {
    list-style: none;
    color: var(--text);
    padding: 8px 0;
    cursor: pointer;
}
summary:hover {
    background: var(--back_ground);
}
summary::-webkit-details-marker {
    display: none;
}
summary::before {
    content: "+";
    margin-right: 12px;
    display: inline-block;
    width: 20px;
    text-align: center;
    color: #003366;
    font-weight: bold;
}
details[open] > summary::before {
    content: "-";
}
.links {
    padding-left: 16px;
    border-left: 2px solid var(--text);
    margin-top: 5px;
}
a {
    display: block;
    color: var(--text);
    text-decoration: none;
    padding: 6px 10px;
    border-radius: 4px;
    margin: 3px 0;
    transition: all 0.2s;
}
a:hover {
    background: var(--local);
    color: var(--back_ground);
}
    </style>
</head>
<body>
    <details open>
        <summary>${root.name}</summary>
        <div style="margin-left:20px">\n`;

    root.rails.forEach(node => {
        html += nodeToHTML(node, 2);
    });

    html += `        </div>
    </details>
</body>
</html>`;

    let filename = document.getElementById('filename').value.trim() || 'а╢╫су╬';
    filename = filename.replace(/\.html$/g, '') + '.html';

    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}