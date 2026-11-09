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

export function Login({ onLogin }: { onLogin: () => void }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(onLogin, 650);
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
        <form className="login-form" onSubmit={submit}>
          <span className="eyebrow">WELCOME TO PUP</span>
          <h2>Welcome back</h2>
          <p className="subtitle">Your academic journey starts here.</p>
          <label>
            Student number or email
            <div className="input-wrap">
              <User size={18} />
              <input
                required
                defaultValue="2022-00123-MN-0"
                placeholder="Enter your student number"
              />
            </div>
          </label>
          <label>
            Password
            <div className="input-wrap">
              <ShieldCheck size={18} />
              <input
                required
                defaultValue="student123"
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="icon-btn bare"
                onClick={() => setPasswordVisible(!passwordVisible)}
                aria-label="Show password"
              >
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <div className="login-options">
            <label className="check-label">
              <input type="checkbox" defaultChecked /> <span>Remember me</span>
            </label>
            <button type="button" className="text-btn">
              Forgot password?
            </button>
          </div>
          <button className="btn primary login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> Signing in...
              </>
            ) : (
              <>
                Sign in <ArrowRight size={18} />
              </>
            )}
          </button>
          <div className="secure-note">
            <ShieldCheck size={15} /> Secured university access
          </div>
          <p className="support-copy">
            Having trouble signing in?{" "}
            <button type="button" className="text-btn">
              Contact support
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
