import { createContext, Dispatch, SetStateAction } from "react";
import { Settings } from "../../services/settings";

export const SettingsContext = createContext<{
  settings: Settings | null;
  updateSettings: Dispatch<SetStateAction<Settings | null>>;
}>({ settings: null, updateSettings: () => {} });
