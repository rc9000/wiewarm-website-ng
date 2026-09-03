export function SiteFooter() {
  return <footer className="site-footer"><div className="site-shell footer-inner">
    <p>© wiewarm.ch 2001–{new Date().getFullYear()}</p>
    <p>Daten unter <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>{' · '}<a href="https://github.com/wiewarm/wiewarm-website">Open Source</a></p>
  </div></footer>;
}
