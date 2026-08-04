import React, { useState } from "react";
import { User, CreditCard, Mail, Phone, MapPin, Calendar, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import FaceCapture from "../components/FaceCapture";
import TextInput from "../components/TextInput";
import Alert from "../components/Alert";
import api from "../utils/api";
import { validators } from "../utils/validators";
import useFormValidation from "../hooks/useFormValidation";
import useMessage from "../hooks/useMessage";

const fieldDefs = [
  { name: "fullName", label: "Full Name", type: "text", icon: User, placeholder: "As per your ID" },
  {
    name: "voterId",
    label: "Voter ID",
    type: "text",
    icon: CreditCard,
    placeholder: "12-digit Voter ID",
    span: true,
    inputMode: "numeric",
    maxLength: 12,
  },
  { name: "email", label: "Email", type: "email", icon: Mail, placeholder: "you@example.com" },
  { name: "phone", label: "Phone Number", type: "tel", icon: Phone, placeholder: "10-digit mobile number", inputMode: "numeric", maxLength: 10 },
  { name: "constituency", label: "Constituency", type: "text", icon: MapPin, placeholder: "Your constituency" },
  { name: "dateOfBirth", label: "Date of Birth", type: "date", icon: Calendar, placeholder: "" },
];

const schema = {
  fullName: validators.fullName,
  voterId: validators.voterId,
  email: validators.email,
  phone: validators.phone,
  constituency: validators.constituency,
  dateOfBirth: validators.dateOfBirth,
};

const emptyValues = { fullName: "", voterId: "", email: "", phone: "", constituency: "", dateOfBirth: "" };

export default function Register() {
  const { values, errors, touched, handleChange, handleBlur, validateForm, reset } = useFormValidation(
    emptyValues,
    schema
  );
  const [descriptor, setDescriptor] = useState(null);
  const [message, setMessage] = useMessage();
  const [submitting, setSubmitting] = useState(false);
  // Bumped on every successful submit; using it as the form's `key` forces
  // React to fully remount every input (guaranteed clean slate, including
  // the face-capture camera step) instead of relying only on state resets.
  const [formVersion, setFormVersion] = useState(0);

  const handleFieldChange = (e) => {
    if (e.target.name === "voterId") {
      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 12);
      handleChange({ target: { name: "voterId", value: digitsOnly } });
      return;
    }
    if (e.target.name === "phone") {
      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
      handleChange({ target: { name: "phone", value: digitsOnly } });
      return;
    }
    handleChange(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formOk = validateForm();
    if (!descriptor) {
      setMessage(
        formOk
          ? "Please capture your face before submitting."
          : "Please fix the highlighted fields and capture your face before submitting."
      );
      return;
    }
    if (!formOk) {
      setMessage("Please fix the highlighted fields before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/auth/register", { ...values, faceDescriptor: descriptor });
      setMessage(res.data.message, { persist: true });
      reset(emptyValues);
      setDescriptor(null);
      setFormVersion((v) => v + 1);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed", { persist: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="blob -right-24 -top-24 h-72 w-72 animate-float bg-brand-200 opacity-30" />
      <div className="relative z-10 mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
            <UserPlus className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-ink-900">Voter Registration</h1>
            <p className="text-sm text-slate-500">Reviewed by an admin before you can vote</p>
          </div>
        </div>

        <div className="card card-hover animate-fade-in">
          <form key={formVersion} onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                1
              </span>
              <h3 className="text-sm font-bold text-ink-900">Your details</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fieldDefs.map((f) => (
                <TextInput
                  key={f.name}
                  name={f.name}
                  type={f.type}
                  label={f.label}
                  icon={f.icon}
                  placeholder={f.placeholder}
                  value={values[f.name]}
                  onChange={handleFieldChange}
                  onBlur={handleBlur}
                  error={errors[f.name]}
                  touched={touched[f.name]}
                  className={f.span ? "sm:col-span-2" : ""}
                  inputMode={f.inputMode}
                  maxLength={f.maxLength}
                  max={f.name === "dateOfBirth" ? new Date().toISOString().split("T")[0] : undefined}
                />
              ))}
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  2
                </span>
                <h3 className="text-sm font-bold text-ink-900">Capture your face</h3>
              </div>
              <FaceCapture
                buttonLabel="Capture & Save Face"
                onCapture={(d) => {
                  setDescriptor(d);
                  setMessage("Face captured. You can now submit the form.");
                }}
              />
              {descriptor && (
                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Face captured
                </p>
              )}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Submitting…" : "Register"}
            </button>

            <Alert message={message} />
          </form>
        </div>
      </div>
    </div>
  );
}
