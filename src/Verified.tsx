import { useState, type ReactNode } from "react";

/*
 * Replace only the values in this object when the HUID, certified weight,
 * certificate number and product serial number are finalized.
 * In production, load this record from your API using the QR record ID.
 */
const silverRecord = {
    brand: "OXYGOLD.AI",
    productName: "999.9 Fine Silver Article",
    traceId: "OXY-AG-TRACE-0001",
    purity: "999.9 Fine Silver",
    weight: "Add certified weight",
    weightTolerance: "±10 mg",
    bisStandard: "IS 2112:2025",
    huid: "Add 6-character HUID",
    bisRegistration: "HM/C-6390370718",
    certificateNumber: "Add certificate number",
    owner: "OXYIDEAS PARTNERS LLP",
    source: "Caps Gold",
    manufacturer: "Oromes India Pvt. Ltd.",
    founder: "Rtn. Thatavarti Venkata Radhakrishna Gupta",
    founderNote: "Radha means Trust",
};

const certificatePreviewUrl = "https://drive.google.com/file/d/1UfumVer6wyPprtGJI75Q-EkXjxR65CLI/preview";

type IconName =
    | "check"
    | "fingerprint"
    | "shield"
    | "scale"
    | "document"
    | "building"
    | "source"
    | "factory"
    | "user"
    | "external"
    | "arrow";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
    const paths: Record<IconName, ReactNode> = {
        check: <path d="m5 12 4 4L19 6" />,
        fingerprint: (
            <>
                <path d="M12 11a2 2 0 0 1 2 2c0 3.2-.7 6.1-2 8" />
                <path d="M8.2 21c1.1-2.7 1.8-5.4 1.8-8a2 2 0 1 1 4 0" />
                <path d="M5.4 19.5C6.4 17 7 15 7 13a5 5 0 0 1 10 0c0 2-.2 4.1-.8 6" />
                <path d="M3.4 17A10 10 0 0 0 4 13a8 8 0 0 1 16 0c0 1.4-.1 2.7-.3 4" />
                <path d="M5.6 5.6A9 9 0 0 1 18.4 5" />
            </>
        ),
        shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3.2-9.5 2.1 2.1 4.5-5" />,
        scale: (
            <>
                <path d="M12 3v18M5 7h14M7 7l-4 7h8L7 7Zm10 0-4 7h8l-4-7ZM8 21h8" />
            </>
        ),
        document: (
            <>
                <path d="M6 2h8l4 4v16H6z" />
                <path d="M14 2v5h5M9 12h6M9 16h6" />
            </>
        ),
        building: (
            <>
                <path d="M3 21h18M5 21V8l7-5 7 5v13" />
                <path d="M9 21v-5h6v5M9 10h.01M15 10h.01" />
            </>
        ),
        source: (
            <>
                <path d="M7 7h10v10H7z" />
                <path d="M3 12h4M17 12h4M12 3v4M12 17v4" />
            </>
        ),
        factory: (
            <>
                <path d="M3 21V10l6 3v-3l6 3V6h4v15z" />
                <path d="M7 17h.01M11 17h.01M15 17h.01" />
            </>
        ),
        user: (
            <>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 22a8 8 0 0 1 16 0" />
            </>
        ),
        external: <path d="M14 3h7v7M10 14 21 3M21 14v7H3V3h7" />,
        arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    };

    return (
        <svg
            aria-hidden="true"
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {paths[name]}
        </svg>
    );
}

const identityDetails = [
    { label: "Purity", value: silverRecord.purity, icon: "shield" as IconName },
    { label: "Certified Weight", value: silverRecord.weight, icon: "scale" as IconName, pending: true },
    { label: "Weight Tolerance", value: silverRecord.weightTolerance, icon: "check" as IconName },
    { label: "BIS Standard", value: silverRecord.bisStandard, icon: "document" as IconName },
    { label: "HUID", value: silverRecord.huid, icon: "fingerprint" as IconName, pending: true },
    { label: "BIS Hallmark Registration No.", value: silverRecord.bisRegistration, icon: "shield" as IconName },
    { label: "Certificate No.", value: silverRecord.certificateNumber, icon: "document" as IconName, pending: true },
    { label: "OXY Trace ID", value: silverRecord.traceId, icon: "fingerprint" as IconName },
];

