export type ProjectMedia = {
  kind: "image" | "video" | "pdf" | "stl" | "placeholder";
  src?: string;
  preview?: string;
  embed?: boolean;
  actionLabel?: string;
  alt: string;
  caption: string;
  aspect?: "wide" | "portrait" | "square";
};

export type Project = {
  slug: string;
  title: string;
  navLabel: string;
  category: "Research" | "Hardware" | "Coursework";
  organization: string;
  year: string;
  summary: string;
  overview: string;
  role: string;
  contribution: string;
  result: string;
  tools: string[];
  metrics?: { value: string; label: string }[];
  media: ProjectMedia[];
  featured?: boolean;
  featuredImage?: string;
  featuredImages?: string[];
};

const projectCatalog: Project[] = [
  {
    slug: "anne-arc",
    title: "ANNE Arc",
    navLabel: "ANNE Arc",
    category: "Research",
    organization: "Querrey Simpson Institute for Bioelectronics",
    year: "2025",
    summary: "Outlier analysis and signal-processing refinement for neonatal respiratory-rate measurements from the ANNE wearable sensor.",
    overview: "ANNE Arc compared BioZ and IMU-derived respiratory rate from a new ANNE sensor against a Philips reference. The work focused on where the systems disagreed, separating usable recordings from poor-quality data, and translating those patterns into parameter changes.",
    role: "Analyzed 48 datasets, investigated Bland-Altman outliers, and built automatic annotation filtering to isolate the most reliable comparisons.",
    contribution: "Categorized failure modes and tuned the respiratory-rate pipeline, including a 1.67 Hz low-pass cutoff and a 30-second calculation window.",
    result: "Produced a clearer path toward more accurate respiratory-rate estimates and future neonatal apnea detection with the ANNE platform.",
    tools: ["Python", "Bioimpedance", "IMU analysis", "Signal processing", "Statistics"],
    metrics: [
      { value: "48", label: "datasets analyzed" },
      { value: "1.67 Hz", label: "optimized LPF cutoff" },
      { value: "30 s", label: "analysis window" },
    ],
    media: [{ kind: "image", src: "/projects/anne-arc.webp", alt: "Summer symposium poster showing the ANNE Arc analysis workflow and results", caption: "2025 QSIB symposium overview: data selection, outlier analysis, filtering, and respiratory-rate parameter refinement.", aspect: "wide" }],
    featured: true,
    featuredImage: "/projects/anne-arc.webp",
  },
  {
    slug: "onyx",
    title: "Onyx",
    navLabel: "Onyx",
    category: "Research",
    organization: "Querrey Simpson Institute for Bioelectronics",
    year: "2025",
    summary: "A RAG-powered research assistant delivered through a web interface and Slack to accelerate literature retrieval for QSIB researchers.",
    overview: "Onyx turns a decade of Rogers Lab publications into a searchable research workspace. Researchers can ask technical questions through a dedicated website or Slack and receive answers grounded in the lab's own papers.",
    role: "Built the retrieval workflow around automated PDF parsing, text and figure extraction, a SQL-backed corpus, and selectable local or remote language models.",
    contribution: "Extended the assistant into the tools researchers already use, including a controlled-access web interface and a Slack bot that can respond inside team channels.",
    result: "Centralized institutional knowledge and reduced the friction of finding prior methods, materials, and closely related work.",
    tools: ["RAG", "Python", "SQL", "PDF parsing", "Slack API", "Web deployment"],
    metrics: [
      { value: "10 yrs", label: "publication corpus" },
      { value: "2", label: "user interfaces" },
      { value: "PDF + figures", label: "indexed content" },
    ],
    media: [{ kind: "image", src: "/projects/onyx-slack.webp", alt: "OnyxBot answering a research question inside Slack", caption: "OnyxBot in Slack, returning a literature-grounded answer within a research channel.", aspect: "portrait" }],
    featured: true,
    featuredImage: "/projects/onyx-slack.webp",
  },
  {
    slug: "microphone-swallow-detection",
    title: "Microphone Swallow Detection",
    navLabel: "Microphone Swallow Detection",
    category: "Research",
    organization: "Querrey Simpson Institute for Bioelectronics",
    year: "2026",
    summary: "An investigation of contact-microphone and dual-IMU sensing for detecting swallows during rest, walking, and meals.",
    overview: "This project asks whether acoustic and inertial sensing can detect individual swallows outside a tightly controlled laboratory setting. It spans protocol design, multimodal synchronization, feature extraction, detector evaluation, and a complementary TrueDepth dot-tracking study.",
    role: "Designed and ran pilot recordings, developed a 72-minute clinical study protocol, curated event examples, and evaluated marker alignment with lagged AUC analysis.",
    contribution: "Built a preliminary PyTorch model to test resting-swallow feature extraction, explored microphone-heavy fusion, and compared single-sensor, dual-sensor, ambulatory, and eating conditions.",
    result: "Resting swallows were the clearest operating region; walking and meal recordings exposed the motion and chewing confounders that the next protocol and model must address.",
    tools: ["PyTorch", "Python", "FFT", "AUC analysis", "IMU", "Contact microphone", "TrueDepth"],
    metrics: [
      { value: "72 min", label: "clinical protocol" },
      { value: "38% / 86%", label: "resting sensitivity / specificity" },
      { value: "3 modalities", label: "mic, IMU, RGB-D" },
    ],
    media: [
      { kind: "pdf", src: "/projects/final-summer-symposium-2026.pdf", preview: "/projects/swallow-research.webp", alt: "Updated 2026 QSIB symposium poster on IMU and acoustic swallow detection", caption: "Updated 2026 symposium PDF synthesizing the acoustic-plus-IMU approach, evaluation metrics, and next-step protocol design.", aspect: "wide" },
      { kind: "video", src: "https://www.youtube-nocookie.com/embed/vOItnK9NXE4", alt: "Microphone swallow detection recording", caption: "Synchronized pilot recording used to inspect swallow events alongside the sensor streams.", aspect: "wide" },
      { kind: "image", src: "/projects/truedepth-results.webp", alt: "TrueDepth and dot-tracking comparison against IMU and microphone signals", caption: "RGB-D dot tracking resolved sub-millimeter motion, but the measured surface geometry did not track the acoustic and inertial transients in this recording.", aspect: "portrait" },
      { kind: "image", src: "/projects/swallow-event-walking.webp", alt: "Spectrogram and accelerometer traces for a walking swallow event", caption: "A walking example showing the motion artifacts that complicate ambulatory event detection.", aspect: "wide" },
    ],
    featured: true,
    featuredImage: "/projects/swallow-research.webp",
  },
  {
    slug: "swallow-annotation",
    title: "Swallow Annotation",
    navLabel: "Annotation",
    category: "Research",
    organization: "Querrey Simpson Institute for Bioelectronics",
    year: "2026",
    summary: "Dataset curation and time alignment for a large dual-IMU swallow study spanning MBSS and ambulatory patient sessions.",
    overview: "The study combines clinician-facing Biopac recordings with wearable IMU data that can begin on different clocks. Reliable labels therefore depend on identifying shared signal landmarks, correcting offsets, and excluding ambiguous or incomplete sessions.",
    role: "Reviewed patient sessions, aligned Biopac and IMU streams using speech and calibration patterns, and verified swallow markers against both modalities.",
    contribution: "Created a UTC-offset calculator from collection forms, documented dataset validity, and developed repeatable checks for clock skew, missing channels, and accidental marker presses.",
    result: "Contributed to a curated corpus of more than 300 MBSS and ambulatory sessions, with roughly 500 verified markers across 45 datasets highlighted in the 2026 project summary.",
    tools: ["Time-series alignment", "Biopac", "IMU", "Spectrograms", "Data QA"],
    metrics: [
      { value: "300+", label: "patient sessions" },
      { value: "~500", label: "verified markers" },
      { value: "45", label: "datasets summarized" },
    ],
    media: [{ kind: "image", src: "/projects/swallow-annotation.webp", alt: "Aligned Biopac and IMU plots used for swallow annotation", caption: "A clinician-marked event viewed in Biopac and wearable IMU data during the annotation workflow.", aspect: "portrait" }],
  },
  {
    slug: "neoflux",
    title: "Neoflux Sensor Redesign",
    navLabel: "Neoflux Sensor Redesign",
    category: "Hardware",
    organization: "Querrey Simpson Institute for Bioelectronics",
    year: "2026",
    summary: "A compact four-layer KiCad redesign for a wearable that measures accelerometry and gases emitted from the body.",
    overview: "Neoflux combines a dense nRF-based electronics stack with sensing, power, wireless charging, memory, and motor-control circuitry. The redesign focused on shrinking the board while preserving manufacturability and signal integrity.",
    role: "Refined the schematic against device datasheets, reorganized the four-layer layout, and routed the complete board using production-oriented design rules.",
    contribution: "Reduced ground-plane interruptions and loop area, replaced microvias with through vias, and compressed the primary board from 23.32 x 29.24 mm to 20 x 23 mm.",
    result: "Achieved a 32% surface-area reduction while keeping a clearer power, ground, and signal-layer strategy for lower-cost fabrication.",
    tools: ["KiCad", "PCB layout", "nRF", "Four-layer stackup", "Design-rule checking"],
    metrics: [
      { value: "32%", label: "surface-area reduction" },
      { value: "20 x 23 mm", label: "final board envelope" },
      { value: "4 layers", label: "PCB stackup" },
    ],
    media: [
      { kind: "image", src: "/projects/neoflux-full-design.png", alt: "Full front and back view of the completed Neoflux PCB design", caption: "Full design view showing the completed top- and bottom-side routing across the main board and remote sensing section.", aspect: "wide" },
      { kind: "image", src: "/projects/neoflux-layers-1-4.png", alt: "Neoflux PCB layer views for layers one through four", caption: "Layer-by-layer view of the four-layer stackup: component routing, ground plane, power plane, and bottom routing.", aspect: "square" },
      { kind: "pdf", src: "/projects/neoflux-v13-schematic.pdf", embed: true, actionLabel: "Open schematic PDF", alt: "Neoflux version 13 electrical schematic", caption: "Embedded external reference for the complete Neoflux v13 electrical schematic.", aspect: "wide" },
    ],
    featured: true,
    featuredImage: "/projects/neoflux-full-design.png",
  },
  {
    slug: "urov-electrical",
    title: "UROV Electrical System",
    navLabel: "UROV",
    category: "Hardware",
    organization: "Northwestern Robotics Club",
    year: "2026",
    summary: "Electrical-subteam design work for the power distribution and control architecture of an underwater rover.",
    overview: "The rover receives 48 V, 30 A DC from the surface and must distribute power to eight thrusters, a Raspberry Pi 5, cameras, lights, and a claw while meeting competition safety rules.",
    role: "Worked with the electrical subteam to research converters, ESCs, cooling, packaging, fusing, and the system-level power architecture.",
    contribution: "Mapped the conversion tree from the topside supply to 12 V and 5 V loads and compared centralized and distributed approaches for the motor electronics.",
    result: "The review made the main sizing constraint explicit: maximum motor demand can exceed the nominal 1.44 kW input, so conversion efficiency and load management are central design decisions.",
    tools: ["Power architecture", "DC-DC conversion", "ESCs", "Raspberry Pi 5", "System design"],
    metrics: [
      { value: "48 V / 30 A", label: "surface supply" },
      { value: "8", label: "thrusters" },
      { value: "1.44 kW", label: "nominal input power" },
    ],
    media: [{ kind: "image", src: "/projects/urov-system.webp", alt: "Underwater rover power and control system overview", caption: "Early system architecture showing distribution, conversion, motor control, compute, camera, claw, and lighting loads.", aspect: "wide" }],
  },
  {
    slug: "dtc-accessible-lock",
    title: "Accessible Door Lock",
    navLabel: "DTC 4.3",
    category: "Coursework",
    organization: "Design Thinking & Communication",
    year: "2024",
    summary: "A first-year design project focused on improving access to door locks for people with hand disabilities.",
    overview: "The team approached a familiar interaction as an accessibility problem: conventional locks can demand grip strength, fine motor control, and wrist motion that are not available to every user.",
    role: "Served as CAD design lead, translating team concepts and user needs into buildable geometry in Onshape.",
    contribution: "Focused the mechanical design on simpler contact, lower-effort actuation, and dimensions that could move efficiently from CAD into prototyping.",
    result: "Developed a user-centered assistive concept grounded in the physical constraints of the lock and the hand interaction around it.",
    tools: ["Onshape", "CAD", "Human-centered design", "Prototyping"],
    media: [
      { kind: "stl", src: "/projects/keyturn.stl", actionLabel: "Download KeyTurn STL", alt: "Interactive 3D model of the KeyTurn accessible lock attachment", caption: "Interactive KeyTurn CAD model. Rotate and zoom the final geometry used for the accessible door-lock concept.", aspect: "wide" },
      { kind: "pdf", src: "/projects/dtc-4-3-final-report.pdf", embed: true, actionLabel: "Open DTC 4.3 final report", alt: "DTC Section 4.3 final report for the accessible door lock", caption: "Embedded final report covering user research, requirements, prototyping, testing, and the completed accessible-lock design.", aspect: "wide" },
    ],
  },
  {
    slug: "dtc-chair-stability",
    title: "Chair Stability",
    navLabel: "DTC 11.2",
    category: "Coursework",
    organization: "Design Thinking & Communication",
    year: "2024",
    summary: "A first-year design project aimed at improving chair stability for Northwestern students.",
    overview: "The project examined how everyday classroom furniture can become unstable under real student use and treated stability as a geometry, load-path, and usability problem.",
    role: "Led CAD development in Onshape and helped turn qualitative observations into a mechanical design that the team could evaluate.",
    contribution: "Iterated the support geometry around balance, footprint, and manufacturability while keeping the intervention practical for a campus setting.",
    result: "Created a design direction that connected user observations with a concrete, testable change to the chair structure.",
    tools: ["Onshape", "CAD", "Mechanical design", "User research"],
    media: [
      { kind: "stl", src: "/projects/wedgerise.stl", actionLabel: "Download WedgeRise STL", alt: "Interactive 3D model of the WedgeRise chair-stability component", caption: "Interactive WedgeRise CAD model. Rotate and zoom the final support geometry developed for the chair-stability concept.", aspect: "wide" },
      { kind: "pdf", src: "/projects/dtc-11-2-final-report.pdf", embed: true, actionLabel: "Open DTC 11.2 final report", alt: "DTC Section 11.2 final report for the chair-stability project", caption: "Embedded final report documenting the chair-stability problem, design criteria, prototype development, and evaluation.", aspect: "wide" },
    ],
  },
  {
    slug: "ce303-advanced-digital-design",
    title: "CE 303: Advanced Digital Design",
    navLabel: "CE 303",
    category: "Coursework",
    organization: "Northwestern University",
    year: "2026",
    summary: "RTL design, simulation, synthesis, and implementation of state machines, memories, arithmetic units, and neural accelerators.",
    overview: "CE 303 connected behavioral Verilog to a full implementation flow. Designs were verified in simulation, constrained for timing, synthesized into cells, and taken through physical design.",
    role: "Designed RTL and self-checking test scenarios for finite-state machines and memory blocks, then analyzed timing, area, and implementation results.",
    contribution: "Used Cadence Xcelium, Genus, and Innovus to move from functional behavior to synthesized and placed-and-routed digital hardware.",
    result: "Built fluency across the complete digital-design loop: architecture, RTL, verification, constraints, synthesis, and physical implementation.",
    tools: ["Verilog", "Xcelium", "Genus", "Innovus", "SDC", "RTL verification"],
    media: [
      { kind: "image", src: "/projects/ce303-xcelium-lab3.webp", alt: "Xcelium simulation waveforms for the CE 303 neural accelerator lab", caption: "Lab 3 Xcelium verification showing signed inputs, weights, and accelerator outputs across the simulation sequence.", aspect: "wide" },
      { kind: "image", src: "/projects/ce303-innovus-lab3.webp", alt: "Innovus routed layout for the CE 303 neural accelerator", caption: "Lab 3 neural accelerator after physical implementation and routing in Cadence Innovus.", aspect: "wide" },
      { kind: "pdf", src: "/projects/ce303-homework-3.pdf", embed: true, actionLabel: "Open Homework 3 report", alt: "CE 303 Homework 3 report on finite-state machines and memory", caption: "Homework 3 report: RTL design and verification of finite-state-machine and memory modules.", aspect: "wide" },
      { kind: "pdf", src: "/projects/ce303-lab-2.pdf", embed: true, actionLabel: "Open Lab 2 report", alt: "CE 303 Lab 2 report on the arithmetic logic unit", caption: "Lab 2 report: ALU architecture, RTL verification, synthesis, timing, and physical implementation.", aspect: "wide" },
      { kind: "pdf", src: "/projects/ce303-lab-3.pdf", embed: true, actionLabel: "Open Lab 3 report", alt: "CE 303 Lab 3 report on the neural accelerator", caption: "Lab 3 report: neural-accelerator design, simulation, synthesis, timing analysis, and routed implementation.", aspect: "wide" },
    ],
    featuredImages: ["/projects/ce303-xcelium-lab3.webp", "/projects/ce303-innovus-lab3.webp"],
  },
  {
    slug: "ce205-gravity-platformer",
    title: "CE 205: Gravity Platformer",
    navLabel: "CE 205",
    category: "Coursework",
    organization: "Northwestern University",
    year: "2025",
    summary: "An ARMv7 platformer for the DE1-SoC in which the player flips gravity, dodges arrows, and collects rabbits.",
    overview: "The project treats a small game as a complete low-level system: frame-by-frame animation, input buffering, collision and platform logic, random object generation, and a live score all run in ARM assembly.",
    role: "Implemented the game loop and integrated keyboard controls, player state, projectiles, collectibles, collision surfaces, and animation sequences.",
    contribution: "Used the board's keyboard FIFO and a pseudo-random generator while coordinating eight player frames, four arrow frames, and a ten-frame death animation.",
    result: "Delivered a playable hardware-targeted game with responsive gravity inversion and multiple interacting game systems.",
    tools: ["ARMv7 assembly", "DE1-SoC", "CPULator", "Keyboard FIFO", "Sprite animation"],
    metrics: [
      { value: "22", label: "animation frames" },
      { value: "3", label: "platform surfaces" },
      { value: "4", label: "arrow-key controls" },
    ],
    media: [
      { kind: "image", src: "/projects/moonlit-fox-demo.gif", alt: "Animated Moonlit Fox gravity platformer gameplay", caption: "Animated gameplay excerpt showing Moonlit Fox running at full frame without cropping.", aspect: "wide" },
      { kind: "video", src: "https://www.youtube-nocookie.com/embed/wfCsl80Kll0", alt: "ARMv7 gravity platformer demonstration", caption: "Full gameplay demonstration showing movement, gravity inversion, projectiles, platforms, and scoring.", aspect: "wide" },
    ],
    featuredImage: "/projects/moonlit-fox-demo.gif",
  },
  {
    slug: "ee202-sound-display",
    title: "FFT Sound Display",
    navLabel: "EE 202",
    category: "Coursework",
    organization: "Northwestern University",
    year: "2024",
    summary: "An ESP32 microphone demo that separates audio frequency content with an FFT and maps it onto an LED display.",
    overview: "This introductory electrical-engineering project turns an acoustic waveform into an immediate visual output. The ESP32 samples the microphone, separates frequency content, and drives LEDs according to the detected bands.",
    role: "Integrated microphone acquisition, FFT processing, frequency-band selection, and the LED output into one working demonstration.",
    contribution: "Connected a mathematical frequency-domain transform to embedded input and output hardware with timing and resource constraints visible in real time.",
    result: "Produced a responsive sound visualizer and an early end-to-end example of Kevin's interest in sensors, signal processing, and embedded systems.",
    tools: ["ESP32", "FFT", "Microphone", "LED display", "Embedded C"],
    media: [{ kind: "video", src: "https://www.youtube-nocookie.com/embed/j0-_WajvO7U", alt: "ESP32 FFT sound display demonstration", caption: "Lab demonstration of microphone frequency content driving the LED display.", aspect: "wide" }],
  },
];

const projectOrder = [
  "ce303-advanced-digital-design",
  "ce205-gravity-platformer",
  "neoflux",
  "microphone-swallow-detection",
  "urov-electrical",
  "dtc-accessible-lock",
  "dtc-chair-stability",
  "ee202-sound-display",
  "anne-arc",
  "onyx",
  "swallow-annotation",
] as const;

export const projects: Project[] = projectOrder.map((slug) => {
  const project = projectCatalog.find((item) => item.slug === slug);
  if (!project) throw new Error(`Missing portfolio project: ${slug}`);
  return project;
});

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
