import {pythonEditor} from "./editors.js";

function copy_content() {
    if (pythonEditor) {
        navigator.clipboard.writeText(pythonEditor.getValue());
        console.log('Copied!');
    }
}

let copy_btn = document.getElementById('copy_btn');
if (copy_btn) {
    copy_btn.addEventListener('click', copy_content);
}
