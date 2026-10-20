"use strict";
const copyrightYear = String(new Date().getFullYear());
document
    .querySelectorAll(".copyright-year")
    .forEach((el) => {
    el.textContent = copyrightYear;
});
const menuToggle = document.querySelector("#menu-toggle");
const navLinks = document.querySelector("#nav-links");
if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Sluit navigatie" : "Open navigatie");
    });
    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigatie");
        });
    });
}
