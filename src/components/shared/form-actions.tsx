import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  disableSubmit?: boolean;
  showCancel?: boolean;
  submitVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export function FormActions({
  onCancel,
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isSubmitting = false,
  disableSubmit = false,
  showCancel = true,
  submitVariant = "default",
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      {showCancel && onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelLabel}
        </Button>
      )}
      {onSubmit && (
        <Button
          type="button"
          variant={submitVariant}
          onClick={onSubmit}
          disabled={isSubmitting || disableSubmit}
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>
      )}
    </div>
  );
}

interface FormDialogCloseProps {
  onClose?: () => void;
  closeLabel?: string;
}

export function FormDialogClose({
  onClose,
  closeLabel = "Close",
}: FormDialogCloseProps) {
  return (
    <div className="flex justify-end">
      <Button type="button" variant="ghost" size="sm" onClick={onClose}>
        <X className="h-4 w-4 mr-2" />
        {closeLabel}
      </Button>
    </div>
  );
}
