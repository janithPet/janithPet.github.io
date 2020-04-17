import { Context } from '../../context/context';
import { FilterImplOptions } from './filter-impl-options';
import { FilterArg } from '../../parser/filter-arg';
export declare class Filter {
    name: string;
    args: FilterArg[];
    private impl;
    constructor(name: string, impl: FilterImplOptions, args: FilterArg[]);
    render(value: any, context: Context): IterableIterator<any>;
}
