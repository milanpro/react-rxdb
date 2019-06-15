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
  const [result, setResult] = useState<Array<
    RxDocument<RxDocumentType, OrmMethods>
  > | null>(null);
  React.useEffect(() => {
    const subs: Subscription[] = [];
    // ComponentDidMount
    try {
      if (db && !error && loading) {
        let collection: RxCollection<RxDocumentType, OrmMethods> = db[
          collectionSelector
        ] as any;
        const updateFN = (
          results: Array<RxDocument<RxDocumentType, OrmMethods>>
        ) => {
          setResult(results);
          if (loading) {
            setLoading(false);
          }
        };
        if (!collection) {
          subs.push(
            db.$.subscribe(event => {
              if (event.data.op === 'RxDatabase.collection') {
                collection = db[collectionSelector] as any;
                if (collection) {
                  const rxQuery = query(collection);
                  rxQuery.exec().then(updateFN);
                  subs.push(rxQuery.$.subscribe(updateFN));
                }
              }
            })
          );
        } else {
          const rxQuery = query(collection);
          rxQuery.exec().then(updateFN);
          subs.push(rxQuery.$.subscribe(updateFN));
        }
      }
    } catch (error) {
      setError(error);
    }
    // ComponentWillUnmount
    return () => {
      if (subs.length !== 0) {
        for (const sub of subs) {
          sub.unsubscribe();
        }
      }
    };
  }, [db]);
  return { documents: result, loading: loading && !error, error };
}
