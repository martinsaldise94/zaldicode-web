// Smoke test: valida la migración a Tailwind compilado y el hero.
// Requiere un servidor estático en BASE_URL (por defecto http://localhost:4321).
// Uso: node tests/smoke.mjs
import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://localhost:4321";
let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) failures++;
};

const browser = await chromium.launch();
const page = await browser.newPage();

// Registramos errores de consola/red y peticiones al CDN eliminado.
const consoleErrors = [];
const cdnHits = [];
let tailwindStatus = null;
// Avisos preexistentes por entregar CSP/XFO vía <meta> (deben ir por cabecera
// HTTP del servidor, no es regresión de esta migración): se ignoran.
const benign = ["frame-ancestors", "X-Frame-Options"];
page.on("console", (m) => {
  if (m.type() !== "error") return;
  const t = m.text();
  if (benign.some((b) => t.includes(b))) return;
  consoleErrors.push(t);
});
page.on("request", (r) => {
  if (r.url().includes("cdn.tailwindcss.com")) cdnHits.push(r.url());
});
page.on("response", (r) => {
  if (r.url().includes("/assets/tailwind.css")) tailwindStatus = r.status();
});

await page.goto(base + "/index.html", { waitUntil: "networkidle" });

ok(cdnHits.length === 0, "no se carga cdn.tailwindcss.com (Tailwind compilado)");
ok(tailwindStatus === 200, "assets/tailwind.css responde 200");

const h1 = page.locator("#hero h1");
ok(await h1.isVisible(), "el titular del hero es visible");

// Tailwind aplicado: el peso del titular debe estar resuelto (no 400 por defecto).
const fw = await h1.evaluate((el) => getComputedStyle(el).fontWeight);
ok(Number(fw) >= 700, `titular en negrita (font-weight ${fw}, Tailwind activo)`);

ok(
  await page.locator('#hero a[href="#contacto"]').first().isVisible(),
  "CTA primario 'Hablemos' presente",
);
ok(
  await page.locator('#hero a[href="#servicios"]').isVisible(),
  "CTA secundario 'Ver lo que hago' presente",
);
ok(
  (await page.locator(".hero-trust li").count()) === 3,
  "3 señales de confianza en el hero",
);

// El formulario de contacto existe (DOMPurify/EmailJS van con defer).
ok(await page.locator("#contact-form").count() > 0, "formulario de contacto presente");

// Página legal: Tailwind compilado también aplicado.
await page.goto(base + "/legal/cookies.html", { waitUntil: "networkidle" });
ok(
  (await page.locator("body").evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  )) !== "rgba(0, 0, 0, 0)",
  "página legal renderiza con estilos",
);

ok(consoleErrors.length === 0, `sin errores de consola (${consoleErrors.length})`);
if (consoleErrors.length) console.log("  ", consoleErrors.join("\n   "));

await browser.close();
console.log(failures === 0 ? "\nTODO OK" : `\n${failures} fallo(s)`);
process.exit(failures === 0 ? 0 : 1);
