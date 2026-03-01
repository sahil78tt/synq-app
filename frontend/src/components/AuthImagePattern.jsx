export default function AuthImagePattern({ title, subtitle }) {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center h-full bg-[#f0f0ee] dark:bg-[#161614] px-14 relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#2c2c2a 1px, transparent 1px), linear-gradient(90deg, #2c2c2a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-sm text-center">
        <div className="mb-10 flex justify-center gap-2.5 flex-wrap">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-xl border border-border dark:border-border-dark bg-panel dark:bg-panel-dark shadow-soft"
              style={{ opacity: 0.4 + (i * 0.07) % 0.6 }}
            />
          ))}
        </div>

        <h2 className="font-display text-2xl text-charcoal dark:text-[#f0f0ee] mb-3 leading-snug">
          {title}
        </h2>
        <p className="text-sm text-muted dark:text-muted-dark leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
