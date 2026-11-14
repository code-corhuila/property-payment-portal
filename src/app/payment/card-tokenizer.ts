import { InjectionToken } from '@angular/core';
import { GATEWAY } from './gateway';

/** The card fields: they stay in the browser and are given only to the gateway's library. */
export interface Card {
  number: string;
  expiry: string; // MM/AA
  cvc: string;
}

/**
 * The payment gateway's library in the browser: it receives the card and returns a token, the
 * only thing that reaches the platform (navigation-map.md, "Payment method").
 */
export interface CardTokenizer {
  tokenize(card: Card): Promise<string>;
}

/** The gateway of the build: gateway.ts in qa and main, gateway.develop.ts only in develop. */
export interface Gateway {
  tokenizer: CardTokenizer;
  testCards: { number: string; label: string }[];
}

/** Thrown when this build has no gateway library: the screen says payment is not available. */
export class GatewayUnavailable extends Error {}

/** The gateway of a build without a library: any card is "payment not available". */
export const UNAVAILABLE_GATEWAY: Gateway = {
  tokenizer: { tokenize: () => Promise.reject(new GatewayUnavailable()) },
  testCards: [],
};

export const CARD_TOKENIZER = new InjectionToken<CardTokenizer>('CARD_TOKENIZER', {
  providedIn: 'root',
  factory: () => GATEWAY.tokenizer,
});
