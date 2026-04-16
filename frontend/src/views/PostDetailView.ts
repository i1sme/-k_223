import { PostService } from "../services/PostService";
import { CommentService, Comment } from "../services/CommentService";
import { AuthService } from "../services/AuthService";
import { Router } from "../router/Router";
import { Navbar } from "../components/Navbar";
import { formatDate, escapeHtml } from "../utils";

/** Renders a single post with its comments and interaction controls */
export async function renderPostDetailView(
  container: HTMLElement,
  navbar: Navbar,
  postId: string
): Promise<void> {
  navbar.render();

  container.innerHTML = `<div class="loading">Loading post...</div>`;

  try {
    const [post, comments] = await Promise.all([
      PostService.getById(postId),
      CommentService.getByPost(postId),
    ]);

    const user = AuthService.getCurrentUser()!;
    const canEditPost =
      user.id === post.author.id ||
      user.role === "moderator" ||
      user.role === "admin";

    container.innerHTML = `
      <button class="back-btn" id="back-btn">&#8592; Back</button>

      <div class="post-detail">
        <div class="post-detail__author">@${escapeHtml(post.author.username)}</div>
        <div class="post-detail__content" id="post-content-area">${escapeHtml(post.content)}</div>
        <div class="post-detail__meta">${formatDate(post.createdAt)}</div>
        <div class="post-detail__actions">
          <button class="action-btn action-btn--like" id="like-btn" data-type="like">
            &#9829; <span id="like-count">${post.likeCount}</span>
          </button>
          <button class="action-btn action-btn--dislike" id="dislike-btn" data-type="dislike">
            &#128078; <span id="dislike-count">${post.dislikeCount}</span>
          </button>
          ${
            canEditPost
              ? `<button class="btn btn--outline btn--small" id="edit-post-btn">Edit</button>
                 <button class="btn btn--danger btn--small" id="delete-post-btn">Delete</button>`
              : ""
          }
        </div>
      </div>

      <div class="section-title">Comments (${comments.length})</div>

      <div class="comment-compose">
        <textarea id="comment-text" placeholder="Write a comment..."></textarea>
        <button class="btn btn--primary btn--small" id="comment-submit">Reply</button>
      </div>

      <div id="comments-list">
        ${comments.length === 0
          ? '<div class="empty-state">No comments yet. Be the first to comment!</div>'
          : comments.map((c) => renderCommentItem(c, user)).join("")}
      </div>
    `;

    attachListeners();
  } catch (err) {
    container.innerHTML = `<div class="alert alert--error" style="margin:16px">${(err as Error).message}</div>`;
  }

  function renderCommentItem(
    comment: Comment,
    user: { id: string; role: string }
  ): string {
    const canEdit =
      user.id === comment.author.id ||
      user.role === "moderator" ||
      user.role === "admin";

    return `
      <div class="comment-item" data-comment-id="${comment.id}">
        <div class="comment-item__header">
          <span class="comment-item__author">@${escapeHtml(comment.author.username)}</span>
          <span class="comment-item__date">${formatDate(comment.createdAt)}</span>
        </div>
        <div class="comment-item__content">${escapeHtml(comment.content)}</div>
        ${
          canEdit
            ? `<div class="comment-item__actions">
                <button class="btn btn--outline btn--small" data-edit-comment="${comment.id}" data-content="${escapeHtml(comment.content)}">Edit</button>
                <button class="btn btn--danger btn--small" data-delete-comment="${comment.id}">Delete</button>
               </div>`
            : ""
        }
      </div>
    `;
  }

  function attachListeners(): void {
    // Back button
    container.querySelector("#back-btn")!.addEventListener("click", () => {
      Router.navigate("/feed");
    });

    // Like / dislike
    container.querySelector<HTMLButtonElement>("#like-btn")?.addEventListener("click", async () => {
      try {
        const summary = await PostService.react(postId, "like");
        container.querySelector("#like-count")!.textContent = String(summary.likeCount);
        container.querySelector("#dislike-count")!.textContent = String(summary.dislikeCount);
      } catch (err) {
        alert((err as Error).message);
      }
    });

    container.querySelector<HTMLButtonElement>("#dislike-btn")?.addEventListener("click", async () => {
      try {
        const summary = await PostService.react(postId, "dislike");
        container.querySelector("#like-count")!.textContent = String(summary.likeCount);
        container.querySelector("#dislike-count")!.textContent = String(summary.dislikeCount);
      } catch (err) {
        alert((err as Error).message);
      }
    });

    // Edit post inline
    container.querySelector<HTMLButtonElement>("#edit-post-btn")?.addEventListener("click", () => {
      const contentArea = container.querySelector<HTMLElement>("#post-content-area")!;
      const original = contentArea.textContent ?? "";
      contentArea.innerHTML = `
        <div class="inline-edit">
          <textarea id="edit-post-text">${escapeHtml(original)}</textarea>
          <div class="inline-edit__actions">
            <button class="btn btn--primary btn--small" id="save-post-btn">Save</button>
            <button class="btn btn--outline btn--small" id="cancel-edit-btn">Cancel</button>
          </div>
        </div>
      `;
      container.querySelector("#save-post-btn")!.addEventListener("click", async () => {
        const newContent = container.querySelector<HTMLTextAreaElement>("#edit-post-text")!.value;
        try {
          const updated = await PostService.update(postId, newContent);
          contentArea.innerHTML = escapeHtml(updated.content);
        } catch (err) {
          alert((err as Error).message);
        }
      });
      container.querySelector("#cancel-edit-btn")!.addEventListener("click", () => {
        contentArea.textContent = original;
      });
    });

    // Delete post
    container.querySelector<HTMLButtonElement>("#delete-post-btn")?.addEventListener("click", async () => {
      if (!confirm("Delete this post?")) return;
      try {
        await PostService.delete(postId);
        Router.navigate("/feed");
      } catch (err) {
        alert((err as Error).message);
      }
    });

    // Submit comment
    container.querySelector<HTMLButtonElement>("#comment-submit")!.addEventListener("click", async () => {
      const textarea = container.querySelector<HTMLTextAreaElement>("#comment-text")!;
      const content = textarea.value.trim();
      if (!content) return;
      try {
        await CommentService.create(postId, content);
        textarea.value = "";
        await refreshComments();
      } catch (err) {
        alert((err as Error).message);
      }
    });

    attachCommentListeners();
  }

  function attachCommentListeners(): void {
    const user = AuthService.getCurrentUser()!;
    const commentsList = container.querySelector<HTMLElement>("#comments-list")!;

    // Edit comment
    commentsList.querySelectorAll<HTMLButtonElement>("[data-edit-comment]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.editComment!;
        const commentEl = commentsList.querySelector<HTMLElement>(`[data-comment-id="${id}"]`)!;
        const contentEl = commentEl.querySelector<HTMLElement>(".comment-item__content")!;
        const original = contentEl.textContent ?? "";

        contentEl.innerHTML = `
          <div class="inline-edit">
            <textarea>${escapeHtml(original)}</textarea>
            <div class="inline-edit__actions">
              <button class="btn btn--primary btn--small" id="save-cmt-${id}">Save</button>
              <button class="btn btn--outline btn--small" id="cancel-cmt-${id}">Cancel</button>
            </div>
          </div>
        `;

        commentEl.querySelector(`#save-cmt-${id}`)!.addEventListener("click", async () => {
          const newContent = commentEl.querySelector<HTMLTextAreaElement>("textarea")!.value;
          try {
            await CommentService.update(id, newContent);
            await refreshComments();
          } catch (err) {
            alert((err as Error).message);
          }
        });

        commentEl.querySelector(`#cancel-cmt-${id}`)!.addEventListener("click", () => {
          contentEl.textContent = original;
        });
      });
    });

    // Delete comment
    commentsList.querySelectorAll<HTMLButtonElement>("[data-delete-comment]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this comment?")) return;
        try {
          await CommentService.delete(btn.dataset.deleteComment!);
          await refreshComments();
        } catch (err) {
          alert((err as Error).message);
        }
      });
    });

    void user;
  }

  async function refreshComments(): Promise<void> {
    const user = AuthService.getCurrentUser()!;
    const comments = await CommentService.getByPost(postId);
    const commentsList = container.querySelector<HTMLElement>("#comments-list")!;
    const sectionTitle = container.querySelector<HTMLElement>(".section-title")!;

    sectionTitle.textContent = `Comments (${comments.length})`;

    if (comments.length === 0) {
      commentsList.innerHTML = '<div class="empty-state">No comments yet. Be the first to comment!</div>';
    } else {
      commentsList.innerHTML = comments
        .map((c) => {
          const canEdit =
            user.id === c.author.id ||
            user.role === "moderator" ||
            user.role === "admin";
          return `
            <div class="comment-item" data-comment-id="${c.id}">
              <div class="comment-item__header">
                <span class="comment-item__author">@${escapeHtml(c.author.username)}</span>
                <span class="comment-item__date">${formatDate(c.createdAt)}</span>
              </div>
              <div class="comment-item__content">${escapeHtml(c.content)}</div>
              ${
                canEdit
                  ? `<div class="comment-item__actions">
                      <button class="btn btn--outline btn--small" data-edit-comment="${c.id}">Edit</button>
                      <button class="btn btn--danger btn--small" data-delete-comment="${c.id}">Delete</button>
                     </div>`
                  : ""
              }
            </div>
          `;
        })
        .join("");
      attachCommentListeners();
    }
  }
}
