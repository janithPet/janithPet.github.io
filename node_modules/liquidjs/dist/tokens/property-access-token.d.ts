import { Token } from './token';
import { WordToken } from './word-token';
import { QuotedToken } from './quoted-token';
export declare class PropertyAccessToken extends Token {
    variable: WordToken;
    props: (WordToken | QuotedToken | PropertyAccessToken)[];
    constructor(variable: WordToken, props: (WordToken | QuotedToken | PropertyAccessToken)[], end: number);
}
