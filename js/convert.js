// Function to generate Python code from XML
function generatePythonFromXML(xml) {
    return `# Python code generated from XML\nprint("Generated from XML")\nxml_data = """${xml}"""\nprint(xml_data)`;
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
