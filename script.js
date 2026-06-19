let themeMode = window.matchMedia("(prefers-color-scheme:dark)");
// localStorage
let storage = {
  init: () => {
    if (!storage.get("configured")) {
      localStorage.clear();
      localStorage.setItem("configured", true);
      localStorage.setItem("note", "Write some thing here...");
      localStorage.setItem("timer", "0");
      localStorage.setItem("savedTimer", "0");
      localStorage.setItem(
        "tasks",
        JSON.stringify([
          {
            id: Date.now(),
            title: "Sample Task",
            checked: false,
            editing: false,
          },
          {
            id: Date.now() + 1,
            title: "Checked Task",
            checked: true,
            editing: false,
          },
        ])
      );
    }
  },
  get: (target) => {
    const storedData = localStorage.getItem(target);
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (error) {
        console.error("Error parsing JSON data:", error);
        return undefined; // در صورت بروز خطا، مقدار undefined برمی‌گردد
      }
    }
    return null; // اگر داده‌ای وجود نداشته باشد، مقدار null برمی‌گردد
  },
  set: (target, data) => {
    localStorage.setItem(target, JSON.stringify(data));
  },
  clear: () => {
    localStorage.clear();
  },
};
// DOM
let DOM;
function DOMCache() {
  DOM = {
    toDo: {
      addBtn: document.querySelector("#todo-add"),
      input: document.querySelector("#todo-input"),
      list: document.querySelector(".todo-list"),
    },
    timer: {
      suggestionBtns: [...document.querySelectorAll(".timer-suggestion")],
      minInput: document.querySelector(".timer-input-min"),
      secInput: document.querySelector(".timer-input-sec"),
      playPauseBtn: document.querySelector(".playpause-btn"),
      resetBtn: document.querySelector(".reset-btn"),
      editBtn: document.querySelector(".edit-btn"),
    },
    note: document.querySelector(".note"),
    clearMemoryBtn: document.querySelector(".clear-memory"),
    toggleTheme: document.querySelector(".theme-toggle"),
    tab: {
      tabBtns: [...document.querySelectorAll(".tab-toggle")],
      closeBtns: [...document.querySelectorAll(".close-tab")],
      tabs: [...document.querySelectorAll(".tab")],
    },
  };
}
// state
let state;
function getState() {
  state = {
    timerRunning: false,
    editingTimer: false,
    openedTab: null,
    configured: storage.get("configured"),
    darkMode: storage.get("darkMode"),
    note: storage.get("note"),
    timer: storage.get("timer"),
    savedTimer: storage.get("savedTimer"),
    tasks: storage.get("tasks"),
  };
}

function setState(key, data) {
  state[key] = data;
  storage.set(key, data);
}

DOMCache();
function clearMemory() {
  DOM.clearMemoryBtn.addEventListener("click", () => {
    if (confirm("Clearing Memory\nAre you sure to clear all data from WorkState?")) {
      storage.clear();
      if (confirm("After clearing Memory you must refresh your browser to configure again.")) location.reload();
    }
  });
}
// Theme
function darkMode(mode) {
  document.body.setAttribute("data-theme", mode ? "dark" : "light");
  DOM.toggleTheme.children[0].classList.add(mode ? "fa-moon" : "fa-sun-alt");
  DOM.toggleTheme.children[0].classList.remove(!mode ? "fa-moon" : "fa-sun-alt");
  setState("darkMode", mode);
}
themeMode.addEventListener("change", () => {
  darkMode(themeMode.matches);
});
DOM.toggleTheme.addEventListener("click", () => {
  setState("darkMode", !state.darkMode);
  darkMode(state.darkMode);
});

// tabs

let tabDeley = 150;

