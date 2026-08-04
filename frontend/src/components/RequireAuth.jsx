import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Route guard: redirects to the login page (with a friendly "please log in"
 * message) unless the visitor has a voter or admin session. Wrap any route
 * that shouldn't be viewable by an anonymous visitor.
 *
 * allow: "voter" | "admin" | "any" — which session(s) satisfy the guard.
 */
export default function RequireAuth({ allow = "any", children }) {
  const location = useLocation();
  const hasVoter = !!localStorage.getItem("voterToken");
  const hasAdmin = !!localStorage.getItem("adminToken");

  const isAllowed =
    allow === "voter" ? hasVoter : allow === "admin" ? hasAdmin : hasVoter || hasAdmin;

  if (!isAllowed) {
    return <Navigate to="/" replace state={{ authRequired: true, from: location.pathname }} />;
  }

  return children;
}
