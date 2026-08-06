import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  UserCheck,
  Users,
  Vote as VoteIcon,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { notifyAuthChange } from "../utils/authEvents";
import api from "../utils/api";
import Alert from "../components/Alert";
import TextInput from "../components/TextInput";
import { validators } from "../utils/validators";
import useFormValidation from "../hooks/useFormValidation";
import useMessage from "../hooks/useMessage";

const loginSchema = { email: validators.email, password: validators.password };
const candidateSchema = {
  name: validators.requiredText("Candidate name"),
  party: validators.requiredText("Party"),
  constituency: validators.constituency,
};
const emptyCandidate = { name: "", party: "", constituency: "" };

export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("adminToken"));
  const [voters, setVoters] = useState([]);
  const [message, setMessage] = useMessage();
  const [loadingVoters, setLoadingVoters] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [addingCandidate, setAddingCandidate] = useState(false);
  // Bumped after a successful "Add Candidate" submit; used as the form's
  // `key` to guarantee the fields fully clear (not just React state, but
  // the actual rendered inputs are remounted fresh).
  const [candidateFormVersion, setCandidateFormVersion] = useState(0);

  const login = useFormValidation({ email: "", password: "" }, loginSchema);
  const candidate = useFormValidation(emptyCandidate, candidateSchema);

  const loadVoters = () => {
    setLoadingVoters(true);
    api
      .get("/admin/voters")
      .then((res) => setVoters(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          // Session expired or invalid — bounce back to the login screen
          // instead of showing a broken dashboard.
          setLoggedIn(false);
          setMessage("Your session has expired. Please log in again.", { persist: true });
        } else {
          setMessage(err.response?.data?.message || "Could not load voters", { persist: true });
        }
      })
      .finally(() => setLoadingVoters(false));
  };

  useEffect(() => {
    if (loggedIn) loadVoters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!login.validateForm()) return;

    setLoginLoading(true);
    try {
      const res = await api.post("/admin/login", login.values);
      localStorage.setItem("adminToken", res.data.token);
      notifyAuthChange();
      setLoggedIn(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed", { persist: true });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    notifyAuthChange();
    setLoggedIn(false);
    setVoters([]);
    login.reset();
  };

  const handleVerify = async (id) => {
    try {
      await api.patch(`/admin/voters/${id}/verify`);
      setMessage("Voter verified successfully.");
      loadVoters();
    } catch (err) {
      if (err.response?.status === 401) {
        setLoggedIn(false);
        setMessage("Your session has expired. Please log in again.", { persist: true });
      } else {
        setMessage(err.response?.data?.message || "Could not verify voter", { persist: true });
      }
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!candidate.validateForm()) return;

    setAddingCandidate(true);
    try {
      await api.post("/candidates", candidate.values);
      setMessage("Candidate added successfully.");
      candidate.reset(emptyCandidate);
      setCandidateFormVersion((v) => v + 1);
    } catch (err) {
      if (err.response?.status === 401) {
        setLoggedIn(false);
        setMessage("Your session has expired. Please log in again.", { persist: true });
      } else {
        setMessage(err.response?.data?.message || "Failed to add candidate", { persist: true });
      }
    } finally {
      setAddingCandidate(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="relative overflow-hidden">
        <div className="bg-dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-sm px-4 py-16 sm:px-6">
          <div className="card card-hover animate-fade-in">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ink-800 to-ink-900 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-ink-900">Admin Login</h2>
            </div>
            <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
              <TextInput
                name="email"
                type="email"
                label="Email"
                icon={Mail}
                placeholder="admin@example.com"
                value={login.values.email}
                onChange={login.handleChange}
                onBlur={login.handleBlur}
                error={login.errors.email}
                touched={login.touched.email}
              />
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={login.values.password}
                    onChange={login.handleChange}
                    onBlur={login.handleBlur}
                    className={`input-field pl-10 pr-10 ${
                      login.touched.password && login.errors.password
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {login.touched.password && login.errors.password && (
                  <p className="mt-1 text-xs font-medium text-rose-600">{login.errors.password}</p>
                )}
              </div>
              <button type="submit" disabled={loginLoading} className="btn-primary">
                {loginLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loginLoading ? "Logging in…" : "Login"}
              </button>
              <Alert message={message} />
            </form>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = voters.filter((v) => !v.isVerified).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Admin Dashboard</h1>
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <Users className="h-3.5 w-3.5" />
            {voters.length} registered voter{voters.length !== 1 && "s"} · {pendingCount} pending verification
          </p>
        </div>
        <button onClick={handleLogout} className="btn-secondary">
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>

      {message && (
        <div className="mb-4">
          <Alert message={message} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Add candidate */}
        <div className="card card-hover animate-fade-in lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <PlusCircle className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-bold text-ink-900">Add Candidate</h3>
          </div>
          <form key={candidateFormVersion} onSubmit={handleAddCandidate} className="flex flex-col gap-3" noValidate>
            <TextInput
              name="name"
              label="Name"
              placeholder="Candidate name"
              value={candidate.values.name}
              onChange={candidate.handleChange}
              onBlur={candidate.handleBlur}
              error={candidate.errors.name}
              touched={candidate.touched.name}
            />
            <TextInput
              name="party"
              label="Party"
              placeholder="Political party"
              value={candidate.values.party}
              onChange={candidate.handleChange}
              onBlur={candidate.handleBlur}
              error={candidate.errors.party}
              touched={candidate.touched.party}
            />
            <TextInput
              name="constituency"
              label="Constituency"
              placeholder="Constituency"
              value={candidate.values.constituency}
              onChange={candidate.handleChange}
              onBlur={candidate.handleBlur}
              error={candidate.errors.constituency}
              touched={candidate.touched.constituency}
            />
            <button type="submit" disabled={addingCandidate} className="btn-primary">
              {addingCandidate && <Loader2 className="h-4 w-4 animate-spin" />}
              {addingCandidate ? "Adding…" : "Add Candidate"}
            </button>
          </form>
        </div>

        {/* Pending verifications */}
        <div className="card card-hover animate-fade-in lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <UserCheck className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-bold text-ink-900">Voter Verifications</h3>
          </div>
          <div className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto pr-1">
            {loadingVoters ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
              </div>
            ) : voters.length === 0 ? (
              <p className="rounded-lg bg-slate-50 py-6 text-center text-sm text-slate-500">
                No voters registered yet.
              </p>
            ) : (
              voters.map((v) => (
                <div
                  key={v._id}
                  className="card-hover flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3"
                >
                  <div>
                    <p className="font-semibold text-ink-900">
                      {v.fullName} <span className="font-normal text-slate-500">({v.voterId})</span>
                    </p>
                    <p className="text-xs text-slate-500">{v.constituency}</p>
                    <div className="mt-1 flex gap-1.5">
                      <span className={v.isVerified ? "badge-green" : "badge-amber"}>
                        {v.isVerified ? "Verified" : "Pending"}
                      </span>
                      <span className={v.hasVoted ? "badge-green" : "badge-slate"}>
                        {v.hasVoted && <VoteIcon className="h-3 w-3" />}
                        {v.hasVoted ? "Voted" : "Not voted"}
                      </span>
                    </div>
                  </div>
                  {!v.isVerified && (
                    <button onClick={() => handleVerify(v._id)} className="btn-secondary">
                      <UserCheck className="h-4 w-4" />
                      Verify
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
