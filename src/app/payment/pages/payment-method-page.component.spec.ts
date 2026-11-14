import { Component, inject, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CARD_TOKENIZER, GatewayUnavailable } from '../card-tokenizer';
import { PAYMENT_ROUTES } from '../payment.routes';

@Component({ template: 'resumen' })
class SummaryStubComponent {
  readonly state = inject(Router).getCurrentNavigation()?.extras.state;
}

const STAY = 'propiedadId=p-1&fechaInicio=2028-03-10&fechaFin=2028-03-13&huespedes=2';

describe('PaymentMethodPageComponent', () => {
  let harness: RouterTestingHarness;
  let cards: string[];

  async function open(url: string): Promise<void> {
    cards = [];
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          { path: 'reservas/checkout/pago', children: PAYMENT_ROUTES },
          { path: 'reservas/checkout/confirmar', component: SummaryStubComponent },
          { path: '**', children: [] },
        ]),
        { provide: CARD_TOKENIZER, useValue: { tokenize: (c: { number: string }) => {
          cards.push(c.number);
          // A stand-in for the gateway's library: 4242... is approved, anything else is refused.
          if (c.number === 'unavailable') return Promise.reject(new GatewayUnavailable());
          return c.number.replace(/\s/g, '') === '4242424242424242' ? Promise.resolve('tok_visa') : Promise.reject(new Error('refused'));
        } } },
      ],
    });
    harness = await RouterTestingHarness.create(url);
  }

  const el = () => harness.routeNativeElement!;
  const type = (id: string, value: string) => {
    const input = el().querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  async function submit(): Promise<void> {
    el().querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await harness.fixture.whenStable();
    await new Promise((r) => setTimeout(r));
    await harness.fixture.whenStable();
  }

  it('turns a test card into its token and goes to the summary with the stay and the method, the token out of the URL', async () => {
    await open(`/reservas/checkout/pago?${STAY}`);
    el().querySelector<HTMLInputElement>('input[value=TARJETA_DEBITO]')!.click();
    type('number', '4242 4242 4242 4242');
    type('expiry', '12/29');
    type('cvc', '123');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
    await submit();
    expect(navigate).toHaveBeenCalledWith(['/reservas/checkout/confirmar'], {
      queryParams: { propiedadId: 'p-1', fechaInicio: '2028-03-10', fechaFin: '2028-03-13', huespedes: '2', metodoPago: 'TARJETA_DEBITO' },
      state: { tokenPago: 'tok_visa' },
    });
    expect(TestBed.inject(Router).url).not.toContain('tok_');
  });

  it('checks the fields before calling the library, and says so when the card is not a test card', async () => {
    await open(`/reservas/checkout/pago?${STAY}`);
    await submit();
    expect(cards).toEqual([]);
    expect(el().querySelectorAll('.field-error')).toHaveLength(3);
    type('number', '5555 5555 5555 4444');
    type('expiry', '12/29');
    type('cvc', '123');
    await submit();
    expect(el().querySelector('[role=alert]')?.textContent).toContain('No pudimos validar la tarjeta');
  });

  it('sends a visit without the stay of the booking form back to explore', async () => {
    await open('/reservas/checkout/pago');
    expect(TestBed.inject(Router).url).toBe('/explorar');
  });
});
