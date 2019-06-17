import { RxCollection } from 'rxdb';
import { useCollection } from './useCollection';

type insertFnc<Collection> = (
  json: Collection extends RxCollection<infer T, infer _M> ? T : any
) => Promise<Collection extends RxCollection<infer T, infer _M> ? T : any>;

export function useInsert<Collection extends RxCollection = RxCollection>(
  collectionSelector: string,
  upsert?: boolean
): null | insertFnc<Collection> {
  const collection = useCollection<Collection>(collectionSelector);
  return collection
    ? json => (upsert ? collection.upsert(json) : collection.insert(json))
    : null;
}
