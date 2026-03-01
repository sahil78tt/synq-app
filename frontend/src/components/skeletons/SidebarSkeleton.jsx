export default function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-border dark:bg-border-dark animate-pulse shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div
              className="h-3 rounded-full bg-border dark:bg-border-dark animate-pulse"
              style={{ width: `${50 + (i * 23) % 50}%` }}
            />
            <div
              className="h-2.5 rounded-full bg-border dark:bg-border-dark animate-pulse opacity-70"
              style={{ width: `${30 + (i * 17) % 40}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
