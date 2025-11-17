export class Line {
    static PlaceHolder = { type: 'PlaceHolder' };
    static Element(content) { return { type: 'Element', content }; }
    static Comment(content) { return { type: 'Comment', content }; }
    static Rail(name, content) { return { type: 'Rail', name, content }; }
    static Category1(name) { return { type: 'Category1', name }; }
    static Category2(name, content) { return { type: 'Category2', name, content }; }
}

export class Node {
    static PlaceHolder = { type: 'PlaceHolder' };
    static Comment(content) { return { type: 'Comment', content }; }
    static Element(content) { return { type: 'Element', content }; }
    static Rail(name, content) { return { type: 'Rail', name, content }; }
    static Domain(category, rails = []) { return { type: 'Domain', category, rails }; }
}

export function into_tokens(input) {
    const lines = input.split('\n');
    const tokenList = [];
    const indentList = [];

    for (const line of lines) {
        if (!line.trim()) continue;

        const tokens = [];
        let currentToken = '';
        let indentCount = 0;
        let inIndent = true;

        for (const char of line) {
            if (inIndent && char === ' ') {
                indentCount++;
            } else if (inIndent && char !== ' ') {
                inIndent = false;
                currentToken += char;
            } else if (char === ' ') {
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
            } else {
                currentToken += char;
            }
        }

        if (currentToken) tokens.push(currentToken);
        if (tokens.length > 0) {
            tokenList.push(tokens);
            indentList.push(Math.floor(indentCount / 2));
        }
    }

    return { tokenList, indentList };
}

// 转义符
export function trim_lines(tokenList) {
    for (const tokens of tokenList) {
        for (let i = 0; i < tokens.length; i++) {
            tokens[i] = tokens[i].replace(/=_/g, ' ');
        }
    }
}

export function into_lines(tokenList) {
    const lines = [];

    for (const tokens of tokenList) {
        const tokenCount = tokens.length;

        if (tokenCount === 1) {
            if (tokens[0] === '#') {
                lines.push(Line.PlaceHolder);
            } else {
                lines.push(Line.Element(tokens[0]));
            }
        } else if (tokenCount === 2) {
            if (tokens[0] === '#') {
                lines.push(Line.Comment(tokens[1]));
            } else if (tokens[0] === '+') {
                lines.push(Line.Category1(tokens[1]));
            }
        } else if (tokenCount === 3) {
            if (tokens[1] === '=') {
                lines.push(Line.Rail(tokens[0], tokens[2]));
            }
        } else if (tokenCount === 4) {
            if (tokens[2] === '=') {
                lines.push(Line.Category2(tokens[1], tokens[3]));
            }
        } else {
            lines.push(Line.Element(tokens.join(' ')));
        }
    }

    return lines;
}

export function into_nodes(domainName, indentList, lineList) {
    const root = {
        name: domainName,
        rails: []
    };

    const stack = [root.rails];
    let currentIndent = 0;

    for (let i = 0; i < lineList.length; i++) {
        const line = lineList[i];
        const indent = indentList[i];

        if (indent < currentIndent) {
            const levelsToPop = currentIndent - indent;
            for (let j = 0; j < levelsToPop; j++) {
                if (stack.length > 1) stack.pop();
            }
        } else if (indent > currentIndent) {
            const lastNode = stack[stack.length - 1][stack[stack.length - 1].length - 1];
            if (lastNode && lastNode.type === 'Domain') {
                stack.push(lastNode.rails);
            }
        }

        currentIndent = indent;

        let node;
        switch (line.type) {
            case 'PlaceHolder':
                node = Node.PlaceHolder;
                break;
            case 'Comment':
                node = Node.Comment(line.content);
                break;
            case 'Element':
                node = Node.Element(line.content);
                break;
            case 'Rail':
                node = Node.Rail(line.name, line.content);
                break;
            case 'Category1':
                node = Node.Domain(Line.Category1(line.name), []);
                break;
            case 'Category2':
                node = Node.Domain(Line.Category2(line.name, line.content), []);
                break;
            default:
                node = Node.Element(JSON.stringify(line));
        }

        stack[stack.length - 1].push(node);
    }

    return root;
}

export function nodeToHTML(node, level = 0) {
    if (node.type === 'Comment' || node.type === 'PlaceHolder') {
        return '';
    }

    const indent = '  '.repeat(level);
    let html = '';

    if (node.type === 'Domain') {
        const isOpen = level === 0 ? ' open' : '';
        html += `${indent}  <details${isOpen}>\n`;

        let title;
        if (node.category.type === 'Category1') {
            title = node.category.name;
        } else if (node.category.type === 'Category2') {
            title = `${node.category.name} = ${node.category.content}`; // 这是其实一个待修复的问题。哈哈哈
        } else {
            title = 'None';
        }

        html += `${indent}    <summary>${title}</summary>\n`;

        if (node.rails && node.rails.length > 0) {
            html += `${indent}    <div style="margin-left:20px">\n`;
            node.rails.forEach(child => {
                html += nodeToHTML(child, level + 1);
            });
            html += `${indent}    </div>\n`;
        }

        html += `${indent}  </details>\n`;
    } else if (node.type === 'Rail') {
        html += `${indent}  <a href="${node.content}" target="_blank">${node.name}</a>\n`;
    } else if (node.type === 'Element') {
        html += `${indent}  <p>${node.content}</p>\n`;
    }

    return html;
}
