import type { CSSProperties, Dispatch, SetStateAction } from "react";
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
      <div className="flex w-full items-center justify-start px-4 py-4 sm:px-6 lg:px-8">
        <Logo onClick={() => choosePage("home")} />
        <FootstepTrail />
        <nav className="ml-auto hidden items-center gap-1 lg:flex">
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
        <div className="ml-24 hidden items-center gap-3 lg:flex">
          <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          <a
            className={`inline-flex items-center justify-center rounded-lg p-3 transition ${yellowButton}`}
            href={`https://wa.me/${whatsappNumber}`}
            aria-label="Open WhatsApp chat"
            title="WhatsApp"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
        </div>
        <button type="button" className="ml-auto rounded-lg bg-white/10 p-3 text-white lg:ml-0 lg:hidden" onClick={() => setMobileOpen((open) => !open)}>
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
            <div className="flex items-center gap-3 border-t border-white/10 pt-2 lg:hidden">
              <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
              <a
                className={`inline-flex items-center justify-center rounded-lg p-3 ${yellowButton}`}
                href={`https://wa.me/${whatsappNumber}`}
                aria-label="Open WhatsApp chat"
                title="WhatsApp"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function FootstepTrail() {
  const steps = [
    { left: 0, top: 38, src: "/foot.svg" },
    { left: 54, top: 38, src: "/foot-left.svg" },
    { left: 108, top: 38, src: "/foot.svg" },
    { left: 162, top: 38, src: "/foot-left.svg" },
    { left: 216, top: 38, src: "/foot.svg" },
    { left: 270, top: 38, src: "/foot-left.svg" }
  ];

  return (
    <div className="ermija-footstep-trail relative ml-5 hidden h-14 w-96 sm:block" aria-hidden="true">
      <style>
        {`
          @keyframes ermija-footstep {
            0%, 1.4% {
              opacity: 0;
              transform: translateX(-5px) translateY(3px) scale(0.82) rotate(var(--step-rotate));
            }
            2.1%, 2.7% {
              opacity: 1;
              transform: translateX(0) translateY(0) scale(1) rotate(var(--step-rotate));
            }
            4.4%, 100% {
              opacity: 0;
              transform: translateX(5px) translateY(-2px) scale(0.88) rotate(var(--step-rotate));
            }
          }

          .ermija-footstep-trail .footstep {
            position: absolute;
            opacity: 0;
            animation: ermija-footstep 39s ease-in-out infinite;
            animation-delay: var(--step-delay);
            animation-fill-mode: both;
            left: var(--step-left);
            top: var(--step-top);
            transform-origin: center;
          }
        `}
      </style>
      {steps.map((step, index) => (
        <img
          key={`${step.left}-${step.top}`}
          src={step.src}
          alt=""
          className="footstep h-5 w-10 object-contain"
          style={
            {
              "--step-delay": `${index * 1.55}s`,
              "--step-left": `${step.left}px`,
              "--step-top": `${step.top}px`,
              "--step-rotate": "0deg",
              filter: "brightness(0) invert(1)"
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false" fill="currentColor">
      <path d="M16 3C8.8 3 3 8.8 3 15.9c0 2.4.7 4.8 2 6.8L3.7 29l6.4-1.7c1.9 1 4 1.5 5.9 1.5 7.2 0 13-5.8 13-12.9S23.2 3 16 3Zm0 23.6c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4c-1.1-1.7-1.7-3.7-1.7-5.8C5.9 10.5 10.4 5.9 16 5.9s10.1 4.6 10.1 10.1S21.6 26.6 16 26.6Zm5.7-7.6c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.2-.6.1c-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.6-1.8-1.7-2.1s0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2.1-.4 0-.6s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9 1.2 3.3 1.4 3.5c.2.2 2.5 3.8 6 5.3.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.8-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.2-.6-.4Z" />
    </svg>
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
    </button>
  );
}
