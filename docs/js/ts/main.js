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
    const isOpen = () => navLinks.classList.contains("open");
    const setOpen = (open) => {
        navLinks.classList.toggle("open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Sluit navigatie" : "Open navigatie");
    };
    const closeMenu = (returnFocus) => {
        if (!isOpen())
            return;
        setOpen(false);
        if (returnFocus)
            menuToggle.focus();
    };
    menuToggle.addEventListener("click", () => {
        const open = !isOpen();
        setOpen(open);
        // Focus management: bij openen naar de eerste link, bij sluiten terug
        // naar de menuknop, zodat toetsenbordgebruikers niet de draad kwijtraken.
        if (open) {
            const firstLink = navLinks.querySelector("a");
            firstLink?.focus();
        }
        else {
            menuToggle.focus();
        }
    });
    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            setOpen(false);
        });
    });
    // Sluit het menu met de Escape-toets en geef de focus terug aan de knop.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape")
            closeMenu(true);
    });
    // Sluit het menu bij een klik buiten het menu (buiten de lijst en de knop).
    document.addEventListener("click", (event) => {
        if (!isOpen())
            return;
        const target = event.target;
        if (target && (navLinks.contains(target) || menuToggle.contains(target))) {
            return;
        }
        closeMenu(true);
    });
}
