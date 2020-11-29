import swal from 'sweetalert';

let settings;
let goto_url;
let top_nav;
let input_wrapper;
let input_h;
let input_m;
let input_s;
let clock;
let action_btn;
let star;
let timer;
let input_arr;
let elements;

init();

function requestPermission() {
    if (window.Notification) {
        Notification.requestPermission();
    }
}

function notify() {
    const notification = new Notification('시간 종료 알림', {
        icon: chrome.extension.getURL("/src/img/timer_icon.png"),
        body: '정해진 시간이 되어 알람이 종료되었습니다.',
    });
    // notification.onclick = function () {
    //     window.open(goto_url);
    // };
}

function getSelectorFromURL(cur_url) {
    // const base_urls = [
    //     {"https://programmers.co.kr/": "body > div.navbar.navbar-dark.navbar-expand-lg.navbar-application.navbar-breadcrumb > div.navbar-collapse.collapse"},
    //     {"https://www.hackerrank.com/": ".toolbar-left"}
    // ];
    // for (let url_obj of base_urls) {
    //     const key = Object.keys(url_obj);
    //     if (cur_url.includes(key[0])) {
    //         cur_location = key[0];
    //         return url_obj[key];
    //     }
    // }
    const base_urls = [
        {
            "https://programmers.co.kr/": {
                "clock_color": "white",
                "url": "https://programmers.co.kr/",
                "title_selector": "body > div.navbar.navbar-dark.navbar-expand-lg.navbar-application.navbar-breadcrumb > ol > li.active",
                "nav_selector": "body > div.navbar.navbar-dark.navbar-expand-lg.navbar-application.navbar-breadcrumb > div.navbar-collapse.collapse"
            }
        },
        {
            "https://www.hackerrank.com/": {
                "clock_color": "black",
                "url": "https://www.hackerrank.com/",
                "title_selector": "#content > div > div > div > header > div > div > div.community-header-breadcrumb-items > div > h1 > div > h1",
                "nav_selector": ".toolbar-left"
            }
        },
        {
            "https://www.acmicpc.net/": {
                "clock_color": "black",
                "url": "https://www.acmicpc.net/",
                "title_selector": "#problem_title",
                "nav_selector": ".page-header"
            }
        }
    ];

    for (let setting_obj of base_urls) {
        const urls = Object.keys(setting_obj);
        for (let url of urls) {
            if (cur_url.includes(url)) {
                settings = setting_obj[url];
                return setting_obj[url]['nav_selector'];
            }
        }
    }
}

function removeUnStaredQuestion(title) {
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
    const title = document.querySelector(settings["title_selector"]).textContent;
    chrome.storage.sync.get(null, function (items) {
        const keys = Object.keys(items);
        keys.includes(title) ? checkStar(true) : checkStar(false);
    });
}

function appendElementsToWrapper(elements) {
    for (let element of elements) {
        input_wrapper.appendChild(element);
    }
    top_nav.appendChild(input_wrapper);
    timer.setInput(input_h, input_m, input_s);
    timer.setClock(clock);
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
            // sendMessageToBackGround();
            notify();
            this.stop();
            if (Notification.permission === 'granted') {
                swal({
                    title: "종료!",
                    text: "고생하셨습니다",
                    icon: "success",
                    buttons: "확인"
                });
            } else {
                const span = document.createElement("span");
                span.innerHTML = "고생하셨습니다<br>(현재 사이트에서 알림 설정이 차단되어<br>푸시 알림이 가지않습니다.<br>푸시 알림을 허용해주세요.)",
                    // swal({
                    //     title: "종료!",
                    //     content: span,
                    //     //text: "고생하셨습니다<br/>(알림 설정이 차단되어 푸시 알림이 가지않습니다.<br/>푸시 알림을 허용해주세요.)",
                    //     icon: "success",
                    //     buttons: "확인"
                    // });
                swal({
                    title: "종료",
                    content: span,
                    icon: "success",
                    buttons: ["푸시 알림 설정", "확인"]
                }).then((confirm) => {
                    if (confirm) {

                    } else {
                        requestPermission();
                    }
                });
            }
        } else {
            this.RemainDate -= 1000;
        }
    }
    this.start = () => {
        if (!this.checkValue()) {
            this.resetInput();
            swal('정상적인 값을 입력해주세요!');
        } else {
            goto_url = location.href;
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
        return input_arr.reduce((acc, cur) => acc && (this.isNumber(cur.value) || cur.value === ""), this.isNumber(input_arr[0].value));
    }
    this.isNumber = (num) => {
        const regex = /^[0-9]+$/;
        return regex.test(num);
    }
}

function startTimer() {
    if (timer.isStart) { // 타이머가 실행중일 경우
        swal({
            title: "타이머가 실행중입니다.\n초기화 하시겠습니까?",
            text: "'예' 를 누르시면 타이머가 초기화 됩니다.",
            icon: "warning",
            buttons: ["아니오", "예"],
            dangerMode: true
        }).then((willDelete) => {
            if (willDelete) {
                timer.stop();
                action_btn.innerHTML = "시작";
            }
        });
    } else { // 타이머가 실행중이 아닐 경우
        const h = input_h.value = input_h.value === '' ? 0 : input_h.value;
        const m = input_m.value = input_m.value === '' ? 0 : input_m.value;
        const s = input_s.vaule = input_s.value === '' ? 0 : input_s.value;
        timer.setBtn(action_btn);
        timer.setTime(h, m, s);
        timer.start();
    }
}

function createElements() {
    top_nav = document.querySelector(getSelectorFromURL(location.href));
    input_wrapper = document.createElement("div");
    input_h = document.createElement("input");
    input_m = document.createElement("input");
    input_s = document.createElement("input");
    clock = document.createElement("div");
    action_btn = document.createElement("button");
    star = document.createElement("img");
}

function setElementsStyle() {
    //input_wrapper
    input_wrapper.style.display = "flex";
    input_wrapper.style.flexDirection = "row";
    input_wrapper.style.margin = "2px 5px 2px 5px";
    input_wrapper.style.alignItems = "center";

    //clock
    clock.style.marginRight = "5px";
    clock.style.color = settings['clock_color'];//"white";
    clock.style.fontWeight = "bold";

    //star
    star.style.width = "20px";
    star.style.height = "20px";
    star.style.marginRight = "10px";

    //action_btn
    action_btn.innerHTML = "시작";
    action_btn.style.backgroundColor = '#0078FF';
    action_btn.style.color = 'white';
    action_btn.style.fontWeight = 'bold';
    action_btn.style.padding = "5px";
    action_btn.style.marginLeft = "5px";
    action_btn.style.border = "2px solid #0078FF";
    action_btn.style.borderRadius = '3px'; // standard
    action_btn.style.MozBorderRadius = '3px'; // Mozilla
}

function setAttributes() {
    input_h.setAttribute('placeholder', '시간');
    input_m.setAttribute('placeholder', '분');
    input_s.setAttribute('placeholder', '초');

    clock.setAttribute('display', 'none');

    action_btn.setAttribute('id', 'action-btn');
}

function init() {
    createElements();
    setElementsStyle();
    setAttributes();

    star.addEventListener("click", () => {
        const url = window.location.href;
        const title = document.querySelector(settings["title_selector"]).textContent;

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

    timer = new Timer();
    input_arr = [input_h, input_m, input_s];
    elements = [star, ...input_arr, clock, action_btn];

    action_btn.onclick = startTimer;

    input_arr.forEach(e => {
        e.style.borderRadius = '3px';
        e.style.MozBorderRadius = '3px';
        e.setAttribute('size', '4');
        e.style.padding = '5px';
    });

    if(settings["url"] === "https://www.hackerrank.com/"){
        const mutation = new MutationObserver(()=>{
            top_nav = document.querySelector(getSelectorFromURL(location.href));
            if (top_nav) {
                appendElementsToWrapper(elements);
                input_h.focus();
                isFavor();
                mutation.disconnect();
            } else {
                console.log('시도중...');
            }
        });
        mutation.observe(document.querySelector('.hr-monaco-editor-wrapper'),{childList:true});
    }else {
        top_nav = document.querySelector(getSelectorFromURL(location.href));
        appendElementsToWrapper(elements);
        input_h.focus();
        isFavor();
    }

    requestPermission();
}

function addUnsolvedQuestions(key, value) {
    let item = {};  // 추가할 항목들
    item[key] = value;
    chrome.storage.sync.get(null, function (items) {
        const keys = Object.keys(items);
        if (!keys.includes(key)) {
            chrome.storage.sync.set(item, function () {

            });
        }
    });
}



