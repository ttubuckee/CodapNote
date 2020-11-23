document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("show-btn");
    btn.addEventListener("click", getQuestions);
});

function getQuestions() {
    const ul = document.getElementById('ul-question-list');
    chrome.storage.sync.get(null, function (items) {
        const ul_length = ul.getElementsByTagName("li").length;
        if (ul_length === 0) {
            const keys = Object.keys(items);
            for (let key of keys) {
                addRow(key, items[key]);
            }
        }
    });

    function addRow(title, url) {
        console.log({title, url});
        const li = document.createElement("li");
        const a = document.createElement("a");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";

        li.classList.add("li-question");
        li.appendChild(checkbox);

        a.setAttribute("href", url);
        a.setAttribute("target", "_blank");
        a.innerHTML = title;

        li.appendChild(a);
        ul.appendChild(li);
    }
}