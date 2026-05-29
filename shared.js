(function () {
  const STORAGE_KEY = "gameArcadeFeedback";
  const AUTH_KEY = "gameArcadeAdminAuth";
  const ADMIN_PASSWORD = "offlinearcade";

  const TYPE_LABELS = {
    idea: "💡 New idea",
    bug: "🐛 Something broken",
    love: "❤️ I love this!",
    other: "💬 Other",
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

  function normalizeEntries(list) {
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

  function loadFeedback() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      return normalizeEntries(JSON.parse(saved));
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

  function saveFeedback(entry) {
    const list = loadFeedback();
    list.push(entry);
    writeFeedback(list);
  }

  function clearFeedback() {
    localStorage.removeItem(STORAGE_KEY);
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

  function buildUI() {
    const fab = document.createElement("button");
    fab.type = "button";
    fab.className = "feedback-fab";
    fab.setAttribute("aria-label", "Send feedback");
    fab.textContent = "💬 Feedback";

    const adminFab = document.createElement("button");
    adminFab.type = "button";
    adminFab.className = "admin-fab";
    adminFab.setAttribute("aria-label", "Admin feedback viewer");
    adminFab.textContent = "🔧 Admin";

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
      '<option value="idea">💡 New idea</option>' +
      '<option value="bug">🐛 Something broken</option>' +
      '<option value="love">❤️ I love this!</option>' +
      '<option value="other">💬 Other</option>' +
      "</select>" +
      '<label for="feedback-message">Your message</label>' +
      '<textarea id="feedback-message" placeholder="Type your feedback here..." maxlength="500"></textarea>' +
      '<div class="feedback-actions">' +
      '<button type="button" class="btn btn-secondary" id="feedback-cancel">Cancel</button>' +
      '<button type="button" class="btn" id="feedback-submit">Send</button>' +
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
      "<p>Enter the password to view feedback.</p>" +
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
      '<h2 id="admin-title">Feedback Admin</h2>' +
      '<button type="button" class="admin-logout" id="admin-logout">Log out</button>' +
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
    document.body.appendChild(adminFab);
    document.body.appendChild(overlay);
    document.body.appendChild(adminOverlay);

    const messageEl = overlay.querySelector("#feedback-message");
    const typeEl = overlay.querySelector("#feedback-type");
    const adminListEl = adminOverlay.querySelector("#admin-list");
    const adminCountEl = adminOverlay.querySelector("#admin-count");
    const loginView = adminOverlay.querySelector("#admin-login-view");
    const panelView = adminOverlay.querySelector("#admin-panel-view");
    const passwordEl = adminOverlay.querySelector("#admin-password");
    const loginErrorEl = adminOverlay.querySelector("#admin-login-error");

    function closeAllModals() {
      overlay.classList.remove("open");
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

    function sortEntries(entries) {
      return entries.slice().sort(function (a, b) {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.date) - new Date(a.date);
      });
    }

    function updateEntry(id, changes) {
      const list = loadFeedback();
      const index = list.findIndex(function (e) { return e.id === id; });
      if (index === -1) return;
      Object.assign(list[index], changes);
      writeFeedback(list);
      renderAdminList();
    }

    function deleteEntry(id) {
      const list = loadFeedback().filter(function (e) { return e.id !== id; });
      writeFeedback(list);
      renderAdminList();
      showToast("Feedback deleted.");
    }

    function renderAdminList() {
      const entries = sortEntries(loadFeedback());
      const unread = entries.filter(function (e) { return !e.read; }).length;
      const pinned = entries.filter(function (e) { return e.pinned; }).length;

      let countText = "No feedback yet";
      if (entries.length) {
        countText = entries.length + " message" + (entries.length === 1 ? "" : "s");
        if (unread) countText += " · " + unread + " unread";
        if (pinned) countText += " · " + pinned + " pinned";
      }
      adminCountEl.textContent = countText;

      if (!entries.length) {
        adminListEl.innerHTML = '<p class="admin-empty">No feedback has been sent yet.</p>';
        return;
      }

      adminListEl.innerHTML = entries.map(function (entry) {
        const classes = ["admin-entry"];
        if (entry.pinned) classes.push("pinned");
        if (!entry.read) classes.push("unread");

        return (
          '<article class="' + classes.join(" ") + '" data-id="' + escapeHtml(entry.id) + '">' +
          '<div class="admin-entry-top">' +
          '<div class="admin-entry-badges">' +
          (entry.pinned ? '<span class="admin-badge-label pin">📌 Pinned</span>' : "") +
          (!entry.read ? '<span class="admin-badge-label unread">● Unread</span>' : "") +
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
          '<span class="admin-entry-type">' + (TYPE_LABELS[entry.type] || entry.type) + "</span>" +
          "<span>" + formatDate(entry.date) + "</span>" +
          "<span>Page: " + escapeHtml(entry.page) + "</span>" +
          "</div>" +
          '<p class="admin-entry-message">' + escapeHtml(entry.message) + "</p>" +
          "</article>"
        );
      }).join("");
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
    adminFab.addEventListener("click", openAdminModal);

    overlay.querySelector("#feedback-cancel").addEventListener("click", closeAllModals);
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

    passwordEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter") tryAdminLogin();
    });

    adminListEl.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const id = btn.dataset.id;
      const action = btn.dataset.action;

      if (action === "delete") {
        if (confirm("Delete this feedback?")) deleteEntry(id);
        return;
      }
      if (action === "pin") {
        const entry = loadFeedback().find(function (item) { return item.id === id; });
        if (entry) updateEntry(id, { pinned: !entry.pinned });
        return;
      }
      if (action === "read") {
        const entry = loadFeedback().find(function (item) { return item.id === id; });
        if (entry) updateEntry(id, { read: !entry.read });
      }
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeAllModals();
    });
    adminOverlay.addEventListener("click", function (e) {
      if (e.target === adminOverlay) closeAllModals();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && (overlay.classList.contains("open") || adminOverlay.classList.contains("open"))) {
        closeAllModals();
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
      } catch (err) {
        showToast("Could not save feedback. Try again.");
        return;
      }

      const text =
        "Game Arcade Feedback\n" +
        "Page: " + entry.page + "\n" +
        "Type: " + entry.type + "\n" +
        "Message: " + entry.message;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(function () {});
      }

      closeAllModals();
      showToast("Thanks for your feedback! 🎉");
    });

    adminOverlay.querySelector("#admin-copy").addEventListener("click", function () {
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
          (entry.pinned ? "Pinned: yes\n" : "") +
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
      if (!loadFeedback().length) {
        showToast("Nothing to clear.");
        return;
      }
      if (confirm("Delete all saved feedback? This cannot be undone.")) {
        clearFeedback();
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
