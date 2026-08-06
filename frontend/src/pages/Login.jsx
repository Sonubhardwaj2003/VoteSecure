import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  KeyRound,
  ScanFace,
  MailCheck,
  ShieldCheck,
  Loader2,
  Sparkles,
} from "lucide-react";
import { notifyAuthChange } from "../utils/authEvents";
import FaceCapture from "../components/FaceCapture";
import TextInput from "../components/TextInput";
import Alert from "../components/Alert";
import api from "../utils/api";
import { validators } from "../utils/validators";
import useMessage from "../hooks/useMessage";

const trustBadges = [
  { icon: ScanFace, label: "Live face verification" },
  { icon: MailCheck, label: "Email OTP 2FA" },
  { icon: ShieldCheck, label: "One vote per identity" },
];

export default function Login() {
  const [voterId, setVoterId] = useState("");
  const [voterIdError, setVoterIdError] = useState("");
  const [voterIdTouched, setVoterIdTouched] = useState(false);

  const [step, setStep] = useState("face"); // "face" -> "otp"
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpTouched, setOtpTouched] = useState(false);

  const [message, setMessage] = useMessage();
  const [maskedEmail, setMaskedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.authRequired) {
      setMessage("Please log in to continue.", { persist: true });
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVoterIdChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 12);
    setVoterId(digitsOnly);
    if (voterIdTouched) setVoterIdError(validators.voterId(digitsOnly));
  };

  const handleFaceCapture = async (descriptor) => {
    const err = validators.voterId(voterId);
    setVoterIdTouched(true);
    setVoterIdError(err);
    if (err) {
      setMessage("Please fix the Voter ID field before verifying your face.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login/face", {
        voterId,
        faceDescriptor: descriptor,
      });
      setMaskedEmail(res.data.maskedEmail);
      setMessage(res.data.message);
      setResendCooldown(30);
      setStep("otp");
    } catch (err) {
      setMessage(err.response?.data?.message || "Face verification failed", {
        persist: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const err = validators.otp(otp);
    setOtpTouched(true);
    setOtpError(err);
    if (err) return;

    setLoading(true);
    try {
      const res = await api.post("/auth/login/verify-otp", {
        voterId,
        code: otp,
      });
      localStorage.setItem("voterToken", res.data.token);
      localStorage.setItem("voter", JSON.stringify(res.data.voter));
      notifyAuthChange();
      navigate("/vote");
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed", {
        persist: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    setResending(true);
    try {
      const res = await api.post("/auth/login/resend-otp", { voterId });
      setMaskedEmail(res.data.maskedEmail);
      setMessage(res.data.message);
      setResendCooldown(30);
      setOtp("");            // <-- naya: purana OTP input clear karo
      setOtpTouched(false);  // <-- naya: error message bhi hide ho jayega
      setOtpError("");       // <-- naya
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not resend OTP", {
        persist: true,
      });
    } finally {
      setResending(false);
    }
  };
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="blob -left-20 -top-20 h-72 w-72 animate-float bg-brand-300" />
        <div
          className="blob -right-16 top-10 h-64 w-64 animate-float bg-indigo-300"
          style={{ animationDelay: "2s" }}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <span className="badge-slate mb-4 inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-brand-600" />
            Every identity verified, every vote counted
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Your Vote. <span className="text-brand-600">Verified.</span>{" "}
            Secured.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
            VoteSecure brings elections to anyone with a camera and a browser —
            no travel, no queues, no impersonation. Every voter proves who they
            are with a live face check and a one-time email code before their
            vote is ever counted. Inspired by real-world remote-voting efforts
            like India's Remote Voting Machine proposal and Estonia's i-Voting
            system.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {trustBadges.map((b) => (
              <span
                key={b.label}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
              >
                <b.icon className="h-3.5 w-3.5 text-brand-600" />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <div className="card card-hover animate-fade-in">
          <h2 className="text-lg font-bold text-ink-900">Voter Login</h2>
          <p className="mt-1 text-sm text-slate-500">
            {step === "face"
              ? "Enter your Voter ID, then verify your face to continue."
              : "Enter the OTP sent to your registered email."}
          </p>

          <div className="mt-5 flex flex-col gap-4">
            {step === "face" && (
              <>
                <TextInput
                  label="Voter ID"
                  icon={CreditCard}
                  placeholder="12-digit Voter ID"
                  value={voterId}
                  onChange={handleVoterIdChange}
                  onBlur={() => {
                    setVoterIdTouched(true);
                    setVoterIdError(validators.voterId(voterId));
                  }}
                  error={voterIdError}
                  touched={voterIdTouched}
                  inputMode="numeric"
                  maxLength={12}
                />
                <FaceCapture
                  buttonLabel="Verify Face"
                  onCapture={handleFaceCapture}
                />
                {loading && (
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Checking face…
                  </p>
                )}
              </>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <p className="text-sm text-slate-600">
                  Enter the 6-digit OTP sent to{" "}
                  <span className="font-semibold">{maskedEmail}</span>
                </p>
                <TextInput
                  label="OTP Code"
                  icon={KeyRound}
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    const digitsOnly = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);
                    setOtp(digitsOnly);
                    if (otpTouched) setOtpError(validators.otp(digitsOnly));
                  }}
                  onBlur={() => {
                    setOtpTouched(true);
                    setOtpError(validators.otp(otp));
                  }}
                  error={otpError}
                  touched={otpTouched}
                  inputMode="numeric"
                  maxLength={6}
                  className="[&_input]:text-center [&_input]:text-lg [&_input]:tracking-[0.5em]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Verifying…" : "Verify & Login"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || resending}
                  className="btn-secondary"
                >
                  {resending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {resendCooldown > 0
                    ? `Resend OTP in ${resendCooldown}s`
                    : "Resend OTP"}
                </button>
              </form>
            )}

            <Alert message={message} />
          </div>
        </div>
      </div>
    </div>
  );
}
