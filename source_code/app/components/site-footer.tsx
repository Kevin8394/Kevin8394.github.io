import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <p>Kevin Lin · Computer Engineering BS/MS · Northwestern University</p>
        <Link href="/">Back to home</Link>
      </div>
    </footer>
  );
}
