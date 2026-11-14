import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { PAYMENT_ROUTES } from './payment/payment.routes';

/**
 * Standalone runs only, on the container's mount point. Deliberately NO
 * provideHttpClient(): this portal calls no API (the card goes to the gateway's library).
 */
export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideRouter([
    { path: 'reservas/checkout/pago', children: PAYMENT_ROUTES },
    { path: '**', redirectTo: 'reservas/checkout/pago' },
  ], withComponentInputBinding())],
};