function TabBtn() {
  DOM.tab.tabBtns.map((tabBtn) =>
    tabBtn.addEventListener("click", () => {
      if (state.openedTab != null) {
        if (state.openedTab !== null && state.openedTab === tabBtn.getAttribute("data-target")) {
          closeTabs();
          return;
        }
        document.querySelector(state.openedTab).classList.remove("visible");
        setTimeout(() => {
          document.querySelector(state.openedTab).classList.remove("active");
          document.querySelector(`button[data-target="${state.openedTab}"]`).classList.remove("active");
          state.openedTab = tabBtn.getAttribute("data-target");
          openTab();
        }, tabDeley);
      } else {
        state.openedTab = tabBtn.getAttribute("data-target");
        openTab();
      }
    })
  );
  DOM.tab.closeBtns.map((closeBtn) => {
    closeBtn.addEventListener("click", closeTabs);
  });
  DOM.tab.tabs.map((tab) =>
    tab.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeTabs();
      }
    })
  );
}

function openTab() {
  document.querySelector(state.openedTab).classList.add("active");
  setTimeout(() => document.querySelector(state.openedTab).classList.add("visible"), 0);
  document.querySelector(`button[data-target="${state.openedTab}"]`).classList.add("active");
}
function closeTabs() {
  document.querySelector(state.openedTab).classList.remove("visible");
  setTimeout(() => {
    document.querySelector(state.openedTab).classList.remove("active");
    document.querySelector(`button[data-target="${state.openedTab}"]`).classList.remove("active");
    state.openedTab = null;
  }, tabDeley);
}

// Todo List
function ToDo() {
  updateList();
  DOM.toDo.addBtn.addEventListener("click", () => {
    addToDo(DOM.toDo.input.value);
    updateList();
  });
  DOM.toDo.input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      addToDo(DOM.toDo.input.value);
      updateList();
    }
  });
  DOM.toDo.list.addEventListener("click", handleTodoClick);
  DOM.toDo.list.addEventListener("change", handleTodoChange);
}
function handleTodoClick(e) {
  const task = e.target.closest("li");

  if (!task) return;

  const id = Number(task.dataset.id);

  if (e.target.closest(".delete-todo")) {
    delToDo(id);
  }

  if (e.target.closest(".edit-todo")) {
    editToDo(id);
  }
}
function handleTodoChange(e) {
  if (!e.target.matches("[type='checkbox']")) return;

  const id = Number(e.target.closest("li").dataset.id);

  checkToDo(id);
}
function updateList() {
  DOM.toDo.list.innerHTML = "";
  let toDoData = [...state.tasks];

  toDoData.sort((a, b) => a.checked - b.checked);

  let NoTask = document.createElement("li");
  NoTask.innerHTML = "All done, Good job :)";

  if (toDoData.length != 0) {
    toDoData.map((elem) => {
      let Task = document.createElement("li");
      Task.setAttribute("data-id", elem.id);
      if (elem.checked) Task.classList.add("checked");
      Task.innerHTML = `
     <input type="checkbox" ${elem.checked ? "checked" : ""}>
     <input type="text" value="${elem.title}" ${elem.editing ? "" : "readonly"} dir='auto'/>
     <div>
       <button class="edit-todo">
         <i class="fa ${elem.editing ? "fa-check" : "fa-pencil-alt"}"></i>
       </button>
       <button class="delete-todo">
         <i class="fa fa-trash-alt"></i>
       </button>
     </div>
  `;
      DOM.toDo.list.appendChild(Task);
    });
  } else DOM.toDo.list.appendChild(NoTask);
}
function addToDo(taskTitle) {
  if (DOM.toDo.input.value) {
    let toDoData = [{id: Date.now(), title: taskTitle, checked: false, editing: false}];
    setState("tasks", [...toDoData, ...state.tasks]);
  }
  DOM.toDo.input.value = "";
  DOM.toDo.input.focus();
}
function checkToDo(id) {
  let data = state.tasks;

  data.forEach((elem) => {
    if (elem.id == id) {
      elem.checked = !elem.checked;
    }
  });

  setState("tasks", data);
  updateList();
}

function editToDo(id) {
  let data = state.tasks;

  data.forEach((elem) => {
    if (elem.id == id) {
      if (elem.editing) {
        elem.editing = false;
        elem.title = document.querySelector(`[data-id='${id}']`).children[1].value;
      } else elem.editing = true;
    }
  });
  setState("tasks", data);
  updateList();
}

function delToDo(id) {
  let data = state.tasks;
  data = data.filter((elem) => elem.id != id);
  setState("tasks", data);
  updateList();
}

