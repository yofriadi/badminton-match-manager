// Form value types
export interface ScheduleSlotFormValues {
  startTime: string;
  endTime: string;
  courts: string[];
}

export interface ScheduleFormValues {
  hallId: string;
  registeredPlayers: string[];
  scheduleDate: Date;
  slots: ScheduleSlotFormValues[];
  price: number;
}

// Component prop interfaces
export interface HallSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onError?: (error: string) => void;
}

export interface PlayerSelectorProps {
  hallId?: string;
  values: string[];
  onValuesChange: (values: string[]) => void;
  disabled?: boolean;
  onError?: (error: string) => void;
}

export interface CourtSelectorProps {
  hallId: string;
  values: string[];
  onValuesChange: (values: string[]) => void;
  disabled?: boolean;
  onError?: (error: string) => void;
}

// Data types
export interface HallOption {
  label: string;
  value: string;
}

export interface PlayerOption {
  label: string;
  value: string;
  name: string;
}

export interface CourtOption {
  label: string;
  value: string;
  number: number;
}

// Schedule creation request types
export interface CreateScheduleRequest {
  hallId: string;
  scheduleDate: string;
  price: number;
  registeredPlayers: string[];
  slots: Array<{
    startAt: string;
    endAt: string;
    courts: string[];
  }>;
}

export interface ScheduleSlot {
  startAt: string;
  endAt: string;
  courts: string[];
}

// Hook return types
export interface UseScheduleDataResult {
  halls: HallOption[];
  players: PlayerOption[];
  courts: CourtOption[];
  isLoadingHalls: boolean;
  isLoadingPlayers: boolean;
  isLoadingCourts: boolean;
  hallsError: string | null;
  playersError: string | null;
  courtsError: string | null;
  refetchHalls: () => void;
  refetchPlayers: () => void;
  refetchCourts: () => void;
}

export interface UseScheduleFormResult {
  form: any; // React Hook Form instance
  fields: any[]; // Field array fields
  append: (slot: ScheduleSlotFormValues) => void;
  remove: (index: number) => void;
  handleSubmit: (values: ScheduleFormValues) => void;
  handleConfirmCreate: () => void;
  showConfirmDialog: boolean;
  setShowConfirmDialog: (show: boolean) => void;
  pendingFormData: ScheduleFormValues | null;
  isCreating: boolean;
  hallId: string;
  minSelectableDate: Date;
}

// Confirmation dialog props
export interface ScheduleConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: ScheduleFormValues | null;
  isSubmitting: boolean;
}

// Slot manager props
export interface SlotManagerProps {
  fieldArray: any; // UseFieldArrayReturn
  control: any; // Control
  hallId: string;
  courts: CourtOption[];
  isCourtsLoading: boolean;
}

// Form field props
export interface FormFieldProps {
  control: any; // Control
  name: string;
  label: string;
  description?: string;
}

export interface ScheduleDateFieldProps extends FormFieldProps {
  minDate: Date;
}

export interface PriceFieldProps extends FormFieldProps {
  formatCurrency: (value: number | string) => string;
}

export interface HallFormFieldProps {
  control: any;
  onError?: (error: string) => void;
}

export interface PlayersFormFieldProps {
  control: any;
  hallId: string;
  onError?: (error: string) => void;
}

// Form container props
export interface ScheduleFormContainerProps {
  onSuccess?: (scheduleId: string) => void;
  onCancel?: () => void;
}