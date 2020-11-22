const top_nav = document.querySelector("body > div.navbar.navbar-dark.navbar-expand-lg.navbar-application.navbar-breadcrumb > div.navbar-collapse.collapse");
const input_wrapper = document.createElement("div");
const input_h = document.createElement("input");
const input_m = document.createElement("input");
const input_s = document.createElement("input");
const clock = document.createElement("div");
const action_btn = document.createElement("button");
const timer = new Timer();

const input_arr = [input_h, input_m, input_s];
const elements = [...input_arr, clock, action_btn];

init();

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
    }
    this.resetClock = () => {
        this.clock.innerHTML = '';
    }
    this.checkValue = () => {
        const result =  input_arr.reduce((acc,cur)=>acc && this.isNumber(cur));
        console.log({result});
        return result;
    }
    this.isNumber = (num) => {
        return typeof parseInt(num) === 'number';
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
        action_btn.innerHTML = "중지";
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
    action_btn.onclick = startTimer;
    action_btn.style.marginLeft = "5px";

    input_h.setAttribute('placeholder', '시간');
    input_m.setAttribute('placeholder', '분');
    input_s.setAttribute('placeholder', '초');
    input_arr.forEach(e => e.setAttribute('size', '4'));

    clock.setAttribute('display', 'none');
    clock.style.color = "white";
    clock.style.fontWeight = "bold";

    appendElementsToWrapper(elements);

    input_wrapper.style.display = "flex";
    input_wrapper.style.flexDirection = "row";
    input_wrapper.style.margin = "2px 5px 2px 5px";

    top_nav.appendChild(input_wrapper);
    timer.setInput(input_h, input_m, input_s);
    timer.setClock(clock);

    window.onload = ()=>input_h.focus();
}