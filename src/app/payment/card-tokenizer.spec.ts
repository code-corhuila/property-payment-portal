import { GatewayUnavailable, UNAVAILABLE_GATEWAY } from './card-tokenizer';
import { GATEWAY } from './gateway';

const card = (number: string) => ({ number, expiry: '12/29', cvc: '123' });

describe('the gateway of the release', () => {
  it('has no test card: any card is "payment not available" until the real library is integrated', async () => {
    await expect(GATEWAY.tokenizer.tokenize(card('4242424242424242'))).rejects.toBeInstanceOf(GatewayUnavailable);
    expect(GATEWAY.testCards).toEqual([]);
    expect(GATEWAY).toBe(UNAVAILABLE_GATEWAY);
  });
});
