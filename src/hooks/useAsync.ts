import { useState, useCallback } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

interface UseAsyncReturn<T, Args extends any[]> extends UseAsyncState<T> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

export function useAsync<T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>
): UseAsyncReturn<T, Args> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({ data: null, error: null, loading: true });

      try {
        const result = await asyncFunction(...args);
        setState({ data: result, error: null, loading: false });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('An unknown error occurred');
        setState({ data: null, error: err, loading: false });
        return null;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
