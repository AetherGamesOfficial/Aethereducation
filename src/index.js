import { createServer } from "node:http";
import { hostname } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import wisp from "wisp-server-node";

import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");
const app = express();

const pages = new Set([
	"/studyhub.html",
	"/research.html",
	"/research-uv-test.html",
	"/resources.html",
	"/enrichment.html",
	"/loading.html",
	"/page-loader.js",
]);

app.use(express.static(join(root, "public"), { index: false }));
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/baremux/", express.static(baremuxPath));

app.get("/", (_req, res) => {
	res.sendFile(join(root, "studyhub.html"));
});

app.get("/healthz", (_req, res) => {
	res.type("text/plain").send("ok");
});

app.get("/favicon.ico", (_req, res) => {
	res.status(204).end();
});

app.get([...pages], (req, res) => {
	res.sendFile(join(root, req.path.slice(1)));
});

app.use((_req, res) => {
	res.status(404).sendFile(join(root, "public", "404.html"));
});

const server = createServer((req, res) => {
	const url = req.url || "";
	const needsProxyIsolation =
		url.startsWith("/research") ||
		url.startsWith("/uv/") ||
		url.startsWith("/uv-test/") ||
		url.startsWith("/baremux/") ||
		url.startsWith("/epoxy/") ||
		url.startsWith("/register-sw.js");

	if (needsProxyIsolation) {
		res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
		res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
	}

	app(req, res);
});

server.on("upgrade", (req, socket, head) => {
	if (req.url?.endsWith("/wisp/")) {
		wisp.routeRequest(req, socket, head);
		return;
	}

	socket.end();
});

const port = Number.parseInt(process.env.PORT || "8080", 10);

server.on("listening", () => {
	const address = server.address();
	console.log("AETHER Study Hub listening on:");
	console.log(`\thttp://localhost:${address.port}`);
	console.log(`\thttp://${hostname()}:${address.port}`);
});

function shutdown() {
	server.close();
	process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen({ port });
