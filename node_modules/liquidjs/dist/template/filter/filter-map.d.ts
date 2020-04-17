import { FilterImplOptions } from './filter-impl-options';
import { Filter } from './filter';
import { FilterArg } from '../../parser/filter-arg';
export declare class FilterMap {
    private readonly strictFilters;
    private impls;
    constructor(strictFilters: boolean);
    get(name: string): FilterImplOptions;
    set(name: string, impl: FilterImplOptions): void;
    create(name: string, args: FilterArg[]): Filter;
}
