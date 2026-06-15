let themeMode = window.matchMedia("(prefers-color-scheme:dark)");
window.addEventListener("DOMContentLoaded", () => {
  localStorageConfig();
  clearMemory();
  darkMode(themeMode.matches);
  localStorageConfig("post", "darkMode", themeMode.matches);
  TabBtn();
  ToDo();
  saveNote();
  getNote();
});
// localStorage
function localStorageConfig(mode, target, data) {
  switch (mode) {
    case "post":
      localStorage.setItem(target, JSON.stringify(data));
      break;
    case "get":
      const storedData = localStorage.getItem(target);
      if (storedData) {
        try {
          return JSON.parse(storedData);
        } catch (error) {
          console.error("Error parsing JSON data:", error);
          return [];
        }
      }
      return [];
    case "clear":
      localStorage.clear();
      break;
    default:
      let localStorageData = localStorage.getItem("configured");
      if (!localStorageData) {
        localStorage.clear();
        localStorage.setItem("configured", true);
        localStorage.setItem("note", []);
        localStorage.setItem(
          "tasks",
          JSON.stringify([
            {
              id: Date.now(),
              title: "Sample Task",
              checked: false,
            },
            {
              id: Date.now() + 1,
              title: "Checked Task",
              checked: true,
            },
          ])
        );
      }
      break;
  }
}
function clearMemory() {
  let btn = document.querySelector(".clear-memory");
  btn.addEventListener("click", () => {
    if (confirm("Clearing Memory\nAre you sure to clear all data from WorkState?")) {
      localStorageConfig("clear");
      if (confirm("After clearing Memory you must refresh your browser to configure again.")) location.reload();
    }
  });
}
// Theme
function darkMode(mode) {
  document.body.setAttribute("data-theme", mode ? "dark" : "light");
  document.querySelector(".theme-toggle").children[0].classList.add(mode ? "fa-moon" : "fa-sun-alt");
  document.querySelector(".theme-toggle").children[0].classList.remove(!mode ? "fa-moon" : "fa-sun-alt");
}
themeMode.addEventListener("change", () => {
  darkMode(themeMode.matches);
});
document.querySelector(".theme-toggle").addEventListener("click", () => {
  localStorageConfig("post", "darkMode", !localStorageConfig("get", "darkMode"));
  darkMode(localStorageConfig("get", "darkMode"));
});

// tabs

let openedTab = null;
let tabDeley = 150;

function TabBtn() {
  let tabBtns = [...document.querySelectorAll(".tab-toggle")];
  let closeBtns = [...document.querySelectorAll(".close-tab")];
  let tabs = [...document.querySelectorAll(".tab")];

  tabBtns.map((tabBtn) =>
    tabBtn.addEventListener("click", () => {
      if (openedTab != null) {
        if (openedTab !== null && openedTab === tabBtn.getAttribute("data-target")) {
          closeTabs();
          return;
        }
        document.querySelector(openedTab).classList.remove("visible");
        setTimeout(() => {
          document.querySelector(openedTab).classList.remove("active");
          document.querySelector(`button[data-target="${openedTab}"]`).classList.remove("active");
          openedTab = tabBtn.getAttribute("data-target");
          openTab();
        }, tabDeley);
      } else {
        openedTab = tabBtn.getAttribute("data-target");
        openTab();
      }
    })
  );
  closeBtns.map((closeBtn) => {
    closeBtn.addEventListener("click", closeTabs);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeTabs();
    }
  });
}

function openTab() {
  document.querySelector(openedTab).classList.add("active");
  setTimeout(() => document.querySelector(openedTab).classList.add("visible"), 0);
  document.querySelector(`button[data-target="${openedTab}"]`).classList.add("active");
}
function closeTabs() {
  document.querySelector(openedTab).classList.remove("visible");
  setTimeout(() => {
    document.querySelector(openedTab).classList.remove("active");
    document.querySelector(`button[data-target="${openedTab}"]`).classList.remove("active");
    openedTab = null;
  }, tabDeley);
}

// Todo List
function ToDo() {
  updateList();
  let btn = document.querySelector("#todo-add");
  btn.addEventListener("click", () => {
    addToDo(document.querySelector("#todo-input").value);
    updateList();
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      addToDo(document.querySelector("#todo-input").value);
      updateList();
    }
  });
}
function updateList() {
  let container = document.querySelector(".todo-list");
  container.innerHTML = "";
  toDoData = localStorageConfig("get", "tasks");
  let NoTask = document.createElement("li");
  NoTask.innerHTML = "All done, Good job :)";

  if (toDoData.length != 0) {
    toDoData.map((elem) => {
      let Task = document.createElement("li");
      Task.setAttribute("data-id", elem.id);
      if (elem.checked) Task.classList.add("checked");
      Task.innerHTML = `
     <input type="checkbox" onchange="editToDo('check', '${elem.id}')" ${elem.checked ? "checked" : ""}>
     <input type="text" value="${elem.title}" readonly dir='auto'/>
     <div>
       <button onclick="editToDo('edit title', ${elem.id})">
         <i class="fa fa-pencil-alt"></i>
       </button>
       <button class="delete-todo" onclick="delToDo(${elem.id})">
         <i class="fa fa-trash-alt"></i>
       </button>
     </div>
  `;
      container.appendChild(Task);
    });
  } else container.appendChild(NoTask);
}
function addToDo(taskTitle) {
  if (document.querySelector("#todo-input").value) {
    let toDoData = [{id: Date.now(), title: taskTitle, checked: false}];
    localStorageConfig("post", "tasks", [...toDoData, ...localStorageConfig("get", "tasks")]);
  }
  document.querySelector("#todo-input").value = "";
  document.querySelector("#todo-input").focus();
}
function editToDo(mode, id) {
  let data = localStorageConfig("get", "tasks");
  let Task = document.querySelector(`[data-id="${+id}"]`);
  let title;
  switch (mode) {
    case "check":
      data.forEach((elem) => {
        if (+elem.id === +id) {
          elem.checked = !elem.checked;
        }
      });

      localStorageConfig("post", "tasks", data);
      updateList();
      break;
    case "edit title":
      Task.children[1].removeAttribute("readonly");
      Task.children[2].children[0].innerHTML = '<i class="fa fa-check"></i>';
      Task.children[2].children[0].setAttribute("onclick", `editToDo('send edited title', ${id})`);
      break;
    case "send edited title":
      title = document.querySelector(`[data-id="${id}"]`).children[1].value;

      data.forEach((elem) => {
        if (+elem.id === +id) {
          elem.title = title;
        }
      });
      Task.children[1].setAttribute("readonly", "");
      Task.children[2].children[0].innerHTML = '<i class="fa fa-pencil-alt"></i>';
      Task.children[2].children[0].setAttribute("onclick", `editToDo('edit title', ${id})`);

      localStorageConfig("post", "tasks", data);
      break;
  }
}
function delToDo(id) {
  let data = localStorageConfig("get", "tasks");
  data = data.filter((elem) => elem.id != id);
  localStorageConfig("post", "tasks", data);
  updateList();
}

// Note
function saveNote() {
  var Note = document.querySelector(".note");
  Note.addEventListener("keyup", () => {
    localStorageConfig("post", "note", document.querySelector(".note").value);
  });
}
function getNote() {
  Note.value = localStorageConfig("get", "note");
}
