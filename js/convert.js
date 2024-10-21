// Function to convert string to snake_case
function snakeCase(s) {
    return s.replace(/([a-zA-Z])(?=[A-Z])/g,'$1_').toLowerCase();
}

// Function to replace multiple newlines with exactly 2 newlines
function replaceMultipleNewlines(text) {
    return text.replace(/\n{3,}/g, '\n\n');
}

// Function to parse XML string into a DOM object
function parseXMLToDOM(xmlString) {
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, "application/xml");
}

// Convert XML to Python script logic
function convertXmlToPython(xmlString, linePrefix = '', indent = '    ') {
    let pythonCode = '';

    const xmlDoc = parseXMLToDOM(xmlString);

    function processNode(node, parentVariableName) {
        if (!parentVariableName) {
            parentVariableName = 'root_node';  // Default root variable name
        }

        let pythonCode = '';
        const attributeName = node.attributes.getNamedItem('name');
        const nodeVariableName = attributeName ? attributeName.value : 'node';
        const cleanedNodeVariableName = snakeCase(nodeVariableName.replace('.', '_').replace('-', '_').replace(' ', '_'));

        pythonCode += `${linePrefix}${indent}${cleanedNodeVariableName} = ${parentVariableName}.addChild('${nodeVariableName}'`;

        // Extract attributes
        let attributes = Array.from(node.attributes || []);
        attributes = attributes.filter((element) => element.name !== "name");
        const nodeAttributes = attributes.map(attr => `${attr.name}="${attr.value}"`).join(', ');

        if (nodeAttributes) {
            pythonCode += `, ${nodeAttributes}`;
        }
        pythonCode += ')\n\n';

        parentVariableName = cleanedNodeVariableName;

        // Process child nodes
        Array.from(node.childNodes || []).forEach(child => {
            if (child.nodeType === 1) {
                const isNode = child.nodeName === "Node";
                if (isNode) {
                    pythonCode += processNode(child, parentVariableName) + "\n";
                } else {
                    const nodeAttributes = Array.from(child.attributes || []).map(attr => `${attr.name}="${attr.value}"`).join(', ');
                    const nodeAttributesString = nodeAttributes ? `, ${nodeAttributes}` : "";
                    pythonCode += `${linePrefix}${indent}${parentVariableName}.addObject('${child.nodeName}'${nodeAttributesString})\n`;
                }
            }
        });

        return pythonCode;
    }

    const rootNode = xmlDoc.documentElement;
    pythonCode = processNode(rootNode, null);
    pythonCode = replaceMultipleNewlines(pythonCode);
    pythonCode = `${linePrefix}def createScene(root_node):\n` + pythonCode;

    return pythonCode;
}

// Function to generate Python code from XML
function generatePythonFromXML(xml) {
    return convertXmlToPython(xml);
}

export function convert_xml(raw_xml) {

    // Parse XML to check if it's valid
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(raw_xml, 'application/xml');
    let parseError = xmlDoc.getElementsByTagName('parsererror');

    if (parseError.length > 0) {
        console.log(parseError[0].innerHTML);
        throw new Error('Invalid XML');
    }

    localStorage.setItem('xmlCode', raw_xml);

    return generatePythonFromXML(raw_xml);

}
