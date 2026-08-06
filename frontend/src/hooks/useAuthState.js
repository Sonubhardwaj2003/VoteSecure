import { useCallback, useEffect, useState } from "react";
import { subscribeAuthChange } from "../utils/authEvents";

const readAuthState = () => ({
  isVoter: !!localStorage.getItem("voterToken"),
  isAdmin: !!localStorage.getItem("adminToken"),
});

export default function useAuthState() {
  const [state, setState] = useState(readAuthState);
  const refresh = useCallback(() => setState(readAuthState()), []);

  useEffect(() => subscribeAuthChange(refresh), [refresh]);

  return state; // { isVoter, isAdmin }
}