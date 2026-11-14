import type { Gateway } from './card-tokenizer';

/**
 * DEVELOPMENT ONLY (norm 5.5.2): built only with --configuration develop (the image of develop)
 * or development (ng serve). The public test cards of the gateway, answered with the test tokens
 * the fake Stripe of property-infra-postgres knows. No key and no real library.
 */
const TEST_CARDS: Record<string, { token: string; label: string }> = {
  '4242424242424242': { token: 'tok_visa', label: 'Aprobada' },
  '4000000000000002': { token: 'tok_chargeDeclined', label: 'Rechazada' },
  '4000000000009995': { token: 'tok_chargeDeclinedInsufficientFunds', label: 'Fondos insuficientes' },
  '4000000000000069': { token: 'tok_chargeDeclinedExpiredCard', label: 'Vencida' },
};

export const GATEWAY: Gateway = {
  tokenizer: {
    tokenize: (card) => {
      const test = TEST_CARDS[card.number.replace(/\s/g, '')];
      return test ? Promise.resolve(test.token) : Promise.reject(new Error('not a test card'));
    },
  },
  testCards: Object.entries(TEST_CARDS).map(([n, c]) => ({ number: n.replace(/(\d{4})(?=\d)/g, '$1 '), label: c.label })),
};
