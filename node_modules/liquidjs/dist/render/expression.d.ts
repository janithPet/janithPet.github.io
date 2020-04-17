import { QuotedToken } from '../tokens/quoted-token';
import { Token } from '../tokens/token';
import { Context } from '../context/context';
export declare class Expression {
    private operands;
    private postfix;
    constructor(str: string);
    evaluate(ctx: Context): any;
    value(ctx: Context): IterableIterator<any>;
}
export declare function evalToken(token: Token | undefined, ctx: Context): any;
export declare function evalQuotedToken(token: QuotedToken): string;
