import type { ItineraryDay } from "../types";
import { emptyItineraryDay } from "../itinerary";

const input = "mt-1 w-full rounded-lg border border-stone-300 bg-white p-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#F8A900] dark:border-white/20 dark:bg-[#183329] dark:text-white";
const button = "rounded-lg border border-current/20 px-3 py-2 text-sm font-bold disabled:opacity-30 hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F8A900]";
function move<T,>(items: T[], index: number, offset: number): T[] {
  const result = [...items];
  [result[index], result[index + offset]] = [result[index + offset], result[index]];
  return result;
}

export function ItineraryEditor({ days, onChange, error }: { days: ItineraryDay[]; onChange: (days: ItineraryDay[]) => void; error?: string }) {
  const update = (index: number, day: ItineraryDay) => onChange(days.map((item, i) => i === index ? day : item));
  return <section className="space-y-4 text-[#114F3C] dark:text-white" aria-label="Itinerary editor">
    <div><h3 className="font-black">Day-by-day itinerary</h3><p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Add activities in travel order. Descriptions can include multiple paragraphs.</p></div>
    {error && <p role="alert" className="text-sm font-bold text-red-600 dark:text-red-300">{error}</p>}
    {days.map((day, index) => <details key={index} open className="rounded-xl border border-[#114F3C]/20 bg-sage p-4 dark:border-white/20 dark:bg-white/5">
      <summary className="cursor-pointer font-black">Day {index + 1} <span className="font-normal">({day.activities.length} activities)</span></summary>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={button} aria-label={`Move day ${index + 1} up`} disabled={index === 0} onClick={() => onChange(move(days, index, -1))}>Move up</button>
        <button type="button" className={button} aria-label={`Move day ${index + 1} down`} disabled={index === days.length - 1} onClick={() => onChange(move(days, index, 1))}>Move down</button>
        <button type="button" className={button} disabled={days.length === 1} onClick={() => { if (window.confirm(`Remove day ${index + 1} and its activities?`)) onChange(days.filter((_, i) => i !== index)); }}>Remove day</button>
      </div>
      {day.activities.map((activity, activityIndex) => <fieldset key={activityIndex} className="mt-4 space-y-3 border-t border-current/15 pt-3">
        <legend className="px-1 text-sm font-bold">Activity {activityIndex + 1}</legend>
        <label className="block text-sm font-bold">Title<input className={input} placeholder="Addis Ababa to Dinsho" value={activity.title} onChange={event => update(index, { ...day, activities: day.activities.map((a, i) => i === activityIndex ? { ...a, title: event.target.value } : a) })} /></label>
        <label className="block text-sm font-bold">Description<textarea className={`${input} min-h-36 resize-y font-normal leading-6`} value={activity.description} onChange={event => update(index, { ...day, activities: day.activities.map((a, i) => i === activityIndex ? { ...a, description: event.target.value } : a) })} /></label>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={button} aria-label={`Move activity ${activityIndex + 1} up in day ${index + 1}`} disabled={activityIndex === 0} onClick={() => update(index, { ...day, activities: move(day.activities, activityIndex, -1) })}>Move up</button>
          <button type="button" className={button} aria-label={`Move activity ${activityIndex + 1} down in day ${index + 1}`} disabled={activityIndex === day.activities.length - 1} onClick={() => update(index, { ...day, activities: move(day.activities, activityIndex, 1) })}>Move down</button>
          <button type="button" className={button} disabled={day.activities.length === 1} onClick={() => { if (window.confirm("Remove this activity?")) update(index, { ...day, activities: day.activities.filter((_, i) => i !== activityIndex) }); }}>Remove activity</button>
        </div>
      </fieldset>)}
      <button type="button" className={`${button} mt-4`} onClick={() => update(index, { ...day, activities: [...day.activities, { title: "", description: "" }] })}>+ Add activity</button>
      <div className="mt-4 grid gap-3">
        <label className="text-sm font-bold">Overnight (optional)<input className={input} placeholder="Dinsho campsite" value={day.overnight} onChange={event => update(index, { ...day, overnight: event.target.value })} /></label>
        <label className="text-sm font-bold">Meals (optional)<input className={input} placeholder="Lunch and dinner" value={day.meals} onChange={event => update(index, { ...day, meals: event.target.value })} /></label>
      </div>
    </details>)}
    <button type="button" className={`${button} bg-[#114F3C] text-white`} onClick={() => onChange([...days, emptyItineraryDay()])}>+ Add day</button>
  </section>;
}
