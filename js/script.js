import {convert_xml} from "./convert.js";

const defaultScene =
    "<?xml version=\"1.0\" ?>\n" +
    "<Node name=\"root\" gravity=\"0 -9.81 0\" dt=\"0.04\">\n" +
    "</Node>\n";



let savedXml = localStorage.getItem('xmlCode');
if (savedXml === null) {
    localStorage.setItem('xmlCode', defaultScene);
}

let pythonEditor;

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
    pythonEditor = monaco.editor.create(document.getElementById('python-editor'), {
        value: '',
        language: 'python',
        theme: 'vs-dark',
        readOnly: true,
        automaticLayout: true
    });

    // Load XML content from cookie on page load
    let savedXml = localStorage.getItem('xmlCode');
    if (savedXml) {
        savedXml = decodeURIComponent(savedXml);

        try {
            let python_code = convert_xml(savedXml);
            xmlEditor.setValue(savedXml);
            pythonEditor.setValue(python_code);

        } catch (error) {
            console.error('XML Error:', error.message);
        }
    }

    // Function to handle XML changes
    xmlEditor.onDidChangeModelContent(function() {

        let xmlCode = xmlEditor.getValue();

        try {
            let python_code = convert_xml(xmlCode);
            pythonEditor.setValue(python_code);

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

        if (file) {
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
