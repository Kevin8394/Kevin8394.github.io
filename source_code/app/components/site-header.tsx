"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { projects } from "@/app/data/projects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const directProjects = projects.slice(0, 8);
const moreProjects = projects.slice(8);

export function SiteHeader() {
  const rawPathname = usePathname();
  const pathname = rawPathname !== "/" ? rawPathname.replace(/\/+$/, "") : "/";
  return (
    <header className="site-header">
      <div className="header-main shell">
        <Link href="/" className="wordmark" aria-label="Kevin Lin portfolio home">
          <span className="wordmark-mark">KL</span>
          <span className="wordmark-copy"><strong>Kevin Lin</strong><small>Computer Engineering</small></span>
        </Link>
        <div className="header-meta">
          <span className="status-dot" aria-hidden="true" />
          Northwestern · BS/MS
        </div>
      </div>
      <div className="project-nav-wrap">
        <nav className="project-nav shell" aria-label="Portfolio navigation">
          <Link className={pathname === "/" ? "nav-tab active" : "nav-tab"} href="/">Home</Link>
          {directProjects.map((project) => (
            <Link key={project.slug} className={pathname === `/projects/${project.slug}` ? "nav-tab active" : "nav-tab"} href={`/projects/${project.slug}`}>
              {project.navLabel}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={moreProjects.some((project) => pathname === `/projects/${project.slug}`) ? "nav-tab nav-dropdown-trigger active" : "nav-tab nav-dropdown-trigger"}>
                More Projects <ChevronDown size={13} aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="project-dropdown-content">
              {moreProjects.map((project) => (
                <DropdownMenuItem asChild key={project.slug}>
                  <Link className={pathname === `/projects/${project.slug}` ? "dropdown-project active" : "dropdown-project"} href={`/projects/${project.slug}`}>
                    <span>{project.navLabel}</span><small>{project.year}</small>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
