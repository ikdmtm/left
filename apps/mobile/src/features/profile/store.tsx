import { createContext, useContext, useMemo, useReducer } from "react";
import type { Profile } from "../../core/model/types";

type State = {
  profile: Profile | null;
  loaded: boolean;
};

type Action =
  | { type: "LOAD"; profile: Profile | null }
  | { type: "SET_PROFILE"; profile: Profile };

const initialState: State = { profile: null, loaded: false };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return { profile: action.profile, loaded: true };
    case "SET_PROFILE":
      return { ...state, profile: action.profile };
    default:
      return state;
  }
}

const Ctx = createContext<{
  state: State;
  setProfile: (p: Profile) => void;
  load: (p: Profile | null) => void;
} | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const api = useMemo(
    () => ({
      state,
      setProfile: (profile: Profile) => dispatch({ type: "SET_PROFILE", profile }),
      load: (profile: Profile | null) => dispatch({ type: "LOAD", profile }),
    }),
    [state]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProfileStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("ProfileProvider is missing");
  return v;
}
