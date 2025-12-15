import { styled } from "@linaria/react";
import { palette } from "../styles/colors";
import { units } from "../styles/dimensions";
import color from "color";

export const IconButton = styled.button`
  background-color: transparent;
  display: inline-flex;
  cursor: pointer;
  border-radius: ${units(5)}px;
  border: none;
  border: 2px solid transparent;
  width: ${units(4)}px;
  height: ${units(4)}px;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${palette.veryLightGrey};
  }

  svg {
    width: ${units(2)}px;
  }
`;

export const NormalButton = styled.button<{ disabled?: boolean }>`
  background-color: ${({ disabled }) =>
    disabled
      ? color(palette.veryLightGrey).alpha(0.3).hexa()
      : palette.veryLightGrey};
  color: ${({ disabled }) =>
    disabled ? color(palette.darkGrey).alpha(0.3).hexa() : palette.darkGrey};
  padding: ${units(1)}px ${units(2)}px;
  min-width: ${units(12)}px;
  min-height: ${units(4.5)}px;
  border-radius: ${units(5)}px;
  border: none;
  cursor: pointer;
  box-sizing: border-box;
  font-weight: 600;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: ${units(0.5)}px;
  transition: background-color 0.1s ease-in-out;
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};

  &:hover:not(:disabled) {
    background-color: ${color(palette.veryLightGrey).darken(0.2).hex()};
  }
`;

export const SmallButton = styled(NormalButton)`
  font-size: 0.875rem;
`;
