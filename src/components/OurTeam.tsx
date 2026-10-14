import React from "react";
import { motion, Variants } from "framer-motion";
import { Linkedin } from "lucide-react";

import Radha from "../assets/radha sir.png";
import Rama from "../assets/rama mam.png";
import Sneha from "../assets/sneha.png";
import Subash from "../assets/subbu.png";
import Chakri from "../assets/jags.png";
import Srinivas from "../assets/yadavalli srinivas.png";
import Ramesh from "../assets/ramesh.png";
import Narendra from "../assets/narendra.png";

interface TeamMember {
  name: string;
  role: string;
  img: string;
  linkedin: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "RadhaKrishna.T",
    role: "Co-Founder & CEO",
    img: Radha,
    linkedin: "https://www.linkedin.com/in/oxyradhakrishna/",
  },
  {
    name: "Ramadevi.T",
    role: "Co-Founder & CTO",
    img: Rama,
    linkedin: "https://www.linkedin.com/in/ramadevi-thatavarti/",
  },
  {
    name: "Subhash.S",
    role: "Co-Founder",
    img: Subash,
    linkedin: "https://www.linkedin.com/in/ssure/",
  },
  {
    name: "Jagadeesh Chinnam",
    role: "AI Transformation Leader",
    img: Chakri,
    linkedin: "https://www.linkedin.com/in/jc-cv/",
  },
  {
    name: "Snehalatha Reddy",
    role: "Co-Founder",
    img: Sneha,
    linkedin: "https://www.linkedin.com/in/sneha-soma-18681a19b/",
  },
  {
    name: "Yadavalli Srinivas",
    role: "Co-Founder",
    img: Srinivas,
    linkedin: "https://www.linkedin.com/in/yadavallisrinivas/",
  },
  {
    name: "Ramesh.R",
    role: "Co-Founder",
    img: Ramesh,
    linkedin: "https://www.linkedin.com/in/k-ramesh-reddy-a2150b15/",
  },
  {
    name: "Narendra Kumar",
    role: "Co-Founder",
    img: Narendra,
    linkedin: "https://www.linkedin.com/in/narendra-kumar-balijepalli-bb4a96129/",
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const OurTeam: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-10 sm:rounded-3xl sm:px-6 sm:py-14 lg:px-10 lg:py-18">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,#5b2eff40_0%,transparent_35%),radial-gradient(circle_at_bottom_right,#d4af3730_0%,transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/25" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#f5d56b] sm:tracking-[0.28em]">
            Meet Our Visionaries
          </p>

          <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            Our <span className="text-[#f4c73f]">Leadership Team</span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:mt-4 sm:text-base">
            Passionate innovators driving AI-powered transformation with
            expertise, dedication, and a shared vision for the future.
          </p>
        </motion.div>

        {/* Team Members Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-10"
        >
          {teamMembers.map((member) => (
            <motion.a
              key={member.name}
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              variants={cardVariants}
              whileHover={{
                y: -6,
                transition: { duration: 0.25, ease: "easeOut" },
              }}
              className="group flex flex-col items-center text-center cursor-pointer p-2 rounded-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c73f]"
              aria-label={`${member.name} on LinkedIn`}
            >
              {/* Circular Avatar Container */}
              <div className="relative w-28 h-28 min-[400px]:w-32 min-[400px]:h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full overflow-hidden border-2 border-white/20 bg-white shadow-lg transition-all duration-300 group-hover:border-[#f4c73f] group-hover:shadow-[0_0_24px_rgba(244,199,63,0.38)]">
                <img
                  src={member.img}
                  alt={member.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition duration-500 motion-safe:group-hover:scale-108"
                />

                {/* Hover LinkedIn Overlay */}
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px] opacity-0 transition-all duration-300 group-hover:opacity-100 flex items-center justify-center">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white shadow-xl flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300">
                    <Linkedin className="h-5 w-5 text-[#0A66C2] fill-[#0A66C2]" />
                  </div>
                </div>
              </div>

              {/* Name & Role */}
              <div className="mt-3.5 sm:mt-4">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white transition-colors duration-200 group-hover:text-[#f4c73f] tracking-tight">
                  {member.name}
                </h3>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">
                  {member.role}
                </p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default OurTeam;
