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

const teamMembers = [
  {
    name: "RadhaKrishna.T",
    role: "CEO & Co-Founder",
    img: Radha,
    linkedin: "https://www.linkedin.com/in/oxyradhakrishna/",
    bio: "Visionary leader driving innovation in AI, digital transformation, and future-ready business ecosystems.",
  },
  {
    name: "Ramadevi.T",
    role: "Co-Founder",
    img: Rama,
    linkedin: "https://www.linkedin.com/in/ramadevi-thatavarti/",
    bio: "Strategic leader focused on sustainable growth, people-centric leadership, and business excellence.",
  },
  {
    name: "Subhash.S",
    role: "Co-Founder",
    img: Subash,
    linkedin: "https://www.linkedin.com/in/ssure/",
    bio: "Technology expert focused on scalable architecture, cloud solutions, and enterprise AI systems.",
  },
  {
    name: "Jagadeesh Chinnam",
    role: "AI Transformation Leader",
    img: Chakri,
    linkedin: "https://www.linkedin.com/in/jc-cv/",
    bio: "AI strategy expert helping organizations adopt Generative AI and automation for growth.",
  },
  {
    name: "Snehalatha Reddy",
    role: "Co-Founder",
    img: Sneha,
    linkedin: "https://www.linkedin.com/in/sneha-soma-18681a19b/",
    bio: "Driving operational excellence, project success, and team empowerment across business functions.",
  },
  {
    name: "Yadavalli Srinivas",
    role: "Co-Founder",
    img: Srinivas,
    linkedin: "https://www.linkedin.com/in/yadavallisrinivas/",
    bio: "Entrepreneur and software leader passionate about solving real-world problems using AI.",
  },
  {
    name: "Ramesh.R",
    role: "Co-Founder",
    img: Ramesh,
    linkedin: "https://www.linkedin.com/in/k-ramesh-reddy-a2150b15/",
    bio: "Business strategist connecting AI innovation with practical, high-impact business solutions.",
  },
  {
    name: "Narendra Kumar",
    role: "Co-Founder",
    img: Narendra,
    linkedin:
      "https://www.linkedin.com/in/narendra-kumar-balijepalli-bb4a96129/",
    bio: "Full-stack innovator specializing in AI integration, automation, and intelligent scalable systems.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 45,
    scale: 0.96,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const OurTeam: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-10 sm:rounded-3xl sm:px-6 sm:py-12 lg:px-10 lg:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,#5b2eff55_0%,transparent_32%),radial-gradient(circle_at_bottom_right,#d4af3740_0%,transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto mb-8 max-w-3xl text-center sm:mb-10"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#f5d56b] sm:tracking-[0.28em]">
            Meet Our Visionaries
          </p>

          <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            Our <span className="text-[#f4c73f]">Leadership Team</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:mt-5 sm:text-base">
            Passionate innovators driving AI-powered transformation with
            expertise, dedication, and a shared vision for the future.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {teamMembers.map((member) => (
            <motion.article
              key={member.name}
              variants={cardVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.25, ease: "easeOut" },
              }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#1d0b39]/80 p-3 shadow-[0_12px_32px_rgba(8,2,24,0.22)] transition-all duration-300 hover:border-[#D4AF37]/50 hover:shadow-[0_16px_38px_rgba(8,2,24,0.28)]"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,#f4c73f24_0%,transparent_45%)]" />

              <div className="relative overflow-hidden rounded-xl bg-white">
                <div className="relative h-72 overflow-hidden sm:h-80">
                  <img
                    src={member.img}
                    alt={member.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              <div className="relative px-2 pb-3 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white sm:text-xl">
                      {member.name}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-[#f4c73f]">
                      {member.role}
                    </p>
                  </div>

                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} LinkedIn profile`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-all duration-300 hover:border-[#f4c73f] hover:bg-[#f4c73f] hover:text-[#18052f]"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </div>

                <p className="mt-4 text-sm leading-6 text-white/65">
                  {member.bio}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default OurTeam;
