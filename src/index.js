import { createServer } from "node:http";
import { hostname } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bootstrap } from "@mercuryworkshop/proxy-bootstrap";
import express from "express";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");
const app = express();
const scramjet = await bootstrap({
	transport: "libcurl",
});

const pages = new Set([
	"/studyhub.html",
	"/research.html",
	"/resources.html",
	"/enrichment.html",
	"/loading.html",
	"/settings.html",
	"/page-loader.js",
	"/aether-favicon.png",
]);

app.use(express.static(join(root, "public"), { index: false }));

app.get("/", (_req, res) => {
	res.sendFile(join(root, "studyhub.html"));
});

app.get("/healthz", (_req, res) => {
	res.type("text/plain").send("ok");
});

app.get("/favicon.ico", (_req, res) => {
	res.type("png").sendFile(join(root, "aether-favicon.png"));
});

app.get([...pages], (req, res) => {
	res.sendFile(join(root, req.path.slice(1)));
});

app.use((_req, res) => {
	res.status(404).sendFile(join(root, "public", "404.html"));
});

const server = createServer((req, res) => {
	const url = req.url || "";
	if (scramjet.routeRequest(req, res)) {
		return;
	}

	const needsProxyIsolation =
		url.startsWith("/research") ||
		url.startsWith("/~/sj/") ||
		url.startsWith("/clients/") ||
		url.startsWith("/controller/") ||
		url.startsWith("/scram/") ||
		url.startsWith("/bootstrap-init.js") ||
		url.startsWith("/sw.js") ||
		url.startsWith("/wisp/");

	if (needsProxyIsolation) {
		res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
		res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
	}

	app(req, res);
});

server.on("upgrade", (req, socket, head) => {
	if (scramjet.routeUpgrade(req, socket, head)) {
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
