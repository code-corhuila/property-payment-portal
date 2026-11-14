import { Routes } from '@angular/router';
import { PaymentMethodPageComponent } from './pages/payment-method-page.component';

/** Exposed to the container as './routes' (navigation-map.md, "Portals"). Mounted on /reservas/checkout/pago. */
export const PAYMENT_ROUTES: Routes = [{ path: '', title: 'Método de pago', component: PaymentMethodPageComponent }];
