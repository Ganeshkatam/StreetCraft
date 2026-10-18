'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseRouteModalOptions {
  paramName?: string;
  fieldParam?: string;
  legacyParam?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export function useRouteModal(modalId: string, options?: UseRouteModalOptions) {
  const [isOpen, setIsOpenState] = useState(false);
  const paramName = options?.paramName || 'modal';
  const fieldParam = options?.fieldParam;
  const legacyParam = options?.legacyParam;

  const checkUrl = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const activeModal = params.get(paramName);
    const legacyActive = legacyParam ? params.get(legacyParam) === 'true' : false;

    let match = activeModal === modalId || legacyActive;
    if (match && fieldParam) {
      match = params.get('field') === fieldParam;
    }
    return match;
  }, [modalId, paramName, fieldParam, legacyParam]);

  // Synchronize on mount and whenever popstate or streetcraft:modal-change occurs
  useEffect(() => {
    const syncState = () => {
      const match = checkUrl();
      setIsOpenState(match);
      if (match) {
        options?.onOpen?.();
      }
    };

    syncState();
    window.addEventListener('popstate', syncState);
    window.addEventListener('streetcraft:modal-change', syncState);

    return () => {
      window.removeEventListener('popstate', syncState);
      window.removeEventListener('streetcraft:modal-change', syncState);
    };
  }, [checkUrl, options]);

  const open = useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set(paramName, modalId);
    if (fieldParam) {
      url.searchParams.set('field', fieldParam);
    }
    window.history.pushState({}, '', url.toString());
    setIsOpenState(true);
    options?.onOpen?.();
    window.dispatchEvent(new Event('streetcraft:modal-change'));
  }, [modalId, paramName, fieldParam, options]);

  const close = useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete(paramName);
    if (fieldParam) {
      url.searchParams.delete('field');
    }
    if (legacyParam) {
      url.searchParams.delete(legacyParam);
    }
    window.history.replaceState({}, '', url.toString());
    setIsOpenState(false);
    options?.onClose?.();
    window.dispatchEvent(new Event('streetcraft:modal-change'));
  }, [paramName, fieldParam, legacyParam, options]);

  const setIsOpen = useCallback(
    (nextState: boolean) => {
      if (nextState) {
        open();
      } else {
        close();
      }
    },
    [open, close]
  );

  return {
    isOpen,
    open,
    close,
    setIsOpen,
  };
}
