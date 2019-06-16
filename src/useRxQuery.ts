import React, { useState } from 'react';
import { RxCollection, RxCollectionBase, RxDocument, RxQuery } from 'rxdb';
import { useCollection } from './useCollection';

type OverloadRxQuery<RxDocumentType, OrmMethods> = RxQuery<
  RxDocumentType,
  Array<RxDocument<RxDocumentType, OrmMethods>>
>;

type queryFN<
  Collections = { [key: string]: RxCollection },
  key extends keyof Collections = keyof Collections
> = (
  collection: Collections[key]
) => typeof collection extends RxCollectionBase<infer T, infer M>
  ? OverloadRxQuery<T, M>
  : OverloadRxQuery<any, {}>;

type Documents<
  Collections = { [key: string]: RxCollection },
  Selector extends keyof Collections = keyof Collections
> = Collections[Selector] extends RxCollectionBase<infer T, infer M>
  ? Array<RxDocument<T, M>>
  : Array<RxDocument<any>>;

export interface RxQueryHookResult<
  Collections = { [key: string]: RxCollection },
  selector extends keyof Collections = keyof Collections
> {
  documents?: Documents<Collections, selector> | null;
  loading: boolean;
  error?: Error;
}

export function useRxQuery<
  Collections = {
    [key: string]: RxCollection;
  }
>(
  collectionSelector: keyof Collections,
  query: queryFN<Collections, typeof collectionSelector>
): RxQueryHookResult<Collections, typeof collectionSelector> {
  const collection = useCollection<Collections>(collectionSelector);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [result, setResult] = useState<Documents<
    Collections,
    typeof collectionSelector
  > | null>(null);
  React.useEffect(() => {
    try {
      if (collection && !error && loading) {
        const updateFN = (
          results: Documents<Collections, typeof collectionSelector>
        ) => {
          setResult(results);
          if (loading) {
            setLoading(false);
          }
        };
        const rxQuery = query(collection);
        (rxQuery.exec() as Promise<
          Documents<Collections, typeof collectionSelector>
        >)
          .then(updateFN)
          .catch(e => setError(e));
        const sub = rxQuery.$.subscribe(updateFN as any);
        return () => sub.unsubscribe();
      }
    } catch (error) {
      setError(error);
    }
  }, [collection]);
  return { documents: result, loading: loading && !error, error };
}
