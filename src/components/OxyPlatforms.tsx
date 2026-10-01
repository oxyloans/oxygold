import React from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   OXY Group Companies — infinite CSS marquee logo strip
   • Slow, continuous right-to-left scroll on ALL screen sizes
   • Track duplicated for a seamless, gap-free loop
   • Edge-fade mask for a polished look
   • Pauses on hover / focus for accessibility
   • Fully responsive logo sizes (h-10 mobile → h-16 desktop)
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
    src: "https://i.ibb.co/LdKL31FL/askoxylogo.png ",
    href: "https://www.askoxy.ai/",
  },
  {

    name: "Oxyglobal.tech",
    src: "https://i.ibb.co/Q3y9TssV/global-logo.png",
    href: "https://www.oxyglobal.tech/",
  },
  // {
  //   src: "https://i.ibb.co/PGYYDvL9/l4.png",
  //   name: "OXYGOLD.AI",
  //   href: "https://www.oxygold.ai/",
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
      animation: oxy-marquee 90s linear infinite;
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
     we only translate by 50 % (one full copy width), making the
     loop completely seamless with no jump. */
  const doubled = [...logos, ...logos];

  return (
    <section className="w-full overflow-hidden py-5 sm:py-6 md:py-8">
      <MarqueeStyles />

      {/* Outer wrapper — soft fade mask on both edges */}
      <div
        className="oxy-marquee-outer relative w-full"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        {/* Scrolling logo track */}
        <div className="oxy-marquee-track">
          {doubled.map((item, index) => (
            <a
              key={`${item.name}-${index}`}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${item.name}`}
              title={item.name}
              className="
                mx-6
                flex
                shrink-0
                items-center
                justify-center
                rounded-2xl
                px-2
                py-3
                transition-all
                duration-300
                hover:-translate-y-1
                hover:opacity-80
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#5543C8]
                focus-visible:ring-offset-2
                sm:mx-6
                sm:px-3
                md:mx-8
                md:px-3
              "
            >
              <img
                src={item.src}
                alt={`${item.name} logo`}
                loading="lazy"
                draggable={false}
                className="
                  h-[72px]
                  w-auto
                  max-w-[155px]
                  object-contain
                  transition-transform
                  duration-300
                  hover:scale-105
                  sm:h-20
                  sm:max-w-[170px]
                  md:h-24
                  md:max-w-[200px]
                  lg:h-28
                  lg:max-w-[230px]
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