// Timer
let timerInterval;
let seconds;
let minutes;
function Timer() {
  DOM.timer.suggestionBtns.map((btn) => {
    btn.addEventListener("click", () => {
      state.editingTimer = false;
      clearInterval(timerInterval);
      setState(
        "timer",
        (btn.getAttribute("data-time-minute") == null ? 0 : btn.getAttribute("data-time-minute")) * 60 + (btn.getAttribute("data-time-second") == null ? 0 : btn.getAttribute("data-time-second"))
      );
      setState(
        "savedTimer",
        (btn.getAttribute("data-time-minute") == null ? 0 : btn.getAttribute("data-time-minute")) * 60 + (btn.getAttribute("data-time-second") == null ? 0 : btn.getAttribute("data-time-second"))
      );

      DOM.timer.minInput.value = Math.floor(state.timer / 60).toString().length < 2 ? "0" + Math.floor(state.timer / 60) : Math.floor(state.timer / 60);
      DOM.timer.secInput.value = (state.timer % 60).toString().length < 2 ? "0" + (state.timer % 60) : state.timer % 60;
    });
  });
  DOM.timer.playPauseBtn.addEventListener("click", () => {
    if (state.timerRunning) {
      pauseTimer();
    } else {
      playTimer();
    }
  });
  DOM.timer.resetBtn.addEventListener("click", resetTimer);
  DOM.timer.editBtn.addEventListener("click", editTimer);
}
function playTimer() {
  clearInterval(timerInterval);
  if (state.timer != 0) {
    DOM.timer.playPauseBtn.innerHTML = `<i class="fa fa-pause"></i>`;
    timerInterval = setInterval(() => {
      seconds = state.timer;
      if (seconds != 0) {
        minutes = Math.floor(seconds / 60);
        seconds = seconds - minutes * 60;
        DOM.timer.minInput.value = minutes.toString().length < 2 ? `0${minutes}` : minutes;
        DOM.timer.secInput.value = seconds.toString().length < 2 ? `0${seconds}` : seconds;
        setState("timer", +state.timer - 1);
      } else {
        pauseTimer();
        DOM.timer.minInput.value = "00";
        DOM.timer.secInput.value = "00";
      }
    }, 1000);
    state.timerRunning = true;
  }
}
function pauseTimer() {
  DOM.timer.playPauseBtn.innerHTML = `<i class="fa fa-play"></i>`;
  clearInterval(timerInterval);
  state.timerRunning = false;
}
function resetTimer() {
  if (state.editingTimer) return;
  pauseTimer();
  setState("timer", state.savedTimer);
  DOM.timer.minInput.value = Math.floor(state.timer / 60).toString().length < 2 ? "0" + Math.floor(state.timer / 60) : Math.floor(state.timer / 60);
  DOM.timer.secInput.value = (state.timer % 60).toString().length < 2 ? "0" + (state.timer % 60) : state.timer % 60;
}
function editTimer() {
  if (state.editingTimer) {
    DOM.timer.editBtn.innerHTML = '<i class="fa fa-pencil-alt"></i>';
    minutes = +DOM.timer.minInput.value;
    seconds = +DOM.timer.secInput.value;
    setState("timer", minutes * 60 + seconds);
    setState("savedTimer", minutes * 60 + seconds);
    DOM.timer.minInput.setAttribute("readonly", "");
    DOM.timer.secInput.setAttribute("readonly", "");
    state.editingTimer = false;
  } else {
    state.editingTimer = true;
    pauseTimer();
    DOM.timer.editBtn.innerHTML = '<i class="fa fa-check"></i>';

    DOM.timer.minInput.removeAttribute("readonly");
    DOM.timer.secInput.removeAttribute("readonly");
  }
}

// Note
function saveNote() {
  DOM.note.addEventListener("keyup", () => {
    setState("note", DOM.note.value);
  });
}
function getNote() {
  DOM.note.value = state.note ? state.note : "";
}

//
//
window.addEventListener("DOMContentLoaded", () => {
  storage.init();
  clearMemory();
  getState();
  darkMode(state.darkMode ?? themeMode.matches);
  TabBtn();
  ToDo();
  Timer();
  saveNote();
  getNote();
});
