import { Token } from './token';
export declare class WordToken extends Token {
    input: string;
    begin: number;
    end: number;
    file?: string | undefined;
    content: string;
    constructor(input: string, begin: number, end: number, file?: string | undefined);
    isNumber(allowSign?: boolean): boolean;
}
