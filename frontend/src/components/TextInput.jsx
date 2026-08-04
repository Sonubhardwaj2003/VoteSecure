import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * Reusable labelled input with an optional left icon and inline validation
 * error. Errors are only shown when `touched` is true (blur or a failed
 * submit attempt) so the user isn't yelled at while they're still typing.
 */
export default function TextInput({
  label,
  icon: Icon,
  error,
  touched,
  hint,
  className = "",
  ...inputProps
}) {
  const showError = Boolean(touched && error);

  return (
    <div className={className}>
      {label && <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon
            className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
              showError ? "text-rose-400" : "text-slate-400"
            }`}
          />
        )}
        <input
          {...inputProps}
          aria-invalid={showError}
          className={`input-field ${Icon ? "pl-10" : ""} ${
            showError ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100" : ""
          }`}
        />
      </div>
      {showError ? (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-600">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
