let themeMode = window.matchMedia("(prefers-color-scheme:dark)");
window.addEventListener("DOMContentLoaded", () => {
  darkMode(themeMode.matches);
  TabBtn();
});
// Theme
function darkMode(mode) {
  document.body.setAttribute("data-theme", mode ? "dark" : "light");
  window.localStorage.setItem("theme", mode ? "dark" : "light");
  document.querySelector(".theme-toggle").children[0].classList.add(mode ? "fa-moon" : "fa-sun-alt");
  document.querySelector(".theme-toggle").children[0].classList.remove(!mode ? "fa-moon" : "fa-sun-alt");
}
themeMode.addEventListener("change", () => {
  darkMode(themeMode.matches);
});
document.querySelector(".theme-toggle").addEventListener("click", () => {
  document.querySelector(".theme-toggle").children[0].classList.toggle("fa-sun-alt");
  document.querySelector(".theme-toggle").children[0].classList.toggle("fa-moon");
  switch (window.localStorage.getItem("theme")) {
    case "dark":
      darkMode(false);
      break;

    default:
      darkMode(true);
      break;
  }
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
