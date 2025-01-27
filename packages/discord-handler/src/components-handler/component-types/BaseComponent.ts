import DcClientHandler from '../../DcClientHandler';
import { TComponentMeta } from './types';

export default class BaseComponent<
  TMeta extends TComponentMeta = TComponentMeta
> {
  public readonly instance: DcClientHandler;
  public readonly key: string;
  public readonly meta: TComponentBaseMeta<TMeta>;

  constructor(
    instance: DcClientHandler,
    key: string,
    meta: TComponentBaseMeta<TMeta>
  ) {
    this.instance = instance;
    this.key = key;
    this.meta = meta;
  }
}

type TComponentBaseMeta<TCommandMeta> = Omit<Omit<TCommandMeta, 'key'>, 'type'>;
