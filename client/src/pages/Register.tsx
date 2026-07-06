import { useState, type FormEvent } from "react";

interface Props {
  onRegister: (email: string, password: string) => Promise<void>;
  onSwitchToLogin: () => void;
}

export default function Register({ onRegister, onSwitchToLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await onRegister(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed.");
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
        <h2 style={{ margin: "0 0 8px", color: "#eee" }}>Create an account</h2>

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
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 8, borderRadius: 4, border: "1px solid #444", background: "#131417", color: "#eee" }}
        />

        {error && <div style={{ color: "#f87171", fontSize: 13 }}>{error}</div>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Sign up"}
        </button>

        <div style={{ fontSize: 13, textAlign: "center" }}>
          Already have an account?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>
            Log in
          </a>
        </div>
      </form>
    </div>
  );
}
