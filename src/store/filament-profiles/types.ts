import type { Macro } from '@/store/macros/types'

export interface FilamentProfilesState {
  showFilamentDialog: boolean;
  filamentDialogMacro?: Macro;
  filamentProfiles: FilamentProfile[];
}

export interface FilamentProfile {
  id: number;
  order: number;
  type: string;
  name: string;
  temp: number;
  visible: boolean;
}
