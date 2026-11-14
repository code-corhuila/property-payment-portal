import { UNAVAILABLE_GATEWAY } from './card-tokenizer';

/**
 * The gateway of qa and main (the production build). The library of the gateway's test account
 * is not integrated yet (pending): no card can be tokenized, and the screen says so. The test
 * cards of develop are NOT in this build: angular.json replaces this file with
 * gateway.develop.ts only in the configurations develop and development (norm 5.5.2).
 */
export const GATEWAY = UNAVAILABLE_GATEWAY;
