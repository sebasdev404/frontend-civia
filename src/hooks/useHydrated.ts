'use client';
import {useSyncExternalStore} from 'react';
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
/** Match SSR on the first render, then enable browser-only theme/map features. */
export function useHydrated() { return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot); }
