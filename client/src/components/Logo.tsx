import { Mountain } from "lucide-react";

export function Logo() {
  return (
    <button type="button" className="flex items-center gap-3 text-left" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F8A900] text-[#114F3C]">
        <Mountain className="h-6 w-6" />
      </span>
      <span>
        <span className="block text-lg font-black leading-none text-white">Ermija Hiking</span>
        <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-[#F8A900]">Walk Ethiopia</span>
      </span>
    </button>
  );
}
