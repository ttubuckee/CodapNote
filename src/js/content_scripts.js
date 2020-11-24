const top_nav = document.querySelector("body > div.navbar.navbar-dark.navbar-expand-lg.navbar-application.navbar-breadcrumb > div.navbar-collapse.collapse");
const input_wrapper = document.createElement("div");
const input_h = document.createElement("input");
const input_m = document.createElement("input");
const input_s = document.createElement("input");
const clock = document.createElement("div");
const action_btn = document.createElement("button");
const star = document.createElement("img");
star.style.width = "20px";
star.style.height = "20px";
star.style.marginRight = "10px";
star.addEventListener("click", () => {
    const url = window.location.href;
    const title = document.querySelector('body > div.navbar.navbar-dark.navbar-expand-lg.navbar-application.navbar-breadcrumb > ol > li.active').textContent;

    if (star.alt === "unstar") {
        star.alt = "star";
        star.src = chrome.extension.getURL("/src/img/Star.png?time=") + new Date().getTime();
        addUnsolvedQuestions(title, url);
    } else {
        star.alt = "unstar";
        star.src = chrome.extension.getURL("/src/img/unStar.png?time=") + new Date().getTime();
        // remove from list
        removeUnStaredQuestion(title);
    }
});

const timer = new Timer();

const input_arr = [input_h, input_m, input_s];
const elements = [star, ...input_arr, clock, action_btn];
init();

function removeUnStaredQuestion(title){
    chrome.storage.sync.remove(title);
}
function checkStar(check) {
    if (check) {
        // 별을 색칠
        star.alt = "star";
        star.src = chrome.extension.getURL("/src/img/Star.png?time=") + new Date().getTime();
    } else {
        // 별을 빈칸으로
        star.alt = "unstar";
        star.src = chrome.extension.getURL("/src/img/unStar.png?time=") + new Date().getTime();
    }
}

function isFavor() {
    const title = document.querySelector('body > div.navbar.navbar-dark.navbar-expand-lg.navbar-application.navbar-breadcrumb > ol > li.active').textContent;
    chrome.storage.sync.get(null, function (items) {
        console.log({items});
        const keys = Object.keys(items);
        if (keys.includes(title)) checkStar(true);
        else checkStar(false);
        // for (let key of keys) {
        //     if (key === title) {
        //         checkStar(true);
        //         return;
        //     }
        //     checkStar(false);
        // }
    });
}

function appendElementsToWrapper(elements) {
    for (let element of elements) {
        input_wrapper.appendChild(element);
    }
}

function Timer() {
    this.isStart = false;
    this.setInput = (h, m, s) => {
        this.input_h = h;
        this.input_m = m;
        this.input_s = s;
    }
    this.setClock = (clock) => {
        this.clock = clock;
    }
    this.setTime = (h, m, s) => {
        this.start_time = new Date();
        this.end_time = new Date(this.start_time);
        this.end_time.setHours(this.end_time.getHours() + parseInt(h));
        this.end_time.setMinutes(this.end_time.getMinutes() + parseInt(m));
        this.end_time.setSeconds(this.end_time.getSeconds() + parseInt(s));
        this.RemainDate = this.end_time - this.start_time;
    }
    this.getTime = () => {
        return {
            h: this.h,
            m: this.m,
            s: this.s
        };
    }
    this.showInput = () => {
        this.input_h.style.display = 'block';
        this.input_m.style.display = 'block';
        this.input_s.style.display = 'block';
    }
    this.hideInput = () => {
        this.input_h.style.display = 'none';
        this.input_m.style.display = 'none';
        this.input_s.style.display = 'none';
    }
    this.hideClock = () => {
        clock.style.display = 'none';
    }
    this.showClock = () => {
        clock.style.display = 'block';
    }
    this.updateClock = () => {
        let hours = Math.floor((this.RemainDate % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((this.RemainDate % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((this.RemainDate % (1000 * 60)) / 1000);

        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        this.clock.innerHTML = hours + " : " + minutes + " : " + seconds;

        if (this.RemainDate < 0) {
            this.stop();
            alert("종료");
        } else {
            this.RemainDate -= 1000;
        }
    }
    this.start = () => {
        if (!this.checkValue()) {
            this.resetInput();
            alert('정상적인 값을 입력해주세요!');
        } else {
            this.btn.innerHTML = "중지";
            this.isStart = true;
            this.interval = setInterval(this.updateClock, 1000);
            this.resetInput();
            this.hideInput();
            this.showClock();
        }
    }
    this.stop = () => {
        this.btn.innerHTML = "시작";
        this.isStart = false;
        clearInterval(this.interval);
        this.resetClock();
        this.hideClock();
        this.showInput();
        input_h.focus();
    }
    this.setBtn = (btn) => {
        this.btn = btn;
    }
    this.resetInput = () => {
        this.input_h.value = '';
        this.input_m.value = '';
        this.input_s.value = '';
        input_h.focus();
    }
    this.resetClock = () => {
        this.clock.innerHTML = '';
    }
    this.checkValue = () => {
        return input_arr.reduce((acc, cur) => acc && this.isNumber(cur.value));
    }
    this.isNumber = (num) => {
        const regex = /^[0-9]+$/;
        return regex.test(num);
    }
}

function startTimer() {
    if (timer.isStart) { // 타이머가 실행중일 경우
        const result = confirm("타이머가 실행중입니다. 초기화 하시겠습니까?");
        if (result) {
            timer.stop();
            action_btn.innerHTML = "시작";
        }
    } else { // 타이머가 실행중이 아닐 경우
        const h = input_h.value;
        const m = input_m.value;
        const s = input_s.value;
        timer.setBtn(action_btn);
        timer.setTime(h, m, s);
        timer.start();
    }
}

function init() {
    action_btn.innerHTML = "시작";
    action_btn.style.backgroundColor = '#0078FF';
    action_btn.style.color = 'white';
    action_btn.style.fontWeight = 'bold';
    action_btn.style.padding = "5px";
    action_btn.style.marginLeft = "5px";
    action_btn.style.border = "2px solid #0078FF";
    action_btn.style.borderRadius = '3px'; // standard
    action_btn.style.MozBorderRadius = '3px'; // Mozilla

    action_btn.onclick = startTimer;

    input_h.setAttribute('placeholder', '시간');
    input_m.setAttribute('placeholder', '분');
    input_s.setAttribute('placeholder', '초');
    input_arr.forEach(e => {
        e.style.borderRadius = '3px';
        e.style.MozBorderRadius = '3px';
        e.setAttribute('size', '4');
        e.style.padding = '5px';
    });

    clock.setAttribute('display', 'none');
    clock.style.color = "white";
    clock.style.fontWeight = "bold";

    appendElementsToWrapper(elements);

    input_wrapper.style.display = "flex";
    input_wrapper.style.flexDirection = "row";
    input_wrapper.style.margin = "2px 5px 2px 5px";
    input_wrapper.style.alignItems = "center";

    top_nav.appendChild(input_wrapper);
    timer.setInput(input_h, input_m, input_s);
    timer.setClock(clock);

    window.onload = () => input_h.focus();
    isFavor();
}

function addUnsolvedQuestions(key, value) {
    let item = {};  // 추가할 항목들
    item[key] = value;
    chrome.storage.sync.get(null, function (items) {
        const keys = Object.keys(items);
        if (!keys.includes(key)) {
            chrome.storage.sync.set(item, function () {
                console.log({item});
            });
        }
    });
}



