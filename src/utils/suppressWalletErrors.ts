// src/utils/suppressWalletErrors.ts

/**
 * Suppress non-critical wallet version warnings
 * These don't affect functionality but spam the console
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export function suppressWalletVersionErrors() {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args: any[]) => {
    const message = args[0]?.message || args[0]?.toString() || '';
    
    // Suppress wallet version mismatch errors
    if (
      message.includes('unsupported channel for spec version') ||
      message.includes('spec version') ||
      message.includes('channel')
    ) {
      console.warn('⚠️ Wallet version notice (safe to ignore)');
      return;
    }
    
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args[0]?.message || args[0]?.toString() || '';
    
    if (message.includes('spec version')) {
      return; // Silently ignore
    }
    
    originalWarn.apply(console, args);
  };

  // Also catch unhandled promise rejections related to wallet versions
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || '';
    
    if (message.includes('unsupported channel for spec version')) {
      event.preventDefault();
      console.log('🔇 Suppressed wallet version warning');
    }
  });
}