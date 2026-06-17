export function AboutPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <img className="h-full min-h-[420px] rounded-lg object-cover" src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80" alt="Mountain walking route" />
        <div className="rounded-lg bg-white p-8 shadow-sm transition-colors duration-300 dark:bg-[#10241C] dark:shadow-black/20">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#F54C0D]">About Ermija</p>
          <h1 className="mt-3 text-4xl font-black text-[#114F3C] dark:text-[#F8A900]">Ermija means Walk in Amharic.</h1>
          <p className="mt-5 text-base leading-8 text-stone-700 dark:text-stone-300">
            The brand is about stepping out, discovering, and connecting with nature. Ermija Hiking brings people together for guided walks and adventures across Ethiopia's lakes, mountains, forests, and cultural routes.
          </p>
          <p className="mt-4 text-base leading-8 text-stone-700 dark:text-stone-300">
            The identity combines a walking explorer with Amharic letter forms, giving the company a clear Ethiopian cultural signal while still feeling modern, clean, and adventurous.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {["Walk", "Discover", "Connect"].map((word) => (
              <div key={word} className="rounded-lg bg-[#FCE4B4] p-5 text-center text-xl font-black text-[#114F3C] dark:bg-white/10 dark:text-[#F8A900]">
                {word}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
