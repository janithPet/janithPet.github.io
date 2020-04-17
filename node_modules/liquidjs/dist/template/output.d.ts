import { FilterMap } from './filter/filter-map';
import { TemplateImpl } from '../template/template-impl';
import { Template } from '../template/template';
import { Context } from '../context/context';
import { Emitter } from '../render/emitter';
import { OutputToken } from '../tokens/output-token';
export declare class Output extends TemplateImpl<OutputToken> implements Template {
    private value;
    constructor(token: OutputToken, filters: FilterMap);
    render(ctx: Context, emitter: Emitter): IterableIterator<IterableIterator<any>>;
}
