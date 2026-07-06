import { useState } from "react";
import Studio from "./pages/Studio";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user, loading, login, register, logout } = useAuth();
  const [screen, setScreen] = useState<"login" | "register">("login");

  if (loading) {
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
        Loading...
      </div>
    );
  }

  if (!user) {
    return screen === "login" ? (
      <Login onLogin={login} onSwitchToRegister={() => setScreen("register")} />
    ) : (
      <Register onRegister={register} onSwitchToLogin={() => setScreen("login")} />
    );
  }

  return <Studio user={user} onLogout={logout} />;
}

export default App;
