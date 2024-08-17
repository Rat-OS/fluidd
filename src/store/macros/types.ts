export interface MacrosState {
  stored: Macro[];
  categories: MacroCategory[];
  expanded: number[];
  showLoadFilamentDialog: boolean;
}

export interface Macro {
  name: string;
  alias?: string;
  visible: boolean;
  categoryId?: string;
  category?: MacroCategory;
  assignTo?: string;
  disabledWhilePrinting?: boolean;
  hideWhilePrinting?: boolean;
  hideWhilePaused?: boolean;
  hideWhileStandby?: boolean;
  color?: string;
  config?: any;
  order?: number;
  variables?: Record<string, unknown>
}

export interface MacroCategory {
  id: string;
  name: string;
  count?: number;
  visible?: number;
  order?: number;
  color?: string;
  hideWhilePrinting?: boolean;
  hideWhilePaused?: boolean;
  hideWhileStandby?: boolean;
}
