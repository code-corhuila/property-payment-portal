import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CARD_TOKENIZER, GatewayUnavailable } from '../card-tokenizer';
import { GATEWAY } from '../gateway';

type Stay = { propiedadId: string; fechaInicio: string; fechaFin: string; huespedes: string };
const STAY_FIELDS = ['propiedadId', 'fechaInicio', 'fechaFin', 'huespedes'] as const;

/**
 * Payment method (/reservas/checkout/pago, HU-PAY-001): credit or debit card, then the checkout
 * summary of the booking portal. The stay arrives and leaves in the query string; the token in
 * the navigation state, never in the URL. The card fields are never stored nor sent to the platform.
 */
@Component({
  selector: 'app-payment-method-page',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" aria-labelledby="pay-title" novalidate>
      <h1 id="pay-title">Método de pago</h1>
      <fieldset>
        <legend>Tipo de tarjeta</legend>
        <label><input type="radio" value="TARJETA_CREDITO" formControlName="metodoPago" /> Tarjeta de crédito</label>
        <label><input type="radio" value="TARJETA_DEBITO" formControlName="metodoPago" /> Tarjeta de débito</label>
      </fieldset>
      <label for="number">Número de la tarjeta</label>
      <input id="number" inputmode="numeric" autocomplete="cc-number" formControlName="number" />
      @if (shown('number')) { <span class="field-error">Escribe los 13 a 19 dígitos de la tarjeta</span> }
      <label for="expiry">Vencimiento (MM/AA)</label>
      <input id="expiry" autocomplete="cc-exp" formControlName="expiry" />
      @if (shown('expiry')) { <span class="field-error">Escribe el mes y el año, por ejemplo 12/29</span> }
      <label for="cvc">Código de seguridad</label>
      <input id="cvc" inputmode="numeric" autocomplete="cc-csc" formControlName="cvc" />
      @if (shown('cvc')) { <span class="field-error">Escribe los 3 o 4 dígitos del reverso</span> }
      @if (error(); as message) { <p role="alert">{{ message }}</p> }
      <button type="submit" [disabled]="sending()">Continuar</button>
      @if (testCards.length) {
        <details>
          <summary>Tarjetas de prueba (desarrollo)</summary>
          <ul>@for (card of testCards; track card.number) { <li>{{ card.number }} · {{ card.label }}</li> }</ul>
        </details>
      }
    </form>
  `,
  styles: `
    form { display: grid; gap: var(--space-2); max-width: calc(8 * var(--space-16)); margin: 0 auto; padding: var(--space-8);
      background: var(--color-bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); }
    h1 { font-family: var(--font-family-serif); font-size: var(--font-size-xl); margin: 0 0 var(--space-4); }
    fieldset { display: grid; gap: var(--space-1); border: none; padding: 0; }
    input:not([type=radio]) { font: inherit; padding: var(--space-2); border-radius: var(--radius-md); }
    .field-error, [role='alert'] { color: var(--color-error); font-size: var(--font-size-sm); }
    button { margin-top: var(--space-4); padding: var(--space-3); border: none; cursor: pointer; border-radius: var(--radius-md);
      font: inherit; background: var(--color-primary-900); color: var(--color-text-on-dark); }
    details { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
  `,
})
export class PaymentMethodPageComponent {
  private readonly router = inject(Router);
  private readonly tokenizer = inject(CARD_TOKENIZER);
  private readonly stay: Stay | null;
  readonly testCards = GATEWAY.testCards;   // empty in the build of qa and main
  readonly sending = signal(false);
  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = inject(NonNullableFormBuilder).group({
    metodoPago: ['TARJETA_CREDITO'],
    number: ['', [Validators.required, Validators.pattern(/^(\d\s?){13,19}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  constructor() {
    const query = inject(ActivatedRoute).snapshot.queryParamMap;
    const values = STAY_FIELDS.map((f) => query.get(f));
    this.stay = values.every((v) => !!v) ? Object.fromEntries(STAY_FIELDS.map((f, i) => [f, values[i]])) as Stay : null;
    // Without the stay of the booking form there is nothing to pay.
    if (!this.stay) void this.router.navigate(['/explorar']);
  }

  shown(field: 'number' | 'expiry' | 'cvc'): boolean {
    return this.submitted() && this.form.controls[field].invalid;
  }

  async submit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid || this.sending() || !this.stay) return;
    const { metodoPago, number, expiry, cvc } = this.form.getRawValue();
    this.sending.set(true);
    this.error.set(null);
    try {
      const tokenPago = await this.tokenizer.tokenize({ number, expiry, cvc });
      this.form.reset();   // the card is not kept, not even in memory
      await this.router.navigate(['/reservas/checkout/confirmar'],
        { queryParams: { ...this.stay, metodoPago }, state: { tokenPago } });
    } catch (err) {
      this.sending.set(false);
      this.error.set(err instanceof GatewayUnavailable
        ? 'El pago con tarjeta aún no está disponible. Intenta más tarde.'
        : 'No pudimos validar la tarjeta. Revisa los datos e intenta de nuevo.');
    }
  }
}
