import { useState } from "react";
import AppRouter from "./app/AppRouter";
import type { UserRole } from "./types/auth";

type LoggedInUser = {
  username: string;
  role: UserRole;
};

function App() {
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);

  return (
    <AppRouter
      loggedInUser={loggedInUser}
      onLogin={(user) => setLoggedInUser(user)}
      onLogout={() => setLoggedInUser(null)}
    />
  );
}

export default App;
