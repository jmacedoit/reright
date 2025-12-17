import { Fragment, HTMLAttributes } from "react";
import { styled } from "@linaria/react";
import { platform } from "@tauri-apps/plugin-os";
import { palette } from "../styles/colors";

/*
 * Styles.
 */

const ShortcutWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem; /* space between keys / pluses */
  font-size: 0.85em;
  vertical-align: middle;
`;

const KeyCap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  line-height: 1.2;
  font-weight: 400;
  color: ${palette.mediumGrey};
  white-space: nowrap;
  background: white;
  box-shadow: 1px 1px 0 1px ${palette.mediumGrey};
`;

/*
 * Helper functions.
 */

function getKeyMap(os: string) {
  return {
    Command: "⌘",
    CommandOrControl: os === "macos" ? "⌘" : "Ctrl",
    Control: "Ctrl",
    Ctrl: "Ctrl",
    Shift: "⇧",
    Alt: "Alt",
    Option: "⌥",
    Meta:
      os === "macos"
        ? "⌘"
        : os === "windows"
          ? "⊞"
          : os === "linux"
            ? "Super"
            : "Meta",
    Super: "Super"
  };
}

function formatShortcutToArray(
  accelerator: string,
  keyMap: ReturnType<typeof getKeyMap>
) {
  return accelerator.split("+").map((part: string) => {
    if (keyMap[part as keyof typeof keyMap])
      return keyMap[part as keyof typeof keyMap];
    if (part.startsWith("Key")) return part.replace("Key", "");
    if (part.startsWith("Digit")) return part.replace("Digit", "");
    return part;
  });
}

/*
 * Component.
 */

export function KeyBindingDisplay({
  keys,
  ...rest
}: { keys: string } & HTMLAttributes<HTMLSpanElement>) {
  const keyMap = getKeyMap(platform());
  const parts = formatShortcutToArray(keys, keyMap);

  return (
    <ShortcutWrapper {...rest}>
      {parts.map((part, index) => (
        <Fragment key={`${part}-${index}`}>
          {index > 0 && (
            <span aria-hidden="true" style={{ margin: "0 0.1rem" }}>
              +
            </span>
          )}
          <KeyCap>{part}</KeyCap>
        </Fragment>
      ))}
    </ShortcutWrapper>
  );
}
