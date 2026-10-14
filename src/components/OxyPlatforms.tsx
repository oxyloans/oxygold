import React from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   OXY Group Companies — infinite CSS marquee logo strip
   • Slow, continuous right-to-left scroll on ALL screen sizes
   • Track duplicated for a seamless, gap-free loop
   • Edge-fade mask for a polished look
   • Pauses on hover / focus for accessibility
   • Clean, borderless, seamless logo presentation
───────────────────────────────────────────────────────────────────────────── */

const logos = [
  {
    name: "OxyBricks",
    src: "https://i.ibb.co/0jq3tGtY/oxybrickslogo.png",
    href: "https://www.oxybricks.world/",
  },
  {
    name: "OxyLoans",
    src: "https://i.ibb.co/gL2V1sZm/oxyloanslogo.png",
    href: "https://www.oxyloans.com/",
  },
  {
    name: "AskOxy.ai",
    src: "https://i.ibb.co/LdKL31FL/askoxylogo.png",
    href: "https://www.askoxy.ai/",
  },
  {
    name: "Oxyglobal.tech",
    src: "https://i.ibb.co/Q3y9TssV/global-logo.png",
    href: "https://www.oxyglobal.tech/",
  },
  // {
  //   src: "https://i.ibb.co/Q00zsj7/oxyjourneys-white-640x119.png",
  //   name: "OXYJOURNEYS",
  //   href: "https://www.oxyjourneys.com/",
  // },
  {
    src: "https://i.ibb.co/B2NcQ7Nj/l5.png",
    name: "OXYCHAIN",
    href: "http://bmv.money:2750/",
  },
  {
    src: "https://i.ibb.co/Swx6RWXM/oxyfinservlogo-Cpr9-A3-NT.png",
    name: "OXYFINSERV",
    href: "https://www.oxyfinserv.com/",
  },
  {
    src: "https://i.ibb.co/84DGTjKd/tv-white.png",
    name: "TVRK",
    href: "https://tvradhakrishna.com/",
  },
];

/* Inject keyframe animation once — avoids a separate CSS file */
const MarqueeStyles: React.FC = () => (
  <style>{`
    @keyframes oxy-marquee {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }

    .oxy-marquee-track {
      display: flex;
      width: max-content;
      animation: oxy-marquee 45s linear infinite;
      will-change: transform;
    }

    /* Pause on hover or keyboard focus */
    .oxy-marquee-outer:hover .oxy-marquee-track,
    .oxy-marquee-outer:focus-within .oxy-marquee-track {
      animation-play-state: paused;
    }
  `}</style>
);

const OxyEcosystem: React.FC = () => {
  /* Duplicate the list so the second copy fills the viewport gap —
     we only translate by 50% (one full copy width), making the
     loop completely seamless with no jump. */
  const doubled = [...logos, ...logos];

  return (
    <section className="w-full overflow-hidden py-4 sm:py-6 md:py-8">
      <MarqueeStyles />

      {/* Outer wrapper — soft fade mask on both edges */}
      <div
        className="oxy-marquee-outer relative w-full overflow-hidden py-2"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        {/* Scrolling logo track */}
        <div className="oxy-marquee-track items-center">
          {doubled.map((item, index) => (
            <a
              key={`${item.name}-${index}`}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${item.name}`}
              title={item.name}
              className="
                mx-5
                sm:mx-7
                md:mx-9
                flex
                shrink-0
                items-center
                justify-center
                px-2
                py-2
                transition-all
                duration-300
                hover:-translate-y-1
                focus-visible:outline-none
              "
            >
              <img
                src={item.src}
                alt={`${item.name} logo`}
                loading="lazy"
                draggable={false}
                className="
                  h-12
                  w-auto
                  max-w-[150px]
                  object-contain
                  opacity-80
                  transition-all
                  duration-300
                  hover:opacity-100
                  hover:scale-105
                  sm:h-16
                  sm:max-w-[180px]
                  md:h-20
                  md:max-w-[210px]
                  lg:h-24
                  lg:max-w-[240px]
                "
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OxyEcosystem;
