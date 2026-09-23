import { ArrowUpRight, Instagram, Link2, Mail, MapPin, MessageCircle, MessagesSquare, Music2, Phone, Send } from "lucide-react";
import { brandGreen, telegramUrl, whatsappNumber } from "../constants";
import { Logo } from "./Logo";

const socialLinks = [
  { label: "Linktree", href: "https://linktr.ee/ermja_hiking", Icon: Link2, accent: "group-hover:bg-[#43E660] group-hover:text-[#10241C]" },
  { label: "Facebook", href: "https://www.facebook.com/share/1jlnaqcqen/?mibextid=wwxifr", Icon: MessagesSquare, accent: "group-hover:bg-[#1877F2]" },
  { label: "Telegram", href: telegramUrl, Icon: Send, accent: "group-hover:bg-[#229ED9]" },
  { label: "WhatsApp", href: `https://wa.me/${whatsappNumber}`, Icon: MessageCircle, accent: "group-hover:bg-[#25D366]" },
  { label: "Instagram", href: "https://www.instagram.com/ermja__hiking?igsh=a3pneGhxNnJ5ejQ0&utm_source=qr", Icon: Instagram, accent: "group-hover:bg-[#E4405F]" },
  { label: "TikTok", href: "https://www.tiktok.com/@ermjahikingg?_r=1&_t=zn-98ldwtbjfgk", Icon: Music2, accent: "group-hover:bg-black" }
];

export function Footer({ compactMobile = false }: { compactMobile?: boolean }) {
  return (
    <footer className={`${compactMobile ? "home-footer" : ""} ${brandGreen} px-4 py-10 text-white sm:px-6 lg:px-8`}>
      <div className="mx-auto grid max-w-7xl gap-5 sm:gap-8 md:grid-cols-[1fr_0.8fr_0.8fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-md text-sm leading-6 text-white/70">Ermija means walk. We help travelers step out, discover Ethiopia, and connect with nature through guided group adventures.</p>
        </div>
        <div>
          <h3 className="font-black text-[#F8A900]">Contact</h3>
          <div className="mt-4 space-y-3 text-sm text-white/75">
            <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-[#F8A900]" /> +251 913 181 343</p>
            <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-[#F8A900]" /> <a href="mailto:ermjahiking@gmail.com" className="hover:text-white hover:underline">ermjahiking@gmail.com</a></p>
            <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[#F8A900]" /> Addis Ababa, Ethiopia</p>
          </div>
        </div>
        <div>
          <h3 className="font-black text-[#F8A900]">Social</h3>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:max-w-sm">
            {socialLinks.map(({ label, href, Icon, accent }) => (
              <a
                key={label}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-2 pr-3 text-sm font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 hover:shadow-lg"
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit Ermija Hiking on ${label}`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10 text-[#F8A900] transition duration-300 group-hover:text-white ${accent}`}>
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <span className="min-w-0 flex-1 truncate">{label}</span>
                <ArrowUpRight className="h-4 w-4 text-white/35 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
