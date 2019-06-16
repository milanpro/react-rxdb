import { useEffect, useState } from 'react';
import { RxCollection, RxCollectionBase, RxDocument, RxQuery } from 'rxdb';
import { useCollection } from './useCollection';

type findResult<R, M> = Array<RxDocument<R, M>>;

type OverloadRxQuery<RxDocumentType, OrmMethods> = RxQuery<
  RxDocumentType,
  findResult<RxDocumentType, OrmMethods>
>;

type queryFN<
  Collections = { [key: string]: RxCollection },
  key extends keyof Collections = keyof Collections
> = (
  collection: Collections[key]
) => typeof collection extends RxCollectionBase<infer T, infer M>
  ? OverloadRxQuery<T, M>
  : OverloadRxQuery<any, {}>;

type execResult<query extends (...args: any) => any> = ReturnType<
  query
> extends RxQuery<infer _R, infer T>
  ? T
  : never;

export function useRxQuery<
  Collections = {
    [key: string]: RxCollection;
  }
>(
  collectionSelector: keyof Collections,
  query: queryFN<Collections, typeof collectionSelector>
) {
  const collection = useCollection<Collections>(collectionSelector);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [result, setResult] = useState<execResult<typeof query> | null>(null);
  useEffect(() => {
    try {
      if (collection && !error && loading) {
        const updateFN = (results: any) => {
          setResult(results);
          if (loading) {
            setLoading(false);
          }
        };
        const rxQuery = query(collection);
        rxQuery
          .exec()
          .then(updateFN)
          .catch(e => setError(e));
        const sub = rxQuery.$.subscribe(updateFN);
        return () => sub.unsubscribe();
      }
    } catch (error) {
      setError(error);
    }
  }, [collection]);
  return { documents: result, loading: loading && !error, error };
}
