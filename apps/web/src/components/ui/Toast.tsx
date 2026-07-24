import { toast } from 'sonner';

export function showSuccess(message: string, description?: string) {
  toast.success(message, { description });
}

export function showError(message: string, description?: string) {
  toast.error(message, { description });
}

export function showInfo(message: string, description?: string) {
  toast.info(message, { description });
}

export function showConfirmWithUndo(message: string, onUndo: () => void, duration = 5000) {
  toast(message, {
    duration,
    action: {
      label: 'Undo',
      onClick: onUndo,
    },
  });
}
