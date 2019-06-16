import { useEffect, useState } from 'react';
import { RxCollection } from 'rxdb';
import { useRxDB } from './RxDBContext';

export type CollectionsResult = RxCollection;

export function useCollection<
  Collections = {
    [key: string]: RxCollection;
  }
>(
  collectionSelector: keyof Collections
): Pick<Collections, typeof collectionSelector> | null {
  const db = useRxDB<Collections>();
  const [collection, setCollection] = useState<Pick<
    Collections,
    typeof collectionSelector
  > | null>(null);
  useEffect(() => {
    if (db && !collection) {
      if (db[collectionSelector]) {
        setCollection(db[collectionSelector] as any);
      } else {
        const sub = db.$.subscribe(event => {
          if (event.data.op === 'RxDatabase.collection') {
            setCollection(db[collectionSelector] as any);
          }
        });
        return () => sub.unsubscribe();
      }
    }
  }, [db]);
  return collection;
}
