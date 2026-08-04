import { useCallback, useRef, useState } from "react";

/**
 * Like useState for a status/alert message, but auto-clears itself after
 * a few seconds so success/info banners don't sit on screen forever.
 * Pass { persist: true } (e.g. for blocking errors you want the user to
 * read at their own pace) to skip the auto-dismiss for a given call.
 */
export default function useMessage(defaultDuration = 4000) {
  const [message, setMessageState] = useState("");
  const timerRef = useRef(null);

  const setMessage = useCallback(
    (text, { duration = defaultDuration, persist = false } = {}) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessageState(text);
      if (text && !persist) {
        timerRef.current = setTimeout(() => setMessageState(""), duration);
      }
    },
    [defaultDuration]
  );

  const clearMessage = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessageState("");
  }, []);

  return [message, setMessage, clearMessage];
}
