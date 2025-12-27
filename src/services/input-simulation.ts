import { invoke } from "@tauri-apps/api/core";

/*
 * Service.
 */

export class InputSimulationService {
  async simulateCopy(): Promise<void> {
    await invoke<void>("simulate_copy");
  }

  async simulatePaste(): Promise<void> {
    await invoke<void>("simulate_paste");
  }
}

export const inputSimulationService = new InputSimulationService();
