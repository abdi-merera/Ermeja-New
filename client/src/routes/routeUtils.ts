import type { Page } from "../types";

export const pagePaths: Record<Page, string> = {
  home: "/",
  trips: "/trips",
  gallery: "/gallery",
  about: "/about",
  contact: "/contact",
  admin: "/admin"
};

export function pageFromPath(pathname: string): Page {
  if (pathname.startsWith("/trips")) {
    return "trips";
  }

  const match = Object.entries(pagePaths).find(([, path]) => path === pathname);
  return match ? (match[0] as Page) : "home";
}
