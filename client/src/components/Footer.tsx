import { brandGreen, whatsappNumber } from "../constants";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className={`${brandGreen} px-4 py-10 text-white sm:px-6 lg:px-8`}>
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_0.8fr_0.8fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-md text-sm leading-6 text-white/70">Ermija means walk. We help travelers step out, discover Ethiopia, and connect with nature through guided group adventures.</p>
        </div>
        <div>
          <h3 className="font-black text-[#F8A900]">Contact</h3>
          <div className="mt-4 space-y-2 text-sm text-white/75">
            <p>Phone: +251 911 234 567</p>
            <p>Email: hello@ermijahiking.com</p>
            <p>Addis Ababa, Ethiopia</p>
          </div>
        </div>
        <div>
          <h3 className="font-black text-[#F8A900]">Social</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              ["Instagram", "https://instagram.com/"],
              ["TikTok", "https://www.tiktok.com/"],
              ["WhatsApp", `https://wa.me/${whatsappNumber}`]
            ].map(([item, href]) => (
              <a key={item} className="rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/10" href={href}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
