import { styled } from "@linaria/react";
import { ReactNode, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { palette } from "../styles/colors";
import { units } from "../styles/dimensions";

/*
 * Styles.
 */

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  pointer-events: ${({ isOpen }) => (isOpen ? "auto" : "none")};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
`;

/*
 * Types.
 */

type ModalContainerProps = {
  children?: ReactNode;
  backdropColor?: string;
  isOpen: boolean;
  onAfterOpen?: () => void;
  onRequestClose?: () => void;
  id?: string;
};

/*
 * Components.
 */

export function ModalContainer({
  children,
  isOpen,
  onAfterOpen,
  onRequestClose,
  id = "modal-root"
}: ModalContainerProps) {
  const modalRoot = useMemo(() => {
    const element = document.getElementById(id);

    if (!element) {
      const newElement = document.createElement("div");
      newElement.style.position = "fixed";
      newElement.style.inset = "0";
      newElement.style.zIndex = "1000";
      newElement.style.pointerEvents = "none";
      newElement.id = id;
      document.body.appendChild(newElement);

      return newElement;
    }

    return element;
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    onAfterOpen?.();
  }, [isOpen, onAfterOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onRequestClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onRequestClose]);

  return createPortal(
    <ModalOverlay onClick={onRequestClose} isOpen={isOpen}>
      {children}
    </ModalOverlay>,
    modalRoot!
  );
}

export const ModalContent = styled.div`
  background-color: white;
  padding: ${units(4)}px;
  min-width: ${units(50)}px;
  max-width: calc(100% - ${units(30)}px);
  border: 1px solid ${palette.veryLightGrey};
  box-shadow: 0 ${units(0.5)}px ${units(2)}px rgba(0, 0, 0, 0.02);
  border-radius: ${units(0.5)}px;
  max-height: 100%;
  overflow-y: auto;
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: center;
  gap: ${units(1)}px;
  margin-top: ${units(2)}px;
`;

export const ModalBody = styled.div`
  margin-bottom: ${units(3)}px;
`;
