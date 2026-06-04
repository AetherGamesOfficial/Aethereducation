"use strict";

const swAllowedHostnames = ["localhost", "127.0.0.1"];

function getStockSW() {
	return self.__uv$config?.bundle?.replace(/uv\.bundle\.js$/, "sw.js") || "/uv/sw.js";
}

function getUvScope() {
	const prefix = self.__uv$config?.prefix || "/uv/service/";
	const serviceIndex = prefix.indexOf("/service/");

	return serviceIndex === -1 ? "/uv/" : prefix.slice(0, serviceIndex + 1);
}

async function registerSW() {
	if (!navigator.serviceWorker) {
		if (
			location.protocol !== "https:" &&
			!swAllowedHostnames.includes(location.hostname)
		) {
			throw new Error("Service workers cannot be registered without https.");
		}

		throw new Error("Your browser does not support service workers.");
	}

	const stockSW = getStockSW();
	const scope = getUvScope();
	const registration = await navigator.serviceWorker.register(stockSW, {
		scope,
	});

	if (registration.installing) {
		await new Promise((resolve) => {
			const timeout = setTimeout(resolve, 3000);

			registration.installing.addEventListener("statechange", () => {
				if (registration.active) {
					clearTimeout(timeout);
					resolve();
				}
			});
		});
	}

	return registration;
}
