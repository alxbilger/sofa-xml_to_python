// Function to convert string to snake_case
function snakeCase(s) {
    if (s !== s.toUpperCase()) {
        return s.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toLowerCase();
    }
    return s.toLowerCase();
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

const root_node_variable_name = 'root_node';
const default_ident = '    ';

function processChildNodes(node, parent_variable_name, linePrefix = '', indent = default_ident) {
    if (!parent_variable_name) {
        parent_variable_name = root_node_variable_name;
    }
    
    let python_code = '';
    Array.from(node.childNodes || []).forEach(child => {
        if (child.nodeType === 1) {
            const is_node = child.nodeName === "Node";
            if (is_node) {
                python_code += processNode(child, parent_variable_name) + "\n";
            } else {
                const node_attributes = Array.from(child.attributes || []).map(attr => `${attr.name}="${attr.value}"`).join(', ');
                const node_attributes_string = node_attributes ? `, ${node_attributes}` : "";
                python_code += `${linePrefix}${indent}${parent_variable_name}.addObject('${child.nodeName}'${node_attributes_string})\n`;
            }
        }
    });
    return python_code;
}

function processNode(node, parent_variable_name, linePrefix = '', indent = default_ident) {
    if (!parent_variable_name) {
        parent_variable_name = root_node_variable_name;
    }

    let python_code = '';
    const attribute_name = node.attributes.getNamedItem('name');
    const node_variable_name = attribute_name ? attribute_name.value : 'node';
    const cleaned_node_variable_name = snakeCase(node_variable_name.replace('.', '_').replace('-', '_').replace(' ', '_'));

    python_code += `${linePrefix}${indent}${cleaned_node_variable_name} = ${parent_variable_name}.addChild('${node_variable_name}'`;

    // Extract attributes
    let attributes = Array.from(node.attributes || []);
    attributes = attributes.filter((element) => element.name !== "name");
    const nodeAttributes = attributes.map(attr => `${attr.name}="${attr.value}"`).join(', ');

    if (nodeAttributes) {
        python_code += `, ${nodeAttributes}`;
    }
    python_code += ')\n\n';

    parent_variable_name = cleaned_node_variable_name;
    python_code += processChildNodes(node,  parent_variable_name);

    return python_code;
}

// Convert XML to Python script logic
function convertXmlToPython(xmlString, linePrefix = '', indent = default_ident) {
    let python_code = '';


    const xmlDoc = parseXMLToDOM(xmlString);

    const rootNode = xmlDoc.documentElement;

    let attributes = Array.from(rootNode.attributes || []);
    if (attributes) {
        python_code = attributes.map(attr => `${indent}${root_node_variable_name}.${attr.name} = "${attr.value}"`).join('\n') + '\n\n';
    }

    python_code += processChildNodes(rootNode, root_node_variable_name, linePrefix, indent);

    python_code = replaceMultipleNewlines(python_code);
    python_code = `${linePrefix}def createScene(${root_node_variable_name}):\n` + python_code;

    return python_code;
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
