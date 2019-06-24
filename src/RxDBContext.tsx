import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { RxCollection, RxDatabase } from 'rxdb';

type setDbPromiseFNC<T> = (dbPromise: Promise<RxDatabase<T>> | null) => void;

type IRxDBContext<T = { [key: string]: RxCollection }> = {
  db: RxDatabase<T> | null;
  setDbPromise: setDbPromiseFNC<T>;
};

const RxDBContext = React.createContext<IRxDBContext<any>>({
  db: null,
  setDbPromise: () => undefined,
});

export interface RxDBProviderProps<Collections> {
  readonly children?: ReactNode;
  readonly db: RxDatabase<Collections> | null;
}

export function RxDBProvider<
  Collections = {
    [key: string]: RxCollection;
  }
>({
  children,
  dbPromise,
}: {
  children?: ReactNode;
  dbPromise?: Promise<RxDatabase<Collections>>;
}): ReactElement<RxDBProviderProps<Collections>> {
  const [db, setDb] = useState<RxDatabase<Collections> | null>(null);

  useEffect(() => {
    if (dbPromise) {
      dbPromise.then(resDb => setDb(resDb));
    }
  }, [dbPromise]);

  const setDbPromise: setDbPromiseFNC<Collections> = (
    newDbPromise: Promise<RxDatabase<Collections>> | null
  ) => {
    if (newDbPromise) {
      newDbPromise.then(resolvedDb => {
        setDb(resolvedDb);
      });
    } else {
      setDb(null);
    }
  };
  return (
    <RxDBContext.Provider value={{ db, setDbPromise }}>
      {children}
    </RxDBContext.Provider>
  );
}

export function useRxDB<
  Collections = {
    [key: string]: RxCollection;
  }
>(overrideDb?: RxDatabase<Collections>): null | RxDatabase<Collections> {
  const { db } = useContext<IRxDBContext<Collections>>(RxDBContext);

  if (overrideDb) {
    return overrideDb;
  }

  return db;
}

export function useSetRxDB<
  Collections = {
    [key: string]: RxCollection;
  }
>(): setDbPromiseFNC<Collections> {
  const { setDbPromise } = useContext<IRxDBContext<Collections>>(RxDBContext);
  return setDbPromise;
}
