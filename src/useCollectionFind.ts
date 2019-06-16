import { useEffect, useState } from 'react';
import { RxCollection, RxQuery } from 'rxdb';
import { useCollection } from './useCollection';

type queryFN<Collection extends RxCollection> = (
  query: ReturnType<Collection['find']>
) => typeof query;

type execResult<query extends (...args: any) => any> = ReturnType<
  query
> extends RxQuery<infer _R, infer T>
  ? T
  : never;

export function useCollectionFind<
  Collection extends RxCollection = RxCollection
>(collectionSelector: string, queryFnc: queryFN<Collection> = query => query) {
  const collection = useCollection<Collection>(collectionSelector);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [result, setResult] = useState<execResult<typeof queryFnc> | null>(
    null
  );
  useEffect(() => {
    try {
      if (collection && !error && loading) {
        const updateFN = (results: any) => {
          setResult(results);
          if (loading) {
            setLoading(false);
          }
        };
        const rxQuery = queryFnc(collection.find() as any);
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
