import { createContext } from "react";

export const AuthContext = createContext({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isPasswordRecovery: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  updateTeacherPasskey: async () => {},
  refreshProfile: async () => {},
  setIsPasswordRecovery: () => {},
});
