// Registers the service worker and keeps the installed PWA fresh:
// - checks for a new deployed version every 60 seconds
// - also checks immediately whenever the installed app comes back to the
//   foreground (e.g. reopened from the home screen / taskbar)
// - once a new version takes over, reloads automatically — no manual
//   uninstall/reinstall needed ever again after this update ships
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      setInterval(() => registration.update(), 60000);

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") registration.update();
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    });
  });
}
