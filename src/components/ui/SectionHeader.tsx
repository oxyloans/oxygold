

const BRAND = {
  purple: { soft: "#8A5BFF" },
  gold: { bright: "#F5D36C" },
};

type Props = {
  kicker: string;
  title: string;
  subtitle: string;
};

export default function SectionHeader({ kicker, title, subtitle }: Props) {
  return (
    <div className="text-center">
      <p className="text-xs font-semibold tracking-[0.25em] text-white/55">
        {kicker}
      </p>
      <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-white/70">
        {subtitle}
      </p>
      <div
        className="mx-auto mt-5 h-[3px] w-20 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${BRAND.purple.soft}, ${BRAND.gold.bright})`,
        }}
      />
    </div>
  );
}
