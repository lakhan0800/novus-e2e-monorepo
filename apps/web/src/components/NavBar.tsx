import { Button } from "@fieldnotes/ui";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function NavBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <nav className="fn-nav">
      <strong>Fieldnotes</strong>
      <NavLink to="/" end>
        Notebooks
      </NavLink>
      <NavLink to="/settings">Settings</NavLink>
      <span className="fn-nav__spacer" />
      <span>
        {user?.name} · {user?.organization.name}
      </span>
      <Button id="sign-out-button" variant="secondary" onClick={() => void handleSignOut()}>
        Sign out
      </Button>
    </nav>
  );
}
