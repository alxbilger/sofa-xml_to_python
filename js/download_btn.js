import {pythonEditor} from "./editors.js";

function download_file() {
    if (pythonEditor) {
        console.log("Downloading file...");
        const filename = 'simulation.py';
        const text = pythonEditor.getValue();

        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
}

let download_btn = document.getElementById('download_btn');
if (download_btn) {
    download_btn.addEventListener('click', download_file);
}



