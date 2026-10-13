import { join } from "node:path";
import { hostname } from "node:os";
import { createServer } from "node:http";
import express from "express";
import wisp from "wisp-server-node";
import { createBareServer } from "@tomphttp/bare-server-node";

import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

// Create Bare server at /bare/ for HTTP-only transport (no WebSocket needed)
// Increase connectionLimiter so Cloudflare/Railway reverse-proxy IP doesn't trigger 429
const bare = createBareServer("/bare/", {
	connectionLimiter: {
		maxConnectionsPerIP: 1000,
		windowDuration: 60,
		blockDuration: 1,
	},
});

const app = express();
// Load our publicPath first and prioritize it over UV.
app.use(express.static("./public"));
// Load vendor files last.
// The vendor's uv.config.js won't conflict with our uv.config.js inside the publicPath directory.
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));

// Serve our patched bare-transport client files first
app.use("/bare-transport/", express.static("./public/bare-transport"));
app.use("/bare-transport/", express.static(join(import.meta.dirname, "../node_modules/@mercuryworkshop/bare-transport/dist")));

// Error for everything else
app.use((req, res) => {
	res.status(404);
	res.sendFile("./public/404.html");
});

const server = createServer();

server.on("request", (req, res) => {
	res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
	res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

	// Route bare server requests first
	if (bare.shouldRoute(req)) {
		bare.routeRequest(req, res);
		return;
	}

	app(req, res);
});

server.on("upgrade", (req, socket, head) => {
	// Bare server WebSocket upgrades (for proxied WebSocket sites)
	if (bare.shouldRoute(req)) {
		bare.routeUpgrade(req, socket, head);
		return;
	}
	// Wisp WebSocket upgrades (kept as fallback)
	if (req.url.endsWith("/wisp/")) {
		wisp.routeRequest(req, socket, head);
		return;
	}
	socket.end();
});

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 8080;

server.on("listening", () => {
	const address = server.address();

	// by default we are listening on 0.0.0.0 (every interface)
	// we just need to list a few
	console.log("Listening on:");
	console.log(`\thttp://localhost:${address.port}`);
	console.log(`\thttp://${hostname()}:${address.port}`);
	console.log(
		`\thttp://${
			address.family === "IPv6" ? `[${address.address}]` : address.address
		}:${address.port}`
	);
});

// https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
	console.log("SIGTERM signal received: closing HTTP server");
	server.close();
	process.exit(0);
}

server.listen({
	port,
});
