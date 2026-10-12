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
	
	// Always set the fresh high-speed Wisp transport so it overwrites any stale cache in IndexedDB
	let wispUrl = "wss://wisp.mercurywork.shop/";
	try {
		await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
	} catch (err) {
		console.error("setTransport error:", err);
	}
	
	frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
});
