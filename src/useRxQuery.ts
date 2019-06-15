import React, { useState } from 'react';
import { RxCollection, RxDocument, RxQuery } from 'rxdb';
import { Subscription } from 'rxjs';
import { useRxDB } from './RxDBContext';

export interface RxQueryHookOptions<
  Collections = { [key: string]: RxCollection },
  RxDocumentType = any,
  OrmMethods = {}
> {
  collectionSelector: keyof Collections;
  query: (
    collection: RxCollection
  ) => RxQuery<RxDocumentType, Array<RxDocument<RxDocumentType, OrmMethods>>>;
}

export interface RxQueryHookResult<RxDocumentType = any, OrmMethods = {}> {
  documents?: Array<RxDocument<RxDocumentType, OrmMethods>> | null;
  loading: boolean;
  error?: Error;
}

export function useRxQuery<
  Collections = {
    [key: string]: RxCollection;
  },
  RxDocumentType = any,
  OrmMethods = {}
>({
  collectionSelector,
  query,
}: RxQueryHookOptions<
  Collections,
  RxDocumentType,
  OrmMethods
>): RxQueryHookResult<RxDocumentType, OrmMethods> {
  const db = useRxDB<Collections>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [sub, setSub] = useState<Subscription | undefined>();
  const [result, setResult] = useState<Array<
    RxDocument<RxDocumentType, OrmMethods>
  > | null>(null);
  React.useEffect(() => {
    // ComponentDidMount
    try {
      if (db && !error && loading) {
        const collection: RxCollection<RxDocumentType, OrmMethods> = db[
          collectionSelector
        ] as any;
        const rxQuery = query(collection);
        const updateFN = (
          results: Array<RxDocument<RxDocumentType, OrmMethods>>
        ) => {
          setResult(results);
          if (loading) {
            setLoading(false);
          }
        };
        rxQuery.exec().then(updateFN);
        setSub(rxQuery.$.subscribe(updateFN));
      }
    } catch (error) {
      setError(error);
    }
    // ComponentWillUnmount
    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [db]);
  return { documents: result, loading: loading && !error, error };
}
