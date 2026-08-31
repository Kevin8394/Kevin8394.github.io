/* eslint-disable @next/next/no-img-element -- source figures include GIF/PNG/PDF assets */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Box, Download, ExternalLink, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { StlViewer } from "@/app/components/stl-viewer";
import { getProject, projects, type ProjectMedia } from "@/app/data/projects";
import { assetPath } from "@/lib/site-path";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return project ? { title: project.title, description: project.summary } : { title: "Project" };
}

function MediaFrame({ media }: { media: ProjectMedia }) {
  if (media.kind === "stl" && media.src) {
    return (
      <figure className="media-figure wide stl-embed-figure">
        <StlViewer src={assetPath(media.src)} alt={media.alt} />
        <figcaption className="stl-embed-caption">
          <span>{media.caption}</span>
          <a className="pdf-reference-link" href={assetPath(media.src)} download>
            <Download size={16} /> {media.actionLabel ?? "Download STL"}
          </a>
        </figcaption>
      </figure>
    );
  }
  if (media.kind === "pdf" && media.src && media.embed) {
    return (
      <figure className="media-figure wide pdf-embed-figure">
        <div className="pdf-embed-frame">
          <iframe src={`${assetPath(media.src)}#view=FitH`} title={media.alt} loading="lazy" />
        </div>
        <figcaption className="pdf-embed-caption">
          <span>{media.caption}</span>
          <a className="pdf-reference-link" href={assetPath(media.src)} target="_blank" rel="noreferrer">
            <FileText size={16} /> {media.actionLabel ?? "Open PDF"}
          </a>
        </figcaption>
      </figure>
    );
  }
  if (media.kind === "pdf" && media.src && media.preview) {
    return (
      <figure className="media-figure wide">
        <a className="pdf-document" href={assetPath(media.src)} target="_blank" rel="noreferrer">
          <div className="image-frame">
            <img src={assetPath(media.preview)} alt={media.alt} loading="lazy" />
            <span className="pdf-action"><FileText size={16} /> {media.actionLabel ?? "Open symposium PDF"}</span>
          </div>
        </a>
        <figcaption>{media.caption}</figcaption>
      </figure>
    );
  }
  if (media.kind === "video" && media.src) {
    return (
      <figure className="media-figure wide">
        <div className="video-frame">
          <iframe src={media.src} title={media.alt} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" />
        </div>
        <figcaption>{media.caption}</figcaption>
      </figure>
    );
  }
  if (media.kind === "image" && media.src) {
    return (
      <figure className={`media-figure ${media.aspect ?? "wide"}`}>
        <div className="image-frame"><img src={assetPath(media.src)} alt={media.alt} loading="lazy" /></div>
        <figcaption>{media.caption}</figcaption>
      </figure>
    );
  }
  return (
    <figure className="media-figure wide">
      <div className="media-placeholder" role="img" aria-label={media.alt}>
        <Box size={34} strokeWidth={1.4} /><span>Onshape project media</span><small>CAD render / prototype photography</small>
      </div>
      <figcaption>{media.caption}</figcaption>
    </figure>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[(currentIndex - 1 + projects.length) % projects.length];
  const next = projects[(currentIndex + 1) % projects.length];

  return (
    <main className="project-page" id="main-content">
      <section className="project-hero shell">
        <div className="project-counter"><span>{String(currentIndex + 1).padStart(2, "0")}</span><small>/ {String(projects.length).padStart(2, "0")}</small></div>
        <div className="project-title-block">
          <p className="eyebrow"><span>{project.category} · {project.year}</span></p>
          <h1>{project.title}</h1><p className="project-summary">{project.summary}</p>
        </div>
        <div className="project-context"><p>Context</p><strong>{project.organization}</strong><span>{project.year}</span></div>
      </section>

      {project.metrics && (
        <section className="metrics shell" aria-label="Project highlights">
          {project.metrics.map((metric) => <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}
        </section>
      )}

      <section className="project-narrative shell">
        <div className="narrative-intro"><p className="eyebrow"><span>Project overview</span></p><p>{project.overview}</p></div>
        <div className="story-grid">
          <article><span>01</span><h2>Role</h2><p>{project.role}</p></article>
          <article><span>02</span><h2>Contribution</h2><p>{project.contribution}</p></article>
          <article><span>03</span><h2>Result</h2><p>{project.result}</p></article>
        </div>
        <div className="tool-row" aria-label="Tools and methods"><span>Tools & methods</span><div>{project.tools.map((tool) => <em key={tool}>{tool}</em>)}</div></div>
      </section>

      <section className="project-media shell">
        <div className="section-heading compact">
          <div><p className="eyebrow"><span>Selected figures</span></p><h2>Inside the work.</h2></div>
          <p>Figures and recordings drawn from the project documentation.</p>
        </div>
        <div className="media-grid">{project.media.map((media, index) => <MediaFrame key={`${media.caption}-${index}`} media={media} />)}</div>
      </section>

      <nav className="project-pagination shell" aria-label="Adjacent projects">
        <Link href={`/projects/${previous.slug}`}><ArrowLeft size={19} /><span><small>Previous</small>{previous.title}</span></Link>
        <Link href="/">Project index <ExternalLink size={15} /></Link>
        <Link href={`/projects/${next.slug}`}><span><small>Next</small>{next.title}</span><ArrowRight size={19} /></Link>
      </nav>
    </main>
  );
}
