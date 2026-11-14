import { GatewayUnavailable, UNAVAILABLE_GATEWAY as PRODUCTION } from './card-tokenizer';
import { GATEWAY as DEVELOP } from './gateway.develop';

const card = (number: string) => ({ number, expiry: '12/29', cvc: '123' });

describe('the gateways of each build', () => {
  it('develop answers the test tokens of the fake Stripe and nothing else', async () => {
    await expect(DEVELOP.tokenizer.tokenize(card('4242 4242 4242 4242'))).resolves.toBe('tok_visa');
    await expect(DEVELOP.tokenizer.tokenize(card('4000000000000002'))).resolves.toBe('tok_chargeDeclined');
    await expect(DEVELOP.tokenizer.tokenize(card('5555555555554444'))).rejects.toThrow();
    expect(DEVELOP.testCards).toHaveLength(4);
  });

  it('qa and main have no test card: any card is "payment not available"', async () => {
    await expect(PRODUCTION.tokenizer.tokenize(card('4242424242424242'))).rejects.toBeInstanceOf(GatewayUnavailable);
    expect(PRODUCTION.testCards).toEqual([]);
  });
});
