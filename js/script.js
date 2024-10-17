import {setCookie, getCookie} from "./cookie.js";

const defaultScene =
    "<?xml version=\"1.0\" ?>\n" +
    "<Node name=\"root\" gravity=\"0 -9.81 0\" dt=\"0.04\">\n" +
    "</Node>";

let savedXml = getCookie('xmlCode');
if (savedXml === null) {
    setCookie('xmlCode', encodeURIComponent(defaultScene));
}

// Load Monaco Editor
window.require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' } });
window.require(['vs/editor/editor.main'], function() {

    // XML Editor (Left Panel)
    let xmlEditor = monaco.editor.create(document.getElementById('xml-editor'), {
        value: '',
        language: 'xml',
        theme: 'vs-dark',
        automaticLayout: true
    });

    // Python Editor (Right Panel - Readonly)
    let pythonEditor = monaco.editor.create(document.getElementById('python-editor'), {
        value: '',
        language: 'python',
        theme: 'vs-dark',
        readOnly: true,
        automaticLayout: true
    });

    // Load XML content from cookie on page load
    let savedXml = getCookie('xmlCode');
    if (savedXml) {
        xmlEditor.setValue(decodeURIComponent(savedXml));
    }

    // Function to generate Python code from XML
    function generatePythonFromXML(xml) {
        return `# Python code generated from XML\nprint("Generated from XML")\nxml_data = """${xml}"""\nprint(xml_data)`;
    }

    // Function to handle XML changes
    xmlEditor.onDidChangeModelContent(function() {
        let xmlCode = xmlEditor.getValue();

        try {
            // Parse XML to check if it's valid
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(xmlCode, 'application/xml');
            let parseError = xmlDoc.getElementsByTagName('parsererror');

            if (parseError.length > 0) {
                throw new Error('Invalid XML');
            }

            // XML is valid, generate Python code
            pythonEditor.setValue(generatePythonFromXML(xmlCode));

            // Save XML to cookie
            setCookie('xmlCode', encodeURIComponent(xmlCode)); // Store XML for 7 days

        } catch (error) {
            console.error('XML Error:', error.message);
            pythonEditor.setValue('# Error: Invalid XML');
        }
    });

    // Handle Drag-and-Drop of XML files
    let xmlEditorDom = document.getElementById('xml-editor');
    xmlEditorDom.addEventListener('dragover', function(event) {
        event.preventDefault();
    });

    xmlEditorDom.addEventListener('drop', function(event) {
        event.preventDefault();
        let file = event.dataTransfer.files[0];

        if (file && file.type === 'text/xml') {
            let reader = new FileReader();
            reader.onload = function(e) {
                xmlEditor.setValue(e.target.result);
            };
            reader.readAsText(file);
        } else {
            console.warn('Please drop a valid XML file.');
        }
    });
});
