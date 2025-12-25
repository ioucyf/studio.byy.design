if ("serviceWorker" in navigator) {
  const showUpdateButton = (registration) => {
    const updateButton = document.querySelector("#update-button");
    if (registration.waiting) {
      updateButton.classList.add("update");
      updateButton.addEventListener("click", () => {
        // Tell the waiting service worker to activate
        registration.waiting.postMessage({ action: "skipWaiting" });
      });
    }
  };

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service worker registered.");

        // Check for an update every hour
        setInterval(() => {
          registration.update();
        }, 1000 * 60 * 60);

        // Show update button if a new service worker is waiting
        showUpdateButton(registration);

        // When a new SW is installed, check if it's waiting
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              showUpdateButton(registration);
            }
          });
        });
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });

    // Reload the page if a new service worker has taken control
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  });
}
