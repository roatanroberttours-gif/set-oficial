// Small formatter: escapes HTML then converts a few lightweight markdown-like
// patterns to safe HTML. Supports: links, bold (**text**), italic (*text*),
// underline (__text__), strikethrough (~~text~~) and inline code (`code`).
export function formatTextToHtml(input: string | null | undefined): string {
  if (!input) return "";

  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  let text = escapeHtml(input);

  // Links: [text](https://...)
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Bold: **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Underline: __text__
  text = text.replace(/__(.+?)__/g, '<u>$1</u>');

  // Italic: *text* (run after bold to avoid conflict)
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Strikethrough: ~~text~~
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Inline code: `code`
  text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>');

  // Preserve line breaks
  text = text.replace(/\r?\n/g, '<br/>');

  return text;
}

export default formatTextToHtml;
