import { useState, type FormEvent } from "react";

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
}

export default function Login({ onLogin, onSwitchToRegister }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#131417",
        color: "#eee",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 320,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 24,
          background: "#202124",
          border: "1px solid #444",
          borderRadius: 8,
        }}
      >
        <h2 style={{ margin: "0 0 8px", color: "#eee" }}>Log in</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 8, borderRadius: 4, border: "1px solid #444", background: "#131417", color: "#eee" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 8, borderRadius: 4, border: "1px solid #444", background: "#131417", color: "#eee" }}
        />

        {error && <div style={{ color: "#f87171", fontSize: 13 }}>{error}</div>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <div style={{ fontSize: 13, textAlign: "center" }}>
          Don't have an account?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToRegister(); }}>
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
}
