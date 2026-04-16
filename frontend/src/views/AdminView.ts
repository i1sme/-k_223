import { UserService, UserListItem } from "../services/UserService";
import { Navbar } from "../components/Navbar";
import { formatDate, escapeHtml } from "../utils";

/** Renders the admin panel for user management */
export async function renderAdminView(
  container: HTMLElement,
  navbar: Navbar
): Promise<void> {
  navbar.render();
  container.innerHTML = `<div class="loading">Loading users...</div>`;

  try {
    await loadUsers();
  } catch (err) {
    container.innerHTML = `<div class="alert alert--error" style="margin:16px">${(err as Error).message}</div>`;
  }

  async function loadUsers(): Promise<void> {
    const users = await UserService.getAllUsers();

    container.innerHTML = `
      <div class="page-header">Admin Panel</div>
      <div id="admin-alert"></div>
      <div id="users-list">
        ${users.map(renderUserRow).join("")}
      </div>
    `;

    attachListeners(users);
  }

  function renderUserRow(user: UserListItem): string {
    return `
      <div class="user-row" data-user-id="${user.id}">
        <div class="user-row__info">
          <div class="user-row__name">@${escapeHtml(user.username)}
            ${user.isLocked ? " &#128274;" : ""}
          </div>
          <div class="user-row__meta">
            <span class="role-badge role-badge--${user.role}">${user.role}</span>
            &nbsp; Joined ${formatDate(user.createdAt)}
          </div>
        </div>
        <div class="user-row__actions">
          <select class="form-group" data-role-select="${user.id}" style="padding:4px 8px;border-radius:6px;font-size:13px;background:var(--bg);color:var(--text);border:1px solid var(--border)">
            <option value="user" ${user.role === "user" ? "selected" : ""}>user</option>
            <option value="moderator" ${user.role === "moderator" ? "selected" : ""}>moderator</option>
            <option value="admin" ${user.role === "admin" ? "selected" : ""}>admin</option>
          </select>
          <button class="btn btn--small ${user.isLocked ? "btn--primary" : "btn--danger"}" data-lock-id="${user.id}" data-locked="${user.isLocked}">
            ${user.isLocked ? "Unlock" : "Lock"}
          </button>
        </div>
      </div>
    `;
  }

  function attachListeners(users: UserListItem[]): void {
    const alertDiv = container.querySelector<HTMLDivElement>("#admin-alert")!;

    // Role change dropdowns
    container
      .querySelectorAll<HTMLSelectElement>("[data-role-select]")
      .forEach((select) => {
        select.addEventListener("change", async () => {
          const userId = select.dataset.roleSelect!;
          const role = select.value as "user" | "moderator" | "admin";
          try {
            await UserService.setRole(userId, role);
            alertDiv.innerHTML = `<div class="alert alert--success" style="margin:8px 20px">Role updated</div>`;
            setTimeout(() => (alertDiv.innerHTML = ""), 2000);
          } catch (err) {
            alertDiv.innerHTML = `<div class="alert alert--error" style="margin:8px 20px">${(err as Error).message}</div>`;
          }
        });
      });

    // Lock / Unlock buttons
    container
      .querySelectorAll<HTMLButtonElement>("[data-lock-id]")
      .forEach((btn) => {
        btn.addEventListener("click", async () => {
          const userId = btn.dataset.lockId!;
          const currentlyLocked = btn.dataset.locked === "true";
          try {
            await UserService.setLocked(userId, !currentlyLocked);
            const user = users.find((u) => u.id === userId);
            if (user) user.isLocked = !currentlyLocked;
            alertDiv.innerHTML = `<div class="alert alert--success" style="margin:8px 20px">User ${!currentlyLocked ? "locked" : "unlocked"}</div>`;
            setTimeout(() => (alertDiv.innerHTML = ""), 2000);
            // Re-render the row
            const row = container.querySelector<HTMLElement>(`[data-user-id="${userId}"]`);
            if (row && user) {
              user.isLocked = !currentlyLocked;
              row.outerHTML = renderUserRow(user);
              attachListeners(users);
            }
          } catch (err) {
            alertDiv.innerHTML = `<div class="alert alert--error" style="margin:8px 20px">${(err as Error).message}</div>`;
          }
        });
      });
  }
}
