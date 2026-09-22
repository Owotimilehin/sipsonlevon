/** Route-level skeleton. Shape-matched to the page grids so the swap to real
 *  content does not shift layout. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 py-16">
      <div className="h-3 w-24 bg-ink/10" />
      <div className="mt-5 h-14 w-2/3 max-w-md bg-ink/10" />
      <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] bg-ink/5" />
            <div className="mt-4 h-2.5 w-16 bg-ink/10" />
            <div className="mt-3 h-5 w-40 bg-ink/10" />
            <div className="mt-3 h-3 w-24 bg-ink/10" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