const journey = [
    {
        step: "01",
        label: "Silver Source",
        value: silverRecord.source,
        description: "The declared source from which the silver is procured.",
        icon: "source" as IconName,
    },
    {
        step: "02",
        label: "Manufactured By",
        value: silverRecord.manufacturer,
        description: "The declared manufacturing partner responsible for the finished article.",
        icon: "factory" as IconName,
    },
    {
        step: "03",
        label: "Hallmark & Identity",
        value: "BIS standard + unique HUID",
        description: "The hallmark and item HUID connect the physical article to its official identity.",
        icon: "fingerprint" as IconName,
    },
    {
        step: "04",
        label: "Owned & Presented By",
        value: silverRecord.owner,
        description: "The legal owner responsible for this OXYGOLD.AI trace record.",
        icon: "building" as IconName,
    },
];

export default function Home() {
    const [certificateOpen, setCertificateOpen] = useState(false);

    return (
        <main className="min-h-screen overflow-hidden bg-[#07090b] text-[#f5f2ea] selection:bg-amber-300 selection:text-black">
            <div className="pointer-events-none fixed inset-0 opacity-50 [background-image:radial-gradient(circle_at_12%_5%,rgba(214,171,75,0.15),transparent_28%),radial-gradient(circle_at_92%_28%,rgba(190,200,210,0.09),transparent_32%)]" />

            <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
                    <a href="#top" className="group flex items-center gap-3" aria-label="OXYGOLD.AI home">
                        <span className="grid h-10 w-10 place-items-center rounded-full border border-amber-400/50 bg-gradient-to-br from-amber-200 via-amber-500 to-amber-800 text-sm font-black text-black shadow-[0_0_30px_rgba(245,180,55,0.15)]">
                            OX
                        </span>
                        <span>
                            <span className="block font-serif text-lg tracking-[0.15em] text-amber-300">OXYGOLD.AI</span>
                            <span className="block text-[9px] font-semibold uppercase tracking-[0.28em] text-white/45">Silver Traceability</span>
                        </span>
                    </a>
                    <a
                        href="#identity"
                        className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/75 transition hover:border-amber-300/40 hover:text-amber-200 sm:flex"
                    >
                        View silver record <Icon name="arrow" className="h-4 w-4" />
                    </a>
                </div>
            </header>

            <section id="top" className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:px-12 lg:pb-24">
                <div className="grid items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16">
                    <div>
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-50" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                            </span>
                            Digital trace record active
                        </div>
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-amber-300/80">Certificate of authenticity</p>
                        <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
                            Your silver.
                            <span className="mt-2 block bg-gradient-to-r from-[#fff] via-[#bfc6cb] to-[#7f878d] bg-clip-text text-transparent">
                                Clearly traced.
                            </span>
                        </h1>
                        <p className="mt-7 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
                            You scanned the QR linked to this silver article. This digital passport presents its declared purity, hallmark identity, ownership and chain of custody in one transparent record.
                        </p>
                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="#identity"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-6 py-3 text-sm font-extrabold text-[#14100a] shadow-[0_15px_50px_rgba(208,151,38,0.18)] transition hover:-translate-y-0.5 hover:brightness-110"
                            >
                                Trace this silver <Icon name="arrow" className="h-4 w-4" />
                            </a>
                            <a
                                href="https://www.bis.gov.in/bis-apps/?lang=en"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-bold text-white/85 transition hover:border-amber-300/40 hover:bg-white/[0.07]"
                            >
                                Verify HUID in BIS Care <Icon name="external" className="h-4 w-4" />
                            </a>
                            <button
                                type="button"
                                onClick={() => setCertificateOpen(true)}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-bold text-white/85 transition hover:border-amber-300/40 hover:bg-white/[0.07]"
                            >
                                View certificate <Icon name="document" className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-lg">
                        <div className="absolute -inset-12 -z-10 rounded-full bg-amber-300/[0.05] blur-3xl" />
                        <div className="relative overflow-hidden rounded-[2rem] border border-amber-300/30 bg-gradient-to-br from-[#1a1c1f] via-[#0e1012] to-black p-6 shadow-[0_40px_100px_rgba(0,0,0,0.45)] sm:p-8">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">Digital silver passport</p>
                                    <p className="mt-2 font-serif text-2xl text-amber-300">{silverRecord.brand}</p>
                                </div>
                                <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 p-2 text-emerald-300">
                                    <Icon name="shield" className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="my-9 flex justify-center">
                                <div className="relative grid h-48 w-48 place-items-center rounded-full border border-white/30 bg-[radial-gradient(circle_at_32%_25%,#ffffff_0%,#d3d6d8_18%,#8b9195_45%,#e8e9e9_65%,#73777a_100%)] p-2 shadow-[0_28px_80px_rgba(0,0,0,0.6),inset_0_0_18px_rgba(255,255,255,0.8)] sm:h-56 sm:w-56">
                                    <div className="absolute inset-3 rounded-full border border-black/25" />
                                    <div className="absolute inset-6 rounded-full border border-black/10 [background-image:repeating-conic-gradient(from_0deg,rgba(0,0,0,0.12)_0deg,transparent_1deg,transparent_15deg)]" />
                                    <div className="relative text-center text-[#1b1d1e]">
                                        <span className="block font-serif text-5xl font-black">Ag</span>
                                        <span className="mt-2 block text-sm font-extrabold tracking-[0.2em]">999.9</span>
                                        <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.24em]">Fine Silver</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Trace ID</p>
                                    <p className="mt-2 break-words font-mono text-xs text-white/85">{silverRecord.traceId}</p>
                                </div>
                                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-200/55">HUID status</p>
                                    <p className="mt-2 text-xs font-semibold text-amber-200">Pending final entry</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative z-10 border-y border-white/10 bg-white/[0.025]">
                <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 px-5 sm:px-8 lg:grid-cols-4 lg:px-12">
                    {[
                        ["999.9", "Declared fineness"],
                        ["IS 2112:2025", "BIS standard"],
                        ["HUID", "Item-level identity"],
                        ["4 stages", "Trace journey"],
                    ].map(([value, label]) => (
                        <div key={label} className="px-4 py-6 text-center even:border-l-0 sm:py-7 lg:px-6">
                            <p className="font-serif text-xl text-white sm:text-2xl">{value}</p>
                            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="identity" className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                <div className="max-w-3xl">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300/75">01 — Item identity</p>
                    <h2 className="mt-4 font-serif text-4xl tracking-tight text-white sm:text-5xl">Certificate details</h2>
                    <p className="mt-5 text-base leading-8 text-white/55">
                        The product details connected to this QR record. Fields marked “Pending entry” must be updated with the final value before the QR is released to customers.
                    </p>
                </div>

                <div className="mt-11 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {identityDetails.map((item) => (
                        <article key={item.label} className="group min-h-40 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 transition hover:-translate-y-1 hover:border-amber-300/25">
                            <div className="flex items-center justify-between">
                                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-black/20 text-amber-300">
                                    <Icon name={item.icon} className="h-5 w-5" />
                                </span>
                                {item.pending ? (
                                    <span className="rounded-full border border-amber-300/20 bg-amber-300/[0.07] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-amber-200">Pending entry</span>
                                ) : (
                                    <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/10 text-emerald-300"><Icon name="check" className="h-3.5 w-3.5" /></span>
                                )}
                            </div>
                            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{item.label}</p>
                            <p className={`mt-2 break-words text-sm font-semibold leading-6 ${item.pending ? "text-amber-100/75" : "text-white/90"}`}>{item.value}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="relative z-10 border-y border-white/10 bg-[#0b0d0f]">
                <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                    <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300/75">02 — Provenance</p>
                            <h2 className="mt-4 font-serif text-4xl tracking-tight text-white sm:text-5xl">From source to your hands.</h2>
                            <p className="mt-6 text-base leading-8 text-white/55">
                                A clear account of the parties connected to this silver article. Each stage supports accountability and customer confidence.
                            </p>
                        </div>

                        <div className="relative space-y-4 before:absolute before:bottom-10 before:left-7 before:top-10 before:w-px before:bg-gradient-to-b before:from-amber-300/50 before:via-white/15 before:to-transparent">
                            {journey.map((item) => (
                                <article key={item.step} className="relative flex gap-5 rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:gap-6 sm:p-6">
                                    <div className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-amber-300/25 bg-[#131312] text-amber-300 shadow-[0_0_0_6px_#0b0d0f]">
                                        <Icon name={item.icon} className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0 pt-1">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-amber-300/55">Stage {item.step} · {item.label}</p>
                                        <h3 className="mt-2 break-words text-lg font-bold text-white sm:text-xl">{item.value}</h3>
                                        <p className="mt-2 text-sm leading-6 text-white/48">{item.description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#18191a] via-[#101214] to-[#090a0b] lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="relative min-h-80 overflow-hidden border-b border-white/10 p-8 sm:p-10 lg:min-h-full lg:border-b-0 lg:border-r">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(227,183,82,0.16),transparent_38%)]" />
                        <div className="relative flex h-full min-h-64 flex-col justify-between">
                            <div className="flex items-start justify-between">
                                <span className="rounded-full border border-amber-300/25 bg-amber-300/[0.08] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-amber-200">Founder profile</span>
                                <Icon name="user" className="h-7 w-7 text-white/25" />
                            </div>
                            <div>
                                <div className="mb-6 grid h-24 w-24 place-items-center rounded-full border border-amber-300/35 bg-gradient-to-br from-amber-200 via-amber-500 to-amber-900 font-serif text-3xl font-black text-black shadow-[0_20px_50px_rgba(0,0,0,0.35)]">RG</div>
                                <p className="font-serif text-3xl leading-tight text-white">{silverRecord.founder}</p>
                                <p className="mt-3 font-serif text-xl italic text-amber-300">“{silverRecord.founderNote}”</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 sm:p-10 lg:p-14">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300/75">03 — People & responsibility</p>
                        <h2 className="mt-4 font-serif text-4xl tracking-tight text-white sm:text-5xl">Trust has a name behind it.</h2>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-white/58">
                            This trace record identifies the founder and the legal owner associated with OXYGOLD.AI. It is designed to help every customer understand who stands behind the silver they receive.
                        </p>
                        <div className="mt-9 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                                <div className="flex items-center gap-3 text-amber-300"><Icon name="building" /><span className="text-[10px] font-bold uppercase tracking-[0.18em]">Legal owner</span></div>
                                <p className="mt-4 text-base font-bold leading-7 text-white">{silverRecord.owner}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                                <div className="flex items-center gap-3 text-amber-300"><Icon name="shield" /><span className="text-[10px] font-bold uppercase tracking-[0.18em]">Brand promise</span></div>
                                <p className="mt-4 text-base font-bold leading-7 text-white">Silver you can verify. Silver you can trust.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative z-10 border-t border-white/10 bg-white/[0.025]">
                <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                    <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300/75">04 — Verify independently</p>
                            <h2 className="mt-4 font-serif text-4xl tracking-tight text-white sm:text-5xl">Use the official BIS Care App.</h2>
                            <p className="mt-6 text-base leading-8 text-white/58">
                                Cross-check the final six-character HUID through the official BIS Care App. The app’s “Verify HUID” feature is the authoritative place to check the hallmark-linked item information.
                            </p>
                            <a
                                href="https://www.bis.gov.in/bis-apps/?lang=en"
                                target="_blank"
                                rel="noreferrer"
                                className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-black transition hover:-translate-y-0.5 hover:bg-amber-200"
                            >
                                Open official BIS Care information <Icon name="external" className="h-4 w-4" />
                            </a>
                        </div>
                        <aside className="rounded-[2rem] border border-amber-300/20 bg-amber-300/[0.055] p-7 sm:p-9">
                            <div className="flex items-center gap-3 text-amber-300">
                                <Icon name="shield" className="h-7 w-7" />
                                <h3 className="font-serif text-2xl text-white">Important verification note</h3>
                            </div>
                            <p className="mt-5 text-sm leading-7 text-white/58">
                                This OXYGOLD.AI page presents product and chain-of-custody information declared by the listed businesses. It does not replace the official BIS verification result. Always match the HUID on the physical article with the result shown in the BIS Care App.
                            </p>
                            <ul className="mt-6 space-y-3">
                                {["Match the six-character HUID", "Confirm the purity/fineness", "Check the jeweller registration information"].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-sm font-semibold text-white/75">
                                        <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/10 text-emerald-300"><Icon name="check" className="h-3.5 w-3.5" /></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </aside>
                    </div>
                </div>
            </section>

            <footer className="relative z-10 border-t border-white/10 bg-black/40">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
                    <div>
                        <p className="font-serif text-xl tracking-[0.12em] text-amber-300">OXYGOLD.AI</p>
                        <p className="mt-2 text-xs text-white/35">Owned by {silverRecord.owner}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-white/45">
                        <a className="transition hover:text-amber-200" href="https://www.bis.gov.in/bis-apps/?lang=en" target="_blank" rel="noreferrer">BIS Care App</a>
                        <a className="transition hover:text-amber-200" href="https://www.bis.gov.in/hallmarking-overview/?lang=en" target="_blank" rel="noreferrer">About Hallmarking</a>
                        <a className="transition hover:text-amber-200" href="#top">Back to top</a>
                    </div>
                </div>
            </footer>

            {certificateOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="certificate-modal-title" onMouseDown={() => setCertificateOpen(false)}>
                    <div className="flex h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-white/15 bg-[#111315] shadow-2xl sm:h-[90vh] sm:max-w-5xl sm:rounded-2xl" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                            <div className="flex min-w-0 items-center gap-2 text-white/85">
                                <Icon name="document" className="h-4 w-4 shrink-0 text-amber-300" />
                                <h2 id="certificate-modal-title" className="truncate text-sm font-bold">Silver certificate</h2>
                            </div>
                            <button type="button" onClick={() => setCertificateOpen(false)} aria-label="Close certificate" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white">
                                <span className="text-xl leading-none">×</span>
                            </button>
                        </div>
                        <iframe src={certificatePreviewUrl} title="Silver certificate preview" className="min-h-0 flex-1 bg-white" allow="autoplay" allowFullScreen />
                    </div>
                </div>
            )}
        </main>
    );
}
