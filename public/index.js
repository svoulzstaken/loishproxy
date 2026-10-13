"use strict";
/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("uv-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("uv-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("uv-error-code");
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	try {
		await registerSW();
	} catch (err) {
		error.textContent = "Failed to register service worker.";
		errorCode.textContent = err.toString();
		throw err;
	}

	const url = search(address.value, searchEngine.value);

	let frame = document.getElementById("uv-frame");
	frame.style.display = "block";

	// Use Bare transport (pure HTTP) instead of Epoxy (WebSocket)
	// This works on networks that block WebSocket connections
	const bareUrl = location.origin + "/bare/";
	await connection.setTransport("/bare-transport/index.mjs", [bareUrl]);

	frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
});

const cloakBtn = document.getElementById("cloak-btn");
if (cloakBtn) {
	cloakBtn.addEventListener("click", () => {
		const win = window.open("about:blank", "_blank");
		if (!win) {
			alert("Please allow popups to open the cloaked session!");
			return;
		}
		win.document.title = "Google Classroom";
		const iframe = win.document.createElement("iframe");
		iframe.style.position = "fixed";
		iframe.style.inset = "0";
		iframe.style.width = "100vw";
		iframe.style.height = "100vh";
		iframe.style.border = "none";
		iframe.style.margin = "0";
		iframe.style.padding = "0";
		iframe.src = location.href;
		win.document.body.style.margin = "0";
		win.document.body.appendChild(iframe);
	});
}
