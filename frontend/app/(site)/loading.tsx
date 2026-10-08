export default function Loading() {
    return (
      <main
        aria-busy="true"
        className="mx-auto w-full max-w-5xl p-4 pt-12"
      >
        {/* Screen readers get a text; sighted users see the grey shapes */}
        <p role="status" className="sr-only">
          Loading shoes…
        </p>
  
        {/* Same spot as the "Shoes" heading */}
        <div className="mb-4 h-10 w-32 animate-pulse rounded-xs bg-surface" />
  
        {/* Same grid as the real catalog, so nothing jumps when it loads */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-square animate-pulse rounded-sm bg-surface" />
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded-xs bg-surface" />
              <div className="mt-2 h-4 w-1/3 animate-pulse rounded-xs bg-surface" />
            </div>
          ))}
        </div>
      </main>
    );
  }