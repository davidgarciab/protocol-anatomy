/**
 * A moved page often answers with a redirect to the site's home page and a 200,
 * which hides the loss. A deep link that lands on the root path is treated as broken.
 */
export function redirectedHome(requested: string, landed: string): boolean {
  const from = new URL(requested);
  const to = new URL(landed);
  return from.pathname.length > 1 && to.pathname === '/';
}
