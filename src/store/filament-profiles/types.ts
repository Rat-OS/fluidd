import type { Macro } from '@/store/macros/types'

export interface FilamentProfilesState {
  filamentProfiles: FilamentProfile[];
  filamentSelectDialogState?: FilamentSelectDialogState;
}

export interface FilamentSelectDialogState {
  show: boolean;
  macro?: Macro;
}

export interface FilamentProfile {
  id: number;
  order: number;
  type: string;
  name: string;
  temp: number;
  visible: boolean;
}
