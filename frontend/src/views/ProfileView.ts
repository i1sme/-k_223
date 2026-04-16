import { UserService } from "../services/UserService";
import { AuthService } from "../services/AuthService";
import { Router } from "../router/Router";
import { Navbar } from "../components/Navbar";
import { formatDate, escapeHtml } from "../utils";

/** Renders the user's own profile page with activity and edit form */
export async function renderProfileView(
  container: HTMLElement,
  navbar: Navbar
): Promise<void> {
  navbar.render();
  container.innerHTML = `<div class="loading">Loading profile...</div>`;

  try {
    const profile = await UserService.getProfile();

    container.innerHTML = `
      <div class="page-header">Profile</div>

      <div class="profile-header">
        <div class="profile-header__username">@${escapeHtml(profile.username)}</div>
        <div class="profile-header__meta">
          <span class="role-badge role-badge--${profile.role}">${profile.role}</span>
          <span>Joined ${formatDate(profile.createdAt)}</span>
        </div>
        ${profile.isLocked ? '<div class="locked-banner" style="margin-top:8px">&#128274; Account locked</div>' : ""}
      </div>

      <!-- Edit profile section -->
      <div style="padding:16px 20px;border-bottom:1px solid var(--border)">
        <div id="edit-alert"></div>
        <form id="edit-form" style="display:flex;flex-direction:column;gap:12px">
          <div class="form-group" style="margin:0">
            <label>New username</label>
            <input id="edit-username" type="text" placeholder="Leave empty to keep current" value="" />
          </div>
          <div class="form-group" style="margin:0">
            <label>New password</label>
            <input id="edit-password" type="password" placeholder="Leave empty to keep current" />
          </div>
          <div>
            <button type="submit" class="btn btn--primary btn--small">Update profile</button>
          </div>
        </form>
      </div>

      <!-- Tabs: Posts / Comments -->
      <div class="tabs">
        <button class="tab tab--active" id="tab-posts">Posts (${profile.posts.length})</button>
        <button class="tab" id="tab-comments">Comments (${profile.comments.length})</button>
      </div>

      <div id="activity-list">
        ${renderPostsTab(profile.posts)}
      </div>
    `;

    // Edit form handler
    const editForm = container.querySelector<HTMLFormElement>("#edit-form")!;
    const editAlert = container.querySelector<HTMLDivElement>("#edit-alert")!;

    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = container.querySelector<HTMLInputElement>("#edit-username")!.value.trim();
      const password = container.querySelector<HTMLInputElement>("#edit-password")!.value;

      if (!username && !password) {
        editAlert.innerHTML = `<div class="alert alert--error">Enter at least one field to update</div>`;
        return;
      }

      const dto: { username?: string; password?: string } = {};
      if (username) dto.username = username;
      if (password) dto.password = password;

      const btn = editForm.querySelector("button")!;
      btn.disabled = true;
      editAlert.innerHTML = "";

      try {
        const updated = await UserService.updateProfile(dto);
        AuthService.updateStoredUser({ username: updated.username });
        navbar.render();
        editAlert.innerHTML = `<div class="alert alert--success">Profile updated successfully</div>`;
        container.querySelector<HTMLElement>(".profile-header__username")!.textContent =
          `@${escapeHtml(updated.username)}`;
        container.querySelector<HTMLInputElement>("#edit-username")!.value = "";
        container.querySelector<HTMLInputElement>("#edit-password")!.value = "";
      } catch (err) {
        editAlert.innerHTML = `<div class="alert alert--error">${(err as Error).message}</div>`;
      } finally {
        btn.disabled = false;
      }
    });

    // Tab switching
    const tabPosts = container.querySelector<HTMLButtonElement>("#tab-posts")!;
    const tabComments = container.querySelector<HTMLButtonElement>("#tab-comments")!;
    const activityList = container.querySelector<HTMLElement>("#activity-list")!;

    tabPosts.addEventListener("click", () => {
      tabPosts.classList.add("tab--active");
      tabComments.classList.remove("tab--active");
      activityList.innerHTML = renderPostsTab(profile.posts);
      attachPostLinks();
    });

    tabComments.addEventListener("click", () => {
      tabComments.classList.add("tab--active");
      tabPosts.classList.remove("tab--active");
      activityList.innerHTML = renderCommentsTab(profile.comments);
      attachPostLinks();
    });

    attachPostLinks();
  } catch (err) {
    container.innerHTML = `<div class="alert alert--error" style="margin:16px">${(err as Error).message}</div>`;
  }

  function renderPostsTab(
    posts: Array<{ id: string; content: string; createdAt: string }>
  ): string {
    if (posts.length === 0) {
      return '<div class="empty-state">You haven\'t posted anything yet.</div>';
    }
    return posts
      .map(
        (p) => `
        <div class="post-card" data-post-link="${p.id}">
          <div class="post-card__header">
            <span class="post-card__date">${formatDate(p.createdAt)}</span>
          </div>
          <div class="post-card__content">${escapeHtml(p.content)}</div>
        </div>
      `
      )
      .join("");
  }

  function renderCommentsTab(
    comments: Array<{ id: string; content: string; postId: string; createdAt: string }>
  ): string {
    if (comments.length === 0) {
      return '<div class="empty-state">You haven\'t commented yet.</div>';
    }
    return comments
      .map(
        (c) => `
        <div class="comment-item" data-post-link="${c.postId}" style="cursor:pointer">
          <div class="comment-item__header">
            <span class="comment-item__date">${formatDate(c.createdAt)}</span>
            <span style="font-size:12px;color:var(--text-muted)">on post</span>
          </div>
          <div class="comment-item__content">${escapeHtml(c.content)}</div>
        </div>
      `
      )
      .join("");
  }

  function attachPostLinks(): void {
    container.querySelectorAll<HTMLElement>("[data-post-link]").forEach((el) => {
      el.addEventListener("click", () => {
        Router.navigate(`/posts/${el.dataset.postLink}`);
      });
    });
  }
}
