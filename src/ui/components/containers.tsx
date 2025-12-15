import { styled } from "@linaria/react";
import { units } from "../styles/dimensions";

export const PageContainer = styled.div`
  width: 100%;
  padding: ${units(6)}px;
  height: 100%;
  overflow-y: auto;
`;
