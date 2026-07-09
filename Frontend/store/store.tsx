'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { initAuth } from '@/store/slices/authSlice';

function AuthInit({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);
  return <>{children}</>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInit>{children}</AuthInit>
    </Provider>
  );
}