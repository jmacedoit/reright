import { styled } from "@linaria/react";
import { useCallback, useEffect, useState } from "react";
import { Settings, settingsService } from "../services/settings";
import { llmService } from "../services/llm";
import { windowUiHelper } from "../window-ui-helper";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  matchPath,
  Navigate,
} from "react-router";
import { Settings as SettingsScreen } from "./screens/settings";
import { colorTheme, palette } from "./styles/colors";
import { units } from "./styles/dimensions";
import { Rewrites } from "./screens/rewrites";
import color from "color";
import { HowTo } from "./screens/howto";
import { SettingsContext } from "./contexts/settings";
import { debounce, isEqual, trim } from "lodash";
import { useTranslation } from "react-i18next";
import { translationKeys } from "./translations";

/*
 * Styles.
 */

const Container = styled.div`
  :global() {
    html {
      box-sizing: border-box;
      font-family: system-ui;
      font-size: ${units(1.5)}px;
      color: ${palette.darkGrey};
    }

    #root {
      height: 100%;
    }

    html,
    body {
      height: 100%;
    }

    *:before,
    *:after {
      box-sizing: inherit;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    small {
      margin: 0 0 1em 0;
      font-weight: 500;
    }

    h2 {
      font-size: 1.5rem;
    }

    h3 {
      font-size: 1.25rem;
    }

    small {
      font-size: 0.875rem;
      display: block;
    }
  }

  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
`;

const WindowDragger = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: ${units(3)}px;
  z-index: 10;
`;

const Menu = styled.nav`
  min-width: ${units(25)}px;
  background: ${palette.ultraLightGray};
  border-right: 1px solid ${palette.veryLightGrey};
  gap: ${units(1)}px;
  display: flex;
  align-items: center;
  padding: ${units(5)}px ${units(2)}px ${units(2)}px;
  flex-direction: column;
  z-index: 1;
`;

const MenuButton = styled.button<{ isActive: boolean }>`
  width: 100%;
  padding: ${units(1.5)}px;
  border: none;
  background: ${({ isActive }) => (isActive ? colorTheme.accent : "none")};
  border-radius: ${units(2)}px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.1s ease-in-out;
  color: ${({ isActive }) => (isActive ? "white" : "currentColor")};

  &:hover {
    background: ${({ isActive }) =>
      !isActive
        ? colorTheme.accent
        : color(colorTheme.accent).darken(0.2).hex()};
    color: white;
  }
`;

const MainContentContainer = styled.div`
  display: flex;
  width: 100%;
  flex: 1;
`;

const BuyCoffeeLink = styled.a`
  text-decoration: none;
  color: ${palette.darkGrey};
  font-weight: 600;
  display: inline-block;
  padding-bottom: 2px;
  background-image: linear-gradient(currentColor 0 0);
  background-position: 0 100%;
  background-size: 0% 2px;
  background-repeat: no-repeat;
  transition: background-size 0.3s, background-position 0s 0.3s, transform 0.3s;

  &:hover {
    background-position: 100% 100%;
    background-size: 100% 2px;
    transform: rotate(-5.5deg) scale(1.2);
  }

  &:visited {
    color: currentColor;
  }
`;

/*
 * Components.
 */

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadedSettings, setLoadedSettings] = useState<Settings | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    let settingsListenerReference: (() => void) | undefined;

    async function initialize() {
      await windowUiHelper.initializeWindow(t);
      const justLoadedSettings = await settingsService.loadSettings();

      llmService.setModel(justLoadedSettings.model);

      setLoadedSettings(justLoadedSettings);

      settingsListenerReference = await settingsService.addUpdateListener(
        (updatedSettings) => {
          setLoadedSettings((prevSettings) => {
            if (!isEqual(updatedSettings, prevSettings)) {
              return updatedSettings;
            }

            return prevSettings;
          });
        }
      );
    }

    initialize();

    return () => {
      async function onUnmount() {
        await windowUiHelper.destroy();

        if (settingsListenerReference) {
          settingsService.removeUpdateListener(settingsListenerReference);
        }
      }

      onUnmount();
    };
  }, []);

  useEffect(() => {
    async function updateWindowUiAndModel() {
      if (!loadedSettings) return;

      await windowUiHelper.updateTrayMenu(
        loadedSettings.rewrites,
        loadedSettings.languages,
        loadedSettings.defaultCommand,
        loadedSettings.rewriteShortcut,
        loadedSettings.commandSeparator
      );

      await windowUiHelper.updateRewriteShortcut(
        loadedSettings.rewriteShortcut,
        loadedSettings.defaultCommand,
        loadedSettings.rewrites,
        loadedSettings.commandSeparator
      );

      llmService.setModel(loadedSettings.model);
    }

    updateWindowUiAndModel();
  }, [loadedSettings]);

  const persistSettings = useCallback(
    debounce(async (settingsToPersist: Settings) => {
      if (settingsToPersist) {
        if (trim(settingsToPersist.rewriteShortcut ?? "").length === 0) {
          await windowUiHelper.removeRewriteShortcut();
        } else {
          try {
            await windowUiHelper.updateRewriteShortcut(
              settingsToPersist.rewriteShortcut,
              settingsToPersist.defaultCommand,
              settingsToPersist.rewrites,
              settingsToPersist.commandSeparator
            );
          } catch (error) {
            console.error("Error updating rewrite shortcut", error);
          }
        }

        await settingsService.saveSettings(settingsToPersist);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    if (!loadedSettings) {
      return;
    }

    persistSettings(loadedSettings);
  }, [persistSettings, loadedSettings]);

  if (!loadedSettings) {
    return (
      <Container>
        <WindowDragger data-tauri-drag-region />
      </Container>
    );
  }

  return (
    <SettingsContext.Provider
      value={{ settings: loadedSettings, updateSettings: setLoadedSettings }}
    >
      <Container>
        <WindowDragger data-tauri-drag-region />

        <Menu>
          <MenuButton
            isActive={!!matchPath("/rewrites", location.pathname)}
            onClick={() => navigate("/rewrites")}
          >
            {t(translationKeys.menu.rewrites)}
          </MenuButton>

          <MenuButton
            isActive={!!matchPath("/settings", location.pathname)}
            onClick={() => navigate("/settings")}
          >
            {t(translationKeys.menu.settings)}
          </MenuButton>

          <MenuButton
            isActive={!!matchPath("/howto", location.pathname)}
            onClick={() => navigate("/howto")}
          >
            {t(translationKeys.menu.howTo)}
          </MenuButton>

          <div style={{ flex: 1 }} />

          <BuyCoffeeLink
            href="https://buymeacoffee.com/jmacedo"
            target="_blank"
          >
            Buy me a ☕
          </BuyCoffeeLink>
        </Menu>

        <MainContentContainer>
          <Routes>
            <Route>
              <Route index element={<Navigate to="/rewrites" replace />} />

              <Route path="howto" element={<HowTo />} />

              <Route path="rewrites" element={<Rewrites />} />

              <Route path="settings" element={<SettingsScreen />} />
            </Route>
          </Routes>
        </MainContentContainer>
      </Container>
    </SettingsContext.Provider>
  );
}

export default App;
