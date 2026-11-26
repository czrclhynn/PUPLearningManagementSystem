import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  User,
} from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { api, errorMessage, type SessionUser } from "../../app/api";

export function Login({
  onLogin,
  sessionError,
}: {
  onLogin: (user: SessionUser) => void;
  sessionError: string;
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);
  const [registration, setRegistration] = useState(false);
  const [notice, setNotice] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    try {
      if (registration) {
        const result = await api<{ message: string }>("/auth/instructor-registration", {
          method: "POST",
          body: {
            name: form.get("name"),
            email: form.get("email"),
            password: form.get("password"),
          },
        });
        setNotice(result.message);
        setRegistration(false);
        return;
      }
      const user = await api<SessionUser>("/auth/login", {
        method: "POST",
        body: {
          email: form.get("email"),
          password: form.get("password"),
          remember: form.has("remember"),
        },
      });
      onLogin(user);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-page">
      <section className="login-brand">
        <Logo />
        <div className="academic-visual" aria-hidden="true">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-card vc-one">
            <BookOpen size={25} />
            <span>Learn</span>
          </div>
          <div className="visual-card vc-two">
            <BarChart3 size={25} />
            <span>Progress</span>
          </div>
          <div className="visual-center">
            <GraduationCap size={48} />
          </div>
        </div>
        <div className="brand-message">
          <span className="eyebrow light">YOUR CAMPUS, CONNECTED</span>
          <h1>
            Learning built around
            <br />
            your academic journey.
          </h1>
          <p>
            Access courses, stay ahead of deadlines, and connect with your university community in
            one focused space.
          </p>
        </div>
        <span className="brand-footer">Polytechnic University learning environment</span>
      </section>
      <section className="login-form-side">
        <div className="mobile-logo">
          <Logo />
        </div>
        <form className="login-form" onSubmit={submit} key={String(registration)}>
          <span className="eyebrow">WELCOME TO PUP</span>
          <h2>{registration ? "Request instructor access" : "Welcome back"}</h2>
          <p className="subtitle">
            {registration
              ? "An administrator will review your request before you can sign in."
              : "Your academic journey starts here."}
          </p>
          {registration && (
            <label>
              Name
              <div className="input-wrap">
                <User size={18} />
                <input name="name" autoComplete="name" required maxLength={120} />
              </div>
            </label>
          )}
          <label>
            Email
            <div className="input-wrap">
              <User size={18} />
              <input
                required
                name="email"
                type="email"
                autoComplete="username"
                maxLength={254}
                placeholder="Enter your email"
              />
            </div>
          </label>
          <label>
            Password
            <div className="input-wrap">
              <ShieldCheck size={18} />
              <input
                required
                name="password"
                autoComplete={registration ? "new-password" : "current-password"}
                minLength={registration ? 12 : undefined}
                maxLength={128}
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="icon-btn bare"
                onClick={() => setPasswordVisible(!passwordVisible)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
              >
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {!registration && (
            <div className="login-options">
              <label className="check-label">
                <input name="remember" type="checkbox" /> <span>Remember me</span>
              </label>
              <button type="button" className="text-btn" onClick={() => setHelp(!help)}>
                Forgot password?
              </button>
            </div>
          )}
          {(error || sessionError) && <p role="alert">{error || sessionError}</p>}
          {notice && <p role="status">{notice}</p>}
          {help && (
            <p role="status">Contact your LMS administrator for help resetting your password.</p>
          )}
          <button className="btn primary login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> {registration ? "Sending request…" : "Signing in…"}
              </>
            ) : (
              <>
                {registration ? "Send registration request" : "Sign in"} <ArrowRight size={18} />
              </>
            )}
          </button>
          <div className="secure-note">
            <ShieldCheck size={15} /> Secured university access
          </div>
          <p className="support-copy">
            <button
              type="button"
              className="text-btn"
              disabled={loading}
              onClick={() => {
                setError("");
                setNotice("");
                setHelp(false);
                setPasswordVisible(false);
                setRegistration(!registration);
              }}
            >
              {registration ? "Back to sign in" : "Request instructor access"}
            </button>
          </p>
          <p className="support-copy">
            Having trouble signing in?{" "}
            <button type="button" className="text-btn" onClick={() => setHelp(!help)}>
              Contact support
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
