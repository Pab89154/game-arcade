(function () {
  const STORAGE_KEY = "gameArcadeFeedback";
  const BUG_STORAGE_KEY = "gameArcadeBugReports";
  const AUTH_KEY = "gameArcadeAdminAuth";
  const ADMIN_PASSWORD = "offlinearcade";

  const TYPE_LABELS = {
    idea: "New idea",
    bug: "Something broken",
    love: "I love this!",
    other: "Other",
  };

  function getPageName() {
    const path = window.location.pathname;
    if (path.endsWith("/games/index.html") || path.endsWith("/games/") || path.endsWith("/games")) {
      return "Game Arcade (home)";
    }
    const parts = path.split("/");
    const folder = parts[parts.length - 2];
    return folder ? folder.replace(/-/g, " ") : "Game Arcade";
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function normalizeFeedback(list) {
    return list.map(function (entry, index) {
      return {
        id: entry.id || makeId() + index,
        type: entry.type || "other",
        message: entry.message || "",
        page: entry.page || "Unknown",
        date: entry.date || new Date().toISOString(),
        pinned: !!entry.pinned,
        read: entry.read !== false,
      };
    });
  }

  function normalizeBugs(list) {
    return list.map(function (entry, index) {
      return {
        id: entry.id || makeId() + index,
        what: entry.what || entry.message || "",
        steps: entry.steps || "",
        page: entry.page || "Unknown",
        date: entry.date || new Date().toISOString(),
        pinned: !!entry.pinned,
        read: entry.read !== false,
      };
    });
  }

  function loadFeedback() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      return normalizeFeedback(JSON.parse(saved));
    } catch (_) {
      return [];
    }
  }

  function loadBugReports() {
    try {
      const saved = localStorage.getItem(BUG_STORAGE_KEY);
      if (!saved) return [];
      return normalizeBugs(JSON.parse(saved));
    } catch (_) {
      return [];
    }
  }

  function showToast(message) {
    let toast = document.getElementById("feedback-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "feedback-toast";
      toast.className = "feedback-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(function () { toast.classList.remove("show"); }, 3000);
  }

  function writeFeedback(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function writeBugReports(list) {
    localStorage.setItem(BUG_STORAGE_KEY, JSON.stringify(list));
  }

  function saveFeedback(entry) {
    const list = loadFeedback();
    list.push(entry);
    writeFeedback(list);
  }

  function saveBugReport(entry) {
    const list = loadBugReports();
    list.push(entry);
    writeBugReports(list);
  }

  function isAdminAuthed() {
    return sessionStorage.getItem(AUTH_KEY) === "1";
  }

  function setAdminAuthed(value) {
    if (value) sessionStorage.setItem(AUTH_KEY, "1");
    else sessionStorage.removeItem(AUTH_KEY);
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (_) {
      return iso;
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sortEntries(entries) {
    return entries.slice().sort(function (a, b) {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.date) - new Date(a.date);
    });
  }

  function buildUI() {
    const fab = document.createElement("button");
    fab.type = "button";
    fab.className = "feedback-fab";
    fab.setAttribute("aria-label", "Send feedback");
    fab.textContent = "Feedback";

    const bugFab = document.createElement("button");
    bugFab.type = "button";
    bugFab.className = "bug-fab";
    bugFab.setAttribute("aria-label", "Report a bug");
    bugFab.textContent = "Report bug";

    const adminFab = document.createElement("button");
    adminFab.type = "button";
    adminFab.className = "admin-fab";
    adminFab.setAttribute("aria-label", "Admin viewer");
    adminFab.textContent = "Admin";

    const overlay = document.createElement("div");
    overlay.className = "feedback-overlay";
    overlay.id = "feedback-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "feedback-title");
    overlay.innerHTML =
      '<div class="feedback-modal">' +
      '<h2 id="feedback-title">Send Feedback</h2>' +
      "<p>Tell us what you like, what to fix, or what game to add next!</p>" +
      '<label for="feedback-type">Type</label>' +
      '<select id="feedback-type">' +
      '<option value="idea">New idea</option>' +
      '<option value="bug">Something broken</option>' +
      '<option value="love">I love this!</option>' +
      '<option value="other">Other</option>' +
      "</select>" +
      '<label for="feedback-message">Your message</label>' +
      '<textarea id="feedback-message" placeholder="Type your feedback here..." maxlength="500"></textarea>' +
      '<div class="feedback-actions">' +
      '<button type="button" class="btn btn-secondary" id="feedback-cancel">Cancel</button>' +
      '<button type="button" class="btn" id="feedback-submit">Send</button>' +
      "</div>" +
      "</div>";

    const bugOverlay = document.createElement("div");
    bugOverlay.className = "feedback-overlay";
    bugOverlay.id = "bug-overlay";
    bugOverlay.setAttribute("role", "dialog");
    bugOverlay.setAttribute("aria-modal", "true");
    bugOverlay.setAttribute("aria-labelledby", "bug-title");
    bugOverlay.innerHTML =
      '<div class="feedback-modal bug-modal">' +
      '<h2 id="bug-title">Report a Bug</h2>' +
      "<p>Something not working? Tell us what happened and we will fix it!</p>" +
      '<p class="bug-page-label">Game: <strong id="bug-page-name"></strong></p>' +
      '<label for="bug-what">What went wrong?</label>' +
      '<textarea id="bug-what" placeholder="Example: The snake game freezes when I press the arrow keys..." maxlength="500" required></textarea>' +
      '<label for="bug-steps">What were you doing? (optional)</label>' +
      '<textarea id="bug-steps" placeholder="Example: I clicked Start, then pressed the right arrow twice..." maxlength="500"></textarea>' +
      '<div class="feedback-actions">' +
      '<button type="button" class="btn btn-secondary" id="bug-cancel">Cancel</button>' +
      '<button type="button" class="btn" id="bug-submit">Send report</button>' +
      "</div>" +
      "</div>";

    const adminOverlay = document.createElement("div");
    adminOverlay.className = "feedback-overlay";
    adminOverlay.id = "admin-overlay";
    adminOverlay.setAttribute("role", "dialog");
    adminOverlay.setAttribute("aria-modal", "true");
    adminOverlay.innerHTML =
      '<div class="admin-modal-shell">' +
      '<div class="feedback-modal admin-modal" id="admin-login-view">' +
      '<h2 id="admin-login-title">Admin Login</h2>' +
      "<p>Enter the password to view feedback and bug reports.</p>" +
      '<label for="admin-password">Password</label>' +
      '<input type="password" id="admin-password" autocomplete="current-password" />' +
      '<p class="admin-login-error" id="admin-login-error" hidden>Wrong password. Try again.</p>' +
      '<div class="feedback-actions">' +
      '<button type="button" class="btn btn-secondary" id="admin-login-cancel">Cancel</button>' +
      '<button type="button" class="btn" id="admin-login-submit">Enter</button>' +
      "</div>" +
      "</div>" +
      '<div class="feedback-modal admin-modal" id="admin-panel-view" hidden>' +
      '<div class="admin-header-row">' +
      '<h2 id="admin-title">Admin</h2>' +
      '<button type="button" class="admin-logout" id="admin-logout">Log out</button>' +
      "</div>" +
      '<div class="admin-tabs" role="tablist">' +
      '<button type="button" class="admin-tab active" data-tab="feedback" role="tab" aria-selected="true">Feedback</button>' +
      '<button type="button" class="admin-tab" data-tab="bugs" role="tab" aria-selected="false">Bug reports</button>' +
      "</div>" +
      '<p class="admin-count" id="admin-count"></p>' +
      '<div class="admin-list" id="admin-list"></div>' +
      '<div class="admin-actions">' +
      '<button type="button" class="btn btn-secondary" id="admin-close">Close</button>' +
      '<div class="admin-actions-right">' +
      '<button type="button" class="btn btn-secondary" id="admin-copy">Copy all</button>' +
      '<button type="button" class="btn btn-secondary" id="admin-clear">Clear all</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";

    document.body.appendChild(fab);
    document.body.appendChild(bugFab);
    document.body.appendChild(adminFab);
    document.body.appendChild(overlay);
    document.body.appendChild(bugOverlay);
    document.body.appendChild(adminOverlay);

    const messageEl = overlay.querySelector("#feedback-message");
    const typeEl = overlay.querySelector("#feedback-type");
    const bugWhatEl = bugOverlay.querySelector("#bug-what");
    const bugStepsEl = bugOverlay.querySelector("#bug-steps");
    const bugPageEl = bugOverlay.querySelector("#bug-page-name");
    const adminListEl = adminOverlay.querySelector("#admin-list");
    const adminCountEl = adminOverlay.querySelector("#admin-count");
    const loginView = adminOverlay.querySelector("#admin-login-view");
    const panelView = adminOverlay.querySelector("#admin-panel-view");
    const passwordEl = adminOverlay.querySelector("#admin-password");
    const loginErrorEl = adminOverlay.querySelector("#admin-login-error");
    const adminTabs = adminOverlay.querySelectorAll(".admin-tab");

    let adminTab = "feedback";

    function closeAllModals() {
      overlay.classList.remove("open");
      bugOverlay.classList.remove("open");
      adminOverlay.classList.remove("open");
      passwordEl.value = "";
      loginErrorEl.hidden = true;
    }

    function showAdminLogin() {
      loginView.hidden = false;
      panelView.hidden = true;
    }

    function showAdminPanel() {
      loginView.hidden = true;
      panelView.hidden = false;
      renderAdminList();
      adminOverlay.querySelector("#admin-close").focus();
    }

    function openFeedbackModal() {
      closeAllModals();
      overlay.classList.add("open");
      messageEl.value = "";
      typeEl.selectedIndex = 0;
      messageEl.focus();
    }

    function openBugModal() {
      closeAllModals();
      bugPageEl.textContent = getPageName();
      bugWhatEl.value = "";
      bugStepsEl.value = "";
      bugOverlay.classList.add("open");
      bugWhatEl.focus();
    }

    function setAdminTab(tab) {
      adminTab = tab;
      adminTabs.forEach(function (btn) {
        const active = btn.dataset.tab === tab;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
      renderAdminList();
    }

    function updateFeedbackEntry(id, changes) {
      const list = loadFeedback();
      const index = list.findIndex(function (e) { return e.id === id; });
      if (index === -1) return;
      Object.assign(list[index], changes);
      writeFeedback(list);
      renderAdminList();
    }

    function updateBugEntry(id, changes) {
      const list = loadBugReports();
      const index = list.findIndex(function (e) { return e.id === id; });
      if (index === -1) return;
      Object.assign(list[index], changes);
      writeBugReports(list);
      renderAdminList();
    }

    function deleteFeedbackEntry(id) {
      writeFeedback(loadFeedback().filter(function (e) { return e.id !== id; }));
      renderAdminList();
      showToast("Feedback deleted.");
    }

    function deleteBugEntry(id) {
      writeBugReports(loadBugReports().filter(function (e) { return e.id !== id; }));
      renderAdminList();
      showToast("Bug report deleted.");
    }

    function renderFeedbackEntries(entries) {
      if (!entries.length) {
        adminListEl.innerHTML = '<p class="admin-empty">No feedback has been sent yet.</p>';
        return;
      }

      adminListEl.innerHTML = entries.map(function (entry) {
        const classes = ["admin-entry"];
        if (entry.pinned) classes.push("pinned");
        if (!entry.read) classes.push("unread");

        return (
          '<article class="' + classes.join(" ") + '" data-kind="feedback" data-id="' + escapeHtml(entry.id) + '">' +
          '<div class="admin-entry-top">' +
          '<div class="admin-entry-badges">' +
          (entry.pinned ? '<span class="admin-badge-label pin">Pinned</span>' : "") +
          (!entry.read ? '<span class="admin-badge-label unread">Unread</span>' : "") +
          "</div>" +
          '<div class="admin-entry-btns">' +
          '<button type="button" class="admin-entry-btn" data-action="pin" data-id="' + escapeHtml(entry.id) + '">' +
          (entry.pinned ? "Unpin" : "Pin") +
          "</button>" +
          '<button type="button" class="admin-entry-btn" data-action="read" data-id="' + escapeHtml(entry.id) + '">' +
          (entry.read ? "Mark unread" : "Mark read") +
          "</button>" +
          '<button type="button" class="admin-entry-btn danger" data-action="delete" data-id="' + escapeHtml(entry.id) + '">Delete</button>' +
          "</div>" +
          "</div>" +
          '<div class="admin-entry-meta">' +
          '<span class="admin-entry-type">' + escapeHtml(TYPE_LABELS[entry.type] || entry.type) + "</span>" +
          "<span>" + formatDate(entry.date) + "</span>" +
          "<span>Page: " + escapeHtml(entry.page) + "</span>" +
          "</div>" +
          '<p class="admin-entry-message">' + escapeHtml(entry.message) + "</p>" +
          "</article>"
        );
      }).join("");
    }

    function renderBugEntries(entries) {
      if (!entries.length) {
        adminListEl.innerHTML = '<p class="admin-empty">No bug reports yet.</p>';
        return;
      }

      adminListEl.innerHTML = entries.map(function (entry) {
        const classes = ["admin-entry", "admin-entry-bug"];
        if (entry.pinned) classes.push("pinned");
        if (!entry.read) classes.push("unread");

        return (
          '<article class="' + classes.join(" ") + '" data-kind="bug" data-id="' + escapeHtml(entry.id) + '">' +
          '<div class="admin-entry-top">' +
          '<div class="admin-entry-badges">' +
          '<span class="admin-badge-label bug">Bug</span>' +
          (entry.pinned ? '<span class="admin-badge-label pin">Pinned</span>' : "") +
          (!entry.read ? '<span class="admin-badge-label unread">Unread</span>' : "") +
          "</div>" +
          '<div class="admin-entry-btns">' +
          '<button type="button" class="admin-entry-btn" data-action="pin" data-id="' + escapeHtml(entry.id) + '">' +
          (entry.pinned ? "Unpin" : "Pin") +
          "</button>" +
          '<button type="button" class="admin-entry-btn" data-action="read" data-id="' + escapeHtml(entry.id) + '">' +
          (entry.read ? "Mark unread" : "Mark read") +
          "</button>" +
          '<button type="button" class="admin-entry-btn danger" data-action="delete" data-id="' + escapeHtml(entry.id) + '">Delete</button>' +
          "</div>" +
          "</div>" +
          '<div class="admin-entry-meta">' +
          "<span>" + formatDate(entry.date) + "</span>" +
          "<span>Page: " + escapeHtml(entry.page) + "</span>" +
          "</div>" +
          '<p class="admin-entry-message"><strong>Problem:</strong> ' + escapeHtml(entry.what) + "</p>" +
          (entry.steps
            ? '<p class="admin-entry-steps"><strong>Steps:</strong> ' + escapeHtml(entry.steps) + "</p>"
            : "") +
          "</article>"
        );
      }).join("");
    }

    function renderAdminList() {
      const feedbackEntries = sortEntries(loadFeedback());
      const bugEntries = sortEntries(loadBugReports());
      const feedbackUnread = feedbackEntries.filter(function (e) { return !e.read; }).length;
      const bugUnread = bugEntries.filter(function (e) { return !e.read; }).length;

      adminTabs.forEach(function (btn) {
        const tab = btn.dataset.tab;
        let badge = "";
        if (tab === "feedback" && feedbackUnread) badge = " (" + feedbackUnread + ")";
        if (tab === "bugs" && bugUnread) badge = " (" + bugUnread + ")";
        btn.textContent = tab === "feedback" ? "Feedback" + badge : "Bug reports" + badge;
      });

      if (adminTab === "bugs") {
        let countText = "No bug reports yet";
        if (bugEntries.length) {
          countText = bugEntries.length + " bug report" + (bugEntries.length === 1 ? "" : "s");
          if (bugUnread) countText += " · " + bugUnread + " unread";
        }
        adminCountEl.textContent = countText;
        renderBugEntries(bugEntries);
        return;
      }

      let countText = "No feedback yet";
      if (feedbackEntries.length) {
        countText = feedbackEntries.length + " message" + (feedbackEntries.length === 1 ? "" : "s");
        if (feedbackUnread) countText += " · " + feedbackUnread + " unread";
      }
      adminCountEl.textContent = countText;
      renderFeedbackEntries(feedbackEntries);
    }

    function openAdminModal() {
      closeAllModals();
      adminOverlay.classList.add("open");
      if (isAdminAuthed()) {
        showAdminPanel();
      } else {
        showAdminLogin();
        passwordEl.focus();
      }
    }

    function tryAdminLogin() {
      if (passwordEl.value === ADMIN_PASSWORD) {
        setAdminAuthed(true);
        loginErrorEl.hidden = true;
        showAdminPanel();
      } else {
        loginErrorEl.hidden = false;
        passwordEl.value = "";
        passwordEl.focus();
      }
    }

    fab.addEventListener("click", openFeedbackModal);
    bugFab.addEventListener("click", openBugModal);
    adminFab.addEventListener("click", openAdminModal);

    overlay.querySelector("#feedback-cancel").addEventListener("click", closeAllModals);
    bugOverlay.querySelector("#bug-cancel").addEventListener("click", closeAllModals);
    adminOverlay.querySelector("#admin-close").addEventListener("click", closeAllModals);
    adminOverlay.querySelector("#admin-login-cancel").addEventListener("click", closeAllModals);
    adminOverlay.querySelector("#admin-login-submit").addEventListener("click", tryAdminLogin);
    adminOverlay.querySelector("#admin-logout").addEventListener("click", function () {
      setAdminAuthed(false);
      showAdminLogin();
      passwordEl.value = "";
      loginErrorEl.hidden = true;
      showToast("Logged out.");
    });

    adminTabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setAdminTab(btn.dataset.tab);
      });
    });

    passwordEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") tryAdminLogin();
    });

    adminListEl.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const article = btn.closest("[data-kind]");
      const kind = article ? article.dataset.kind : adminTab === "bugs" ? "bug" : "feedback";

      if (action === "delete") {
        const label = kind === "bug" ? "bug report" : "feedback";
        if (confirm("Delete this " + label + "?")) {
          if (kind === "bug") deleteBugEntry(id);
          else deleteFeedbackEntry(id);
        }
        return;
      }

      const load = kind === "bug" ? loadBugReports : loadFeedback;
      const update = kind === "bug" ? updateBugEntry : updateFeedbackEntry;
      const entry = load().find(function (item) { return item.id === id; });
      if (!entry) return;

      if (action === "pin") update(id, { pinned: !entry.pinned });
      if (action === "read") update(id, { read: !entry.read });
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeAllModals();
    });
    bugOverlay.addEventListener("click", function (e) {
      if (e.target === bugOverlay) closeAllModals();
    });
    adminOverlay.addEventListener("click", function (e) {
      if (e.target === adminOverlay) closeAllModals();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (overlay.classList.contains("open") || bugOverlay.classList.contains("open") || adminOverlay.classList.contains("open")) {
          closeAllModals();
        }
      }
    });

    overlay.querySelector("#feedback-submit").addEventListener("click", function () {
      const message = messageEl.value.trim();
      if (!message) {
        messageEl.focus();
        return;
      }

      const entry = {
        id: makeId(),
        type: typeEl.value,
        message: message,
        page: getPageName(),
        date: new Date().toISOString(),
        pinned: false,
        read: false,
      };

      try {
        saveFeedback(entry);
      } catch (_) {
        showToast("Could not save feedback. Try again.");
        return;
      }

      closeAllModals();
      showToast("Thanks for your feedback!");
    });

    bugOverlay.querySelector("#bug-submit").addEventListener("click", function () {
      const what = bugWhatEl.value.trim();
      if (!what) {
        bugWhatEl.focus();
        return;
      }

      const entry = {
        id: makeId(),
        what: what,
        steps: bugStepsEl.value.trim(),
        page: getPageName(),
        date: new Date().toISOString(),
        pinned: false,
        read: false,
      };

      try {
        saveBugReport(entry);
      } catch (_) {
        showToast("Could not save bug report. Try again.");
        return;
      }

      closeAllModals();
      showToast("Bug report sent — thank you!");
    });

    adminOverlay.querySelector("#admin-copy").addEventListener("click", function () {
      if (adminTab === "bugs") {
        const entries = sortEntries(loadBugReports());
        if (!entries.length) {
          showToast("Nothing to copy yet.");
          return;
        }
        const text = entries.map(function (entry, i) {
          return (
            "--- Bug report " + (i + 1) + " ---\n" +
            "Date: " + formatDate(entry.date) + "\n" +
            "Page: " + entry.page + "\n" +
            "Problem: " + entry.what + "\n" +
            (entry.steps ? "Steps: " + entry.steps + "\n" : "") +
            (entry.read ? "Read: yes\n" : "Read: no\n")
          );
        }).join("\n\n");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            showToast("Copied all bug reports!");
          }).catch(function () {
            showToast("Could not copy.");
          });
        }
        return;
      }

      const entries = sortEntries(loadFeedback());
      if (!entries.length) {
        showToast("Nothing to copy yet.");
        return;
      }

      const text = entries.map(function (entry, i) {
        return (
          "--- Feedback " + (i + 1) + " ---\n" +
          "Date: " + formatDate(entry.date) + "\n" +
          "Page: " + entry.page + "\n" +
          "Type: " + (TYPE_LABELS[entry.type] || entry.type) + "\n" +
          (entry.read ? "Read: yes\n" : "Read: no\n") +
          "Message: " + entry.message
        );
      }).join("\n\n");

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast("Copied all feedback!");
        }).catch(function () {
          showToast("Could not copy.");
        });
      }
    });

    adminOverlay.querySelector("#admin-clear").addEventListener("click", function () {
      if (adminTab === "bugs") {
        if (!loadBugReports().length) {
          showToast("Nothing to clear.");
          return;
        }
        if (confirm("Delete all bug reports? This cannot be undone.")) {
          writeBugReports([]);
          renderAdminList();
          showToast("All bug reports cleared.");
        }
        return;
      }

      if (!loadFeedback().length) {
        showToast("Nothing to clear.");
        return;
      }
      if (confirm("Delete all saved feedback? This cannot be undone.")) {
        writeFeedback([]);
        renderAdminList();
        showToast("All feedback cleared.");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildUI);
  } else {
    buildUI();
  }
})();
