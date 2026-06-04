(function () {
    if (window.location.pathname.endsWith("/loading.html")) return;

    const loader = document.createElement("iframe");
    loader.id = "page-loader";
    loader.title = "Loading";
    loader.src = "loading.html";
    loader.setAttribute("aria-hidden", "true");
    loader.style.cssText = [
        "position:fixed",
        "inset:0",
        "width:100vw",
        "height:100vh",
        "border:0",
        "z-index:2147483647",
        "background:#000",
        "opacity:1",
        "transition:opacity 520ms ease",
        "pointer-events:none",
    ].join(";");

    document.body.prepend(loader);

    function hideLoader() {
        loader.style.opacity = "0";
        window.setTimeout(() => loader.remove(), 560);
    }

    if (document.readyState === "complete") {
        window.setTimeout(hideLoader, 250);
    } else {
        window.addEventListener("load", () => window.setTimeout(hideLoader, 250), { once: true });
    }
})();
