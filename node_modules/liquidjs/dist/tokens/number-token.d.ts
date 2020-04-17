import { Token } from './token';
import { WordToken } from './word-token';
export declare class NumberToken extends Token {
    whole: WordToken;
    decimal?: WordToken | undefined;
    constructor(whole: WordToken, decimal?: WordToken | undefined);
}
