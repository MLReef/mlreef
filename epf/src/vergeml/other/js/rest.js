var hamburger = document.getElementById("hamburger");
var overlay = document.getElementById("overlay");
var sidebar = document.getElementsByClassName("sidebar")[0];
var form = document.getElementById("main-form");

hamburger.onclick = function(e) {
    sidebar.className = "sidebar open";
    overlay.style.display = "block";
};

overlay.onclick = function(e) {
    if (overlay.style.display == "block") {
        overlay.style.display = "none";
        sidebar.className = "sidebar";
    }
};

var timer = null;
var start = null;

function updateMs() {
    var now = +new Date();
    var diff = Math.round((now - start) / 100) * 100;
    document.getElementById("time").innerText = "TIME " + diff +"ms"
}


function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}


function ajaxPost (form, callback) {
    document.getElementById("submit-button").disabled = true;
    
    
    var url = form.action;
    
    var formData = new FormData();
    

    for (var i = 0; i < form.elements.length; i++) {
        var el = form.elements[i];
        
        if ((el.tagName !== "INPUT" && el.tagName !== "TEXTAREA" && el.tagName !== "SELECT") || el.type == 'submit') {
            continue;
        }

        if (el.type == 'file') {
            for(var j= 0; j < el.files.length; j++) {
                formData.append(el.name, el.files[j])
            }
        } else {
            formData.append(el.name, el.value)
        }
    }

    fetch(url, {
        method: 'POST',
        body: formData
    }).then(response => {
        clearTimeout(timer);
        document.getElementById("submit-button").disabled = false;
        if (response.status == 200) {
            document.getElementById("status-ok").style.display = 'inline';
            document.getElementById("status-ok").innerText = 'STATUS ' + response.status + " " + response.statusText;
            response.text().then(function (text) {
                var resContainer = document.getElementsByClassName("json")[0];
                // decode encode to pretty print
                text = JSON.stringify(JSON.parse(text), undefined, 2);
                resContainer.innerHTML = syntaxHighlight(text);
            });
        } else {
            var message = response.status + " " + response.statusText;
            document.getElementById("status-err").style.display = 'inline';
            document.getElementById("status-err").innerText = 'STATUS ' + message;
            response.text().then(function (text) {
                var resContainer = document.getElementsByClassName("json")[0];
                resContainer.innerText = "Error: " + message + "\n\nResponse Text:\n" + text;
            });
        }
        console.log(response);
    });
}

if (form) {
    form.onsubmit = function(e) {
        e.preventDefault();
        e.stopPropagation();


        start = +new Date();
        timer = window.setInterval(updateMs, 100);

        document.getElementById("B").className = "column open";
        document.getElementById("time").innerText = "TIME 0ms";
        document.getElementById("status-ok").style.display = 'none';
        document.getElementById("status-err").style.display = 'none';
        ajaxPost(form, null);

        return false;
    }
}

function updateFileInput(name) {

    console.log(name);
    var input = document.getElementById('__' + name + '_input__');

    res = [];
    for(var i = 0; i < input.files.length; i++) {
        var file = input.files[i];
        res.push(file.name)
    }

    var label = document.getElementById('__' + name + '_label__');
    if(res.length == 0) {
        if (input.multiple) {
            label.innerText = "Select files..."
        } else {
            label.innerText = "Select file..."
        }
    } else {
        var firstFile = res[0];
        if (firstFile.length > 15) {
            firstFile = firstFile.substring(0,15)
        }

        if (res.length == 1) {
            label.innerText = firstFile
        } else {
            label.innerText = firstFile + " and " + (res.length - 1) + " more"
        }
    }
}
