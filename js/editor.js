export function setupEditor() {
    const editor = document.getElementById('editor');

    // 设置符号插入按钮
    document.getElementById('insertHash').addEventListener('click', () => insertSymbol('# '));
    document.getElementById('insertEqual').addEventListener('click', () => insertSymbol(' = '));
    document.getElementById('insertPlus').addEventListener('click', () => insertSymbol('+ '));

    // 设置缩进处理
    editor.addEventListener('keydown', handleIndent);
}

function insertSymbol(symbol) {
    const editor = document.getElementById('editor');
    const pos = editor.selectionStart;
    const text = editor.value;

    editor.value = text.substring(0, pos) + symbol + text.substring(pos);
    editor.focus();
    editor.selectionStart = editor.selectionEnd = pos + symbol.length;
}

function handleIndent(e) {
    if (e.key !== 'Enter') return;

    e.preventDefault();
    const editor = e.target;
    const pos = editor.selectionStart;
    const text = editor.value;
    const currentLine = text.substring(0, pos).split('\n').pop();

    let indent = currentLine.match(/^\s*/)[0];
    if (currentLine.trim().startsWith('%')) {
        indent += '  ';
    }

    const newText = '\n' + indent;
    editor.value = text.substring(0, pos) + newText + text.substring(pos);
    editor.selectionStart = editor.selectionEnd = pos + newText.length;
}