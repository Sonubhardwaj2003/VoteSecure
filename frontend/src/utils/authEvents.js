// Navbar is mounted once, above <Routes>, so it never remounts when the
// user logs in/out on a different page. This tiny pub/sub lets any
// component announce "auth state changed" so Navbar (and anything else)
// can immediately re-check localStorage and re-render, without a full
// page reload.
const AUTH_EVENT = "vs-auth-change";

export const notifyAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const subscribeAuthChange = (callback) => {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback); // syncs across browser tabs too
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
};