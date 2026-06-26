import { useCallback } from 'react';
import { toast } from 'sonner';

export function useAppToast() {
  const success = useCallback((message) => {
    toast.success(message, { duration: 4000 });
  }, []);

  const error = useCallback((message) => {
    toast.error(message || 'Something went wrong', { duration: 4000 });
  }, []);

  const warning = useCallback((message) => {
    toast.warning(message, { duration: 4000 });
  }, []);

  const info = useCallback((message) => {
    toast.info(message, { duration: 4000 });
  }, []);

  return { success, error, warning, info };
}
