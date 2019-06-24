import { useEffect, useState } from 'react';
import { RxCollection } from 'rxdb';
import { useRxDB } from './RxDBContext';

export function useCollection<Collection extends RxCollection = RxCollection>(
  collectionSelector: string
) {
  const db = useRxDB();
  const [collection, setCollection] = useState<Collection | null>(null);
  useEffect(() => {
    if (db && !collection) {
      if (db.collections[collectionSelector]) {
        setCollection(db.collections[collectionSelector]);
      } else {
        const sub = db.$.subscribe(event => {
          if (event.data.op === 'RxDatabase.collection') {
            setCollection(db.collections[collectionSelector]);
          }
        });
        return () => sub.unsubscribe();
      }
    } else if (!db && collection) {
      setCollection(null);
    }
  }, [db]);
  return collection;
}
