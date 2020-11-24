document.addEventListener("DOMContentLoaded", function () {
    const delete_btn = document.getElementById("delete-btn");
    const select_btn = document.getElementById("select-all-btn");

    delete_btn.addEventListener("click", deleteCheckedList);
    select_btn.addEventListener("click", selectAll);
    getQuestions();
});

function selectAll() {
    const btn = document.getElementById("select-all-btn");
    if (btn.alt === "체크") {
        btn.innerHTML = "모두 선택";
        btn.alt = "!체크";
        document.querySelectorAll('.check-item').forEach((e, k, p) => {
            e.checked = false;
        });
    } else {
        btn.innerHTML = "모두 해제";
        btn.alt = "체크";
        document.querySelectorAll('.check-item').forEach((e, k, p) => {
            e.checked = true;
        });
    }

}

function deleteCheckedList() {
    const result = confirm("선택 목록을 삭제하시겠습니까?");

    if (result) {
        const ul = document.getElementById("ul-question-list");
        const li_list = ul.children;
        const delete_list = [];
        const ul_delete_list = [];

        for (let i = 0; i < li_list.length; i++) { // remove 되면서 index가 하나씩 떨어졌고, 그래서 length가 3인 상황에서도 2개밖에 못 지웠던 것이다.
            if (li_list[i].firstChild.checked) {
                delete_list.push(li_list[i].lastChild.textContent);
                ul_delete_list.push(i);
            }
        }
        deleteLi(ul_delete_list);
        chrome.storage.sync.remove(delete_list,function(){
            alert('삭제되었습니다.');
        });
    } else {
        alert("취소 되었습니다.");
    }
}
function deleteLi(arr){
    const ul = document.getElementById("ul-question-list");
    let li = document.getElementsByClassName("li-question");

    for(let i=0;i<arr.length;++i){
        if(arr.includes(li[i].getAttribute("value"))){
            ul.removeChild(li[i]);
        }
    }
}

function getQuestions() {
    const ul = document.getElementById('ul-question-list');

    document.getElementById("delete-btn").classList.remove("invisible-btn");
    document.getElementById("select-all-btn").classList.remove("invisible-btn");

    chrome.storage.sync.get(null, function (items) {
        const ul_length = ul.getElementsByTagName("li").length;
        let idx = -1;
        if (ul_length === 0) {
            const keys = Object.keys(items);
            for (let key of keys) {
                addRow(key, items[key],++idx);
            }
        }
    });

    function addRow(title, url, idx) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.classList.add("check-item");

        li.classList.add("li-question");
        li.appendChild(checkbox);
        li.value = idx;

        a.setAttribute("href", url);
        a.setAttribute("target", "_blank");
        a.innerHTML = title;

        li.appendChild(a);
        ul.appendChild(li);
    }
}
