export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" className="flex items-center text-left" onClick={onClick || (() => window.scrollTo({ top: 0, behavior: "smooth" }))}>
      <img src="/logo-white.svg" alt="Ermija Hiking" className="h-14 w-auto" />
    </button>
  );
}
