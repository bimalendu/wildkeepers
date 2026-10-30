/** Shows a message in the page's #toast element for `ms`. Tapping it runs `onTap`. */
export function toast(message: string, onTap?: () => void, ms = 6000): void {
  const el = document.getElementById('toast')!;
  el.textContent = message;
  el.classList.add('show');
  el.onclick = onTap ?? null;
  window.setTimeout(() => el.classList.remove('show'), ms);
}
