export default function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-6">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`flex gap-3 items-end ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
        >
          <div className="w-7 h-7 rounded-full bg-border dark:bg-border-dark animate-pulse shrink-0" />
          <div
            className="h-10 rounded-2xl bg-border dark:bg-border-dark animate-pulse"
            style={{ width: `${120 + (i * 37) % 100}px` }}
          />
        </div>
      ))}
    </div>
  );
}
