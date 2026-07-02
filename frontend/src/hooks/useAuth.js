import { useMemo } from "react";
import { useSelector } from "react-redux";

import { selectLoggedInUser } from "../store/authSlice";

export const useAuth = () => {
  const loggedInUser = useSelector(selectLoggedInUser);

  return useMemo(() => {
    const role = loggedInUser?.role ?? null;
    return {
      loggedInUser,
      isAuthenticated: !!loggedInUser,
      role,
      isAdmin: role === "admin",
      isTeacher: role === "teacher",
      isStudent: role === "student",
    };
  }, [loggedInUser]);
};
