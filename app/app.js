// ======================================================
// MOBILE MENU
// ======================================================

function toggleMenu() {

  const menu =
    document.getElementById("mobileMenu");

  const button =
    document.querySelector(".menu-btn");

  if (!menu) {
    console.error("mobileMenu not found.");
    return;
  }

  if (menu.classList.contains("open")) {

    closeMenu();

  } else {

    menu.classList.add("open");

    if (button) {
      button.setAttribute(
        "aria-expanded",
        "true"
      );
    }

    console.log("Menu opened.");
  }
}


function closeMenu() {

  const menu =
    document.getElementById("mobileMenu");

  const button =
    document.querySelector(".menu-btn");

  if (!menu) {
    return;
  }

  menu.classList.remove("open");

  if (button) {
    button.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  console.log("Menu closed.");
}
