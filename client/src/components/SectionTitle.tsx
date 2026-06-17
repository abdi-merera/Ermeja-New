export function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#F54C0D]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black text-[#114F3C] dark:text-[#F8A900] sm:text-4xl">{title}</h2>
      {text ? <p className="mt-4 text-base leading-7 text-stone-700 dark:text-stone-300">{text}</p> : null}
    </div>
  );
}
