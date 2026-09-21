export default function MonOpenwindLoading() {
  return (
    <div
      className="min-h-[calc(100dvh-56px)] bg-white text-slate-950"
      aria-busy="true"
    >
      <div className="border-b border-slate-100">
        <div className="mx-auto max-w-[1500px] animate-pulse px-4 pb-7 pt-5 sm:px-6 sm:pb-9 sm:pt-6 lg:px-10">
          <div className="mb-7 flex items-center justify-between">
            <div className="h-11 w-60 rounded-xl bg-slate-100" />
            <div className="h-11 w-12 rounded-xl bg-slate-100 sm:w-36" />
          </div>
          <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_minmax(310px,0.72fr)] lg:gap-10">
            <div className="flex min-h-48 flex-col justify-center">
              <div className="h-3 w-44 rounded bg-sky-100" />
              <div className="mt-4 h-10 w-full max-w-xl rounded-lg bg-slate-100" />
              <div className="mt-4 h-5 w-full max-w-lg rounded bg-slate-100" />
            </div>
            <div className="min-h-52 rounded-3xl border border-slate-100 bg-slate-50" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] animate-pulse space-y-12 px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        <section>
          <div className="h-3 w-24 rounded bg-sky-100" />
          <div className="mt-3 h-8 w-44 rounded bg-slate-100" />
          <div className="mt-2 h-4 w-full max-w-md rounded bg-slate-100" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-72 rounded-2xl border border-slate-100 bg-slate-50"
              />
            ))}
          </div>
        </section>
        <section>
          <div className="h-8 w-72 max-w-full rounded bg-slate-100" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-32 rounded-2xl border border-slate-100 bg-slate-50"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
