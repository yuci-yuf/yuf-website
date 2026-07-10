/**
 * Passenger entry point for cPanel (CloudLinux Node.js Manager).
 *
 * cPanel's Node.js app runner uses Phusion Passenger, which does NOT run
 * `next start`. Instead it starts ONE long-lived Node process, imports the file
 * configured as the app's startup file, and expects that file to create an HTTP
 * server. Passenger provides the listening socket via the PORT env var (it may
 * be a unix socket path, so we pass whatever it gives us straight to listen()).
 *
 * This boots Next.js in production using the standard `.next` build produced by
 * `next build`. Requires: `next build` has run and NODE_ENV=production.
 */
const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
// Passenger sets PORT (often a socket path). Fall back to 3000 for local runs.
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res);
    }).listen(port, (err) => {
      if (err) throw err;
      // eslint-disable-next-line no-console
      console.log(`> Next.js ready on ${hostname}:${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start Next.js server:", err);
    process.exit(1);
  });
