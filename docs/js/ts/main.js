"use strict";
const copyrightYear = String(new Date().getFullYear());
document.querySelectorAll(".copyright-year").forEach((el) => {
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
const allowedConclusions = new Set([
    "success",
    "failure",
    "cancelled",
    "no-report",
    "unknown",
]);
const numberFormatter = new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: 1,
});
const dateFormatter = new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
});
const ciTotalTests = document.querySelector("[data-testid='ci-total-tests']");
const ciPassRate = document.querySelector("[data-testid='ci-pass-rate']");
const ciStatus = document.querySelector("[data-testid='ci-status']");
const ciStreak = document.querySelector("[data-testid='ci-streak']");
const ciAveragePassRate = document.querySelector("[data-testid='ci-average-pass-rate']");
const ciFlakyRuns = document.querySelector("[data-testid='ci-flaky-runs']");
const ciFailedRuns = document.querySelector("[data-testid='ci-failed-runs']");
const ciHistoryBody = document.querySelector("[data-testid='ci-history-body']");
const safeNumber = (value) => Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
const safePassRate = (value) => Number.isFinite(value)
    ? Math.min(100, Math.max(0, Math.round(value * 10) / 10))
    : 0;
const isSafeRunUrl = (url) => /^https:\/\/github\.com\/MaartenKa\/Portfolio\/actions\/runs\/\d+\/?$/.test(url);
const formatPassRate = (value) => `${numberFormatter.format(value)}%`;
const formatDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
};
const statusLabel = (conclusion) => {
    switch (conclusion) {
        case "success":
            return "Geslaagd";
        case "failure":
            return "Gefaald";
        case "cancelled":
            return "Geannuleerd";
        case "no-report":
            return "Geen rapport";
        default:
            return "Onbekend";
    }
};
const normalizeRun = (raw) => {
    if (!raw || typeof raw !== "object")
        return null;
    const run = raw;
    const conclusion = typeof run.conclusion === "string" && allowedConclusions.has(run.conclusion)
        ? run.conclusion
        : "unknown";
    const createdAt = typeof run.createdAt === "string" ? run.createdAt : "";
    const runNumber = Number(run.runNumber);
    const runUrl = typeof run.runUrl === "string" ? run.runUrl : "";
    const total = safeNumber(Number(run.total));
    const flaky = safeNumber(Number(run.flaky));
    const failed = safeNumber(Number(run.failed));
    const passed = safeNumber(Number(run.passed));
    return {
        conclusion,
        total,
        passed,
        failed,
        flaky,
        passRate: safePassRate(Number(run.passRate)),
        createdAt,
        runNumber: Number.isFinite(runNumber) ? Math.trunc(runNumber) : null,
        runUrl: isSafeRunUrl(runUrl) ? runUrl : "",
    };
};
const isNormalizedRun = (run) => run !== null;
const calculateStreak = (runs) => {
    let streak = 0;
    for (const run of runs) {
        if (run.conclusion !== "success")
            break;
        streak += 1;
    }
    return streak;
};
const calculateAveragePassRate = (runs) => {
    if (runs.length === 0)
        return null;
    const sum = runs.reduce((total, run) => total + run.passRate, 0);
    return Math.round((sum / runs.length) * 10) / 10;
};
const setText = (element, value) => {
    if (element)
        element.textContent = value;
};
const setLatestSummary = (latest) => {
    setText(ciTotalTests, latest ? String(latest.total) : "—");
    setText(ciPassRate, latest ? formatPassRate(latest.passRate) : "—");
    setText(ciStatus, latest ? statusLabel(latest.conclusion) : "—");
};
const setAggregateStats = (runs) => {
    const averagePassRate = calculateAveragePassRate(runs);
    setText(ciStreak, runs.length > 0 ? String(calculateStreak(runs)) : "—");
    setText(ciAveragePassRate, averagePassRate === null ? "—" : formatPassRate(averagePassRate));
    setText(ciFlakyRuns, runs.length > 0
        ? String(runs.filter((run) => run.flaky > 0).length)
        : "—");
    setText(ciFailedRuns, runs.length > 0
        ? String(runs.filter((run) => run.conclusion === "failure" || run.failed > 0)
            .length)
        : "—");
};
const createTextCell = (text) => {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
};
const createRunCell = (run) => {
    const cell = document.createElement("td");
    if (run.runNumber === null) {
        cell.textContent = "—";
        return cell;
    }
    if (run.runUrl) {
        const link = document.createElement("a");
        link.href = run.runUrl;
        link.textContent = `Run ${run.runNumber}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        cell.appendChild(link);
        return cell;
    }
    cell.textContent = `Run ${run.runNumber}`;
    return cell;
};
const createHistoryRow = (run) => {
    const row = document.createElement("tr");
    row.append(createRunCell(run), createTextCell(formatDate(run.createdAt)), createTextCell(statusLabel(run.conclusion)), createTextCell(String(run.total)), createTextCell(formatPassRate(run.passRate)), createTextCell(String(run.flaky)));
    return row;
};
const renderHistory = (runs) => {
    if (!ciHistoryBody)
        return;
    ciHistoryBody.innerHTML = "";
    if (runs.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 6;
        cell.textContent = "Geen CI-historie beschikbaar.";
        row.appendChild(cell);
        ciHistoryBody.appendChild(row);
        return;
    }
    runs.forEach((run) => {
        ciHistoryBody.appendChild(createHistoryRow(run));
    });
};
const loadPlaywrightHistory = async () => {
    try {
        const response = await fetch("data/playwright-history.json", {
            cache: "no-store",
        });
        if (!response.ok)
            throw new Error("Playwright history unavailable");
        const data = await response.json();
        const runs = Array.isArray(data?.runs)
            ? data.runs.map(normalizeRun).filter(isNormalizedRun)
            : [];
        renderHistory(runs.slice(0, 10));
        setLatestSummary(runs[0] ?? null);
        setAggregateStats(runs.slice(0, 30));
    }
    catch {
        renderHistory([]);
        setLatestSummary(null);
        setAggregateStats([]);
    }
};
if (ciHistoryBody) {
    void loadPlaywrightHistory();
}
