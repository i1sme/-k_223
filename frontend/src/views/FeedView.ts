import { PostService, Post } from "../services/PostService";
import { AuthService } from "../services/AuthService";
import { Router } from "../router/Router";
import { Navbar } from "../components/Navbar";
import { formatDate, escapeHtml } from "../utils";

/** Renders the main discussion feed with post compose box */
export async function renderFeedView(
  container: HTMLElement,
  navbar: Navbar
): Promise<void> {
  navbar.render();

  container.innerHTML = `
    <div class="page-header">Feed</div>
    <div class="compose">
      <textarea id="compose-text" placeholder="What's on your mind?" maxlength="280"></textarea>
      <div class="compose__footer">
        <span class="compose__counter" id="compose-counter">0 / 280</span>
        <button class="btn btn--primary btn--small" id="compose-submit">Post</button>
      </div>
    </div>
    <div id="feed-list"><div class="loading">Loading...</div></div>
  `;

  const textarea = container.querySelector<HTMLTextAreaElement>("#compose-text")!;
  const counter = container.querySelector<HTMLSpanElement>("#compose-counter")!;
  const submitBtn = container.querySelector<HTMLButtonElement>("#compose-submit")!;

  // Live character counter
  textarea.addEventListener("input", () => {
    const len = textarea.value.length;
    counter.textContent = `${len} / 280`;
    counter.className = "compose__counter" + (len > 260 ? (len >= 280 ? " compose__counter--over" : " compose__counter--warn") : "");
  });

  // Submit new post
  submitBtn.addEventListener("click", async () => {
    const content = textarea.value.trim();
    if (!content) return;
    submitBtn.disabled = true;
    try {
      await PostService.create(content);
      textarea.value = "";
      counter.textContent = "0 / 280";
      await loadFeed();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      submitBtn.disabled = false;
    }
  });

  await loadFeed();

  async function loadFeed(): Promise<void> {
    const feedList = container.querySelector<HTMLDivElement>("#feed-list")!;
    try {
      const posts = await PostService.getAll();
      if (posts.length === 0) {
        feedList.innerHTML = `<div class="empty-state">No posts yet. Be the first to post!</div>`;
        return;
      }
      feedList.innerHTML = posts.map(renderPostCard).join("");
      attachPostListeners(feedList);
    } catch (err) {
      feedList.innerHTML = `<div class="alert alert--error" style="margin:16px">${(err as Error).message}</div>`;
    }
  }

  function renderPostCard(post: Post): string {
    const user = AuthService.getCurrentUser();
    const canEdit =
      user &&
      (user.id === post.author.id ||
        user.role === "moderator" ||
        user.role === "admin");

    return `
      <div class="post-card" data-post-id="${post.id}">
        <div class="post-card__header">
          <span class="post-card__author">@${escapeHtml(post.author.username)}</span>
          <span class="post-card__date">${formatDate(post.createdAt)}</span>
        </div>
        <div class="post-card__content">${escapeHtml(post.content)}</div>
        <div class="post-card__actions">
          <button class="action-btn action-btn--like" data-like-id="${post.id}" data-type="like">
            &#9829; ${post.likeCount}
          </button>
          <button class="action-btn action-btn--dislike" data-like-id="${post.id}" data-type="dislike">
            &#128078; ${post.dislikeCount}
          </button>
          <button class="action-btn" data-comment-id="${post.id}">
            &#128172; ${post.commentCount}
          </button>
          ${canEdit ? `<button class="action-btn btn--danger" data-delete-id="${post.id}" style="margin-left:auto;color:var(--danger)">Delete</button>` : ""}
        </div>
      </div>
    `;
  }

  function attachPostListeners(feedList: HTMLElement): void {
    // Navigate to post detail on card click
    feedList.querySelectorAll<HTMLElement>(".post-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        // Don't navigate if a button was clicked
        if (target.closest("button")) return;
        const id = card.dataset.postId!;
        Router.navigate(`/posts/${id}`);
      });
    });

    // Like / dislike buttons
    feedList.querySelectorAll<HTMLButtonElement>("[data-like-id]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const postId = btn.dataset.likeId!;
        const type = btn.dataset.type as "like" | "dislike";
        try {
          await PostService.react(postId, type);
          await loadFeed();
        } catch (err) {
          alert((err as Error).message);
        }
      });
    });

    // Comment button navigates to post detail
    feedList.querySelectorAll<HTMLButtonElement>("[data-comment-id]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        Router.navigate(`/posts/${btn.dataset.commentId}`);
      });
    });

    // Delete button
    feedList.querySelectorAll<HTMLButtonElement>("[data-delete-id]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm("Delete this post?")) return;
        try {
          await PostService.delete(btn.dataset.deleteId!);
          await loadFeed();
        } catch (err) {
          alert((err as Error).message);
        }
      });
    });
  }
}
