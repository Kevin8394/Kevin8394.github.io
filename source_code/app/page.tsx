/* eslint-disable @next/next/no-img-element -- project figures include source GIF/PNG assets */
import Link from "next/link";
import { ArrowDown, ArrowUpRight, CircuitBoard, Cpu, RadioTower } from "lucide-react";
import { projects } from "@/app/data/projects";
import { assetPath } from "@/lib/site-path";

const featuredProjects = projects.slice(0, 4);

export default function Home() {
  return (
    <main id="main-content">
      <figure className="lakefront-banner" aria-label="Northwestern University lakefront overlooking Chicago">
        <img src={assetPath("/images/northwestern-lakefront.jpg")} alt="Northwestern lakefront with the Chicago skyline in the distance" />
      </figure>

      <section className="home-hero shell">
        <div className="hero-copy">
          <p className="eyebrow"><span>Portfolio / 2026</span></p>
          <h1>Kevin Lin</h1>
          <p className="hero-degree">Third-year at Northwestern University<br />Computer Engineering BS/MS</p>
          <p className="hero-intro">I build systems across embedded hardware, digital design, and physiological sensing—turning noisy signals and tight constraints into useful prototypes, analysis tools, and evidence.</p>
          <a className="text-link" href="#selected-work">Explore selected work <ArrowDown size={17} /></a>
        </div>
        <aside className="hero-visual hero-mark-panel" aria-label="Northwestern University and areas of focus">
          <img className="hero-mark" src={assetPath("/images/northwestern-clean-logo.png")} alt="Northwestern University seal" />
          <div className="focus-list">
            <span><RadioTower size={16} /> Sense</span>
            <span><Cpu size={16} /> Compute</span>
            <span><CircuitBoard size={16} /> Build</span>
          </div>
          <p className="visual-note">Research · Hardware · Digital systems</p>
        </aside>
      </section>

      <section className="skill-band" aria-label="Skills and interests">
        <div className="shell skill-band-inner">
          <p>Working across the stack</p>
          <div className="skill-list">
            {["FPGA & RTL", "Embedded systems", "PCB design", "Sensor signal processing", "Machine learning", "Data analysis"].map((skill) => <span key={skill}>{skill}</span>)}
          </div>
        </div>
      </section>

      <section className="selected-work shell" id="selected-work">
        <div className="section-heading">
          <div><p className="eyebrow"><span>Selected work</span></p><h2>Signals, silicon, and systems.</h2></div>
          <p>A cross-section of research and engineering work—from multimodal biosensing to compact PCB design and research infrastructure.</p>
        </div>
        <div className="feature-grid">
          {featuredProjects.map((project, index) => (
            <Link href={`/projects/${project.slug}`} className="feature-card" key={project.slug}>
              <div className={`feature-media ${project.slug === "ce205-gravity-platformer" || project.slug === "neoflux" ? "feature-media-contain" : ""} ${project.slug === "ce205-gravity-platformer" ? "feature-media-ce205" : ""}`}>
                {project.featuredImages ? (
                  <div className="feature-media-split" aria-hidden="true">
                    {project.featuredImages.map((image) => <img src={assetPath(image)} alt="" key={image} />)}
                  </div>
                ) : (
                  <img src={assetPath(project.featuredImage!)} alt="" loading={index > 1 ? "lazy" : "eager"} />
                )}
                <span className="feature-number">{String(projects.indexOf(project) + 1).padStart(2, "0")}</span>
              </div>
              <div className="feature-copy">
                <div><p>{project.category} · {project.year}</p><h3>{project.title}</h3></div>
                <ArrowUpRight aria-hidden="true" />
              </div>
              <p className="feature-summary">{project.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="project-index shell" aria-labelledby="project-index-heading">
        <div className="section-heading compact">
          <div><p className="eyebrow"><span>Full index</span></p><h2 id="project-index-heading">Eleven projects, one evolving practice.</h2></div>
        </div>
        <div className="index-list">
          {projects.map((project, index) => (
            <Link href={`/projects/${project.slug}`} key={project.slug}>
              <span>{String(index + 1).padStart(2, "0")}</span><strong>{project.title}</strong><small>{project.category} · {project.year}</small><ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
