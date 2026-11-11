import { PAYMENT_ROUTES } from './payment.routes';

describe('payment routes', () => {
  it('exposes one screen on the mount point of the container', () => {
    expect(PAYMENT_ROUTES).toHaveLength(1);
    expect(PAYMENT_ROUTES[0].path).toBe('');
    expect(PAYMENT_ROUTES[0].component).toBeDefined();
  });
});
