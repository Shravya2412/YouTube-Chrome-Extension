// import jsPDF from 'jspdf';
const btn = document.getElementById("summarise");
const download = document.getElementById("download");
var language = ""
var dataoriginal = ""
btn.addEventListener("click", function() {
    btn.disabled = true;
    btn.innerHTML = "Summarising...";
    download.disabled = true;
    const selectedRadioButton = document.querySelector('input[name="language"]:checked');
    const selectedValue = selectedRadioButton.value;
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        var url = tabs[0].url;
        console.log(url);
        fetch('http://127.0.0.1:5000/summary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "url": url,
                "language": selectedValue
            })
        }).then(response => response.json())
            .then(data => {
                console.log(data);
                const p = document.getElementById("output");
                p.innerText = data.summary;
                dataoriginal = data.summary;
                language = selectedValue;
                btn.disabled = false;
                download.disabled = false;
                btn.innerHTML = "Summarise";
            });
    });

    //     xhr.onload = function() {
    //         var text = xhr.responseText;
    //         const p = document.getElementById("output");
    //         p.innerHTML = text;
    //         btn.disabled = false;
    //         download.disabled = false;
    //         btn.innerHTML = "Summarise";
    //     }
    //     xhr.send();
    // });
});

//Document File
download.addEventListener('click', function () {
    // const p = document.getElementById("output");
    // const textContent = p.textContent;

    // Create a Blob with text content and set MIME type to docx
    var blob;
    if(language == "english")
    blob = new Blob([dataoriginal], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    else
    blob = new Blob([dataoriginal], { type: 'text/plain' });
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create an anchor element for downloading
    const anchor = document.createElement('a');
    anchor.href = url;
    if(language == "english")
    anchor.download = 'summary.doc'; // Use .docx extension
    else
    anchor.download = 'summary.txt'; // Use .txt extension
    // Trigger a click event to initiate the download
    anchor.dispatchEvent(new MouseEvent('click'));

    // Revoke the Blob URL to release resources
    URL.revokeObjectURL(url);
});

//Text File


// download.addEventListener('click', function () {
    //     const p = document.getElementById("output");
//     const textContent = p.textContent;
//     const blob = new Blob([textContent], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const anchor = document.createElement('a');
//     anchor.href = url;
//     anchor.download = 'summary.txt'; 
//     anchor.click();
//     URL.revokeObjectURL(url);
// });
