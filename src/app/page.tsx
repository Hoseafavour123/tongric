export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
          Phase 1 · Foundation Ready
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Tongric Agricultural Commerce &amp; Fulfilment
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700 sm:text-base">
          Multilingual marketplace and logistics coordination platform designed
          for smallholder farmers, agricultural buyers, and transport providers
          starting in Benue State, Nigeria.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">
            Application Architecture
          </h2>
          <p className="mt-1.5 text-sm text-gray-700">
            Single Next.js App Router modular monolith with TypeScript, Zod
            environment validation, and mobile-first PWA support.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">
            Active Implementation Status
          </h2>
          <p className="mt-1.5 text-sm text-gray-700">
            Marketplace, orders, logistics, and account tabs unlock progressively
            as each MVP phase is specified, implemented, and tested.
          </p>
        </div>
      </div>
    </section>
  );
}

