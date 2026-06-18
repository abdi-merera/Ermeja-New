import type { Dispatch, SetStateAction } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { brandGreen, navItems, whatsappNumber, yellowButton } from "../constants";
import type { Page } from "../types";
import { Logo } from "./Logo";

export function Navbar({
  page,
  mobileOpen,
  setMobileOpen,
  isDarkMode,
  setIsDarkMode,
  choosePage
}: {
  page: Page;
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  choosePage: (page: Page) => void;
}) {
  return (
    <header className={`sticky top-0 z-40 ${brandGreen} border-b border-white/10 shadow-lg shadow-[#114F3C]/20`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => choosePage(item.page)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                page === item.page ? "bg-white text-[#114F3C] shadow-sm" : "text-white/85 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          <a className={`rounded-lg px-4 py-3 text-sm font-black transition ${yellowButton}`} href={`https://wa.me/${whatsappNumber}`}>
            WhatsApp
          </a>
        </div>
        <button type="button" className="rounded-lg bg-white/10 p-3 text-white lg:hidden" onClick={() => setMobileOpen((open) => !open)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen ? (
        <div className="border-t border-white/10 px-4 pb-4 lg:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <button
                key={item.page}
                type="button"
                onClick={() => choosePage(item.page)}
                className="rounded-lg px-4 py-3 text-left text-sm font-bold text-white hover:bg-white/10"
              >
                {item.label}
              </button>
            ))}
            <div className="grid gap-2 border-t border-white/10 pt-2 sm:hidden">
              <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
              <a className={`rounded-lg px-4 py-3 text-center text-sm font-black ${yellowButton}`} href={`https://wa.me/${whatsappNumber}`}>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function ThemeToggle({ isDarkMode, setIsDarkMode }: { isDarkMode: boolean; setIsDarkMode: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-sm font-black text-white transition hover:bg-white/20"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Light mode" : "Dark mode"}
    >
      {isDarkMode ? <Sun className="h-5 w-5 text-[#F8A900]" /> : <Moon className="h-5 w-5 text-[#F8A900]" />}
      <span className="hidden lg:inline">{isDarkMode ? "Light" : "Dark"}</span>
    </button>
  );
}
