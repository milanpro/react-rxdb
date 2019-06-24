import React, { ReactElement, ReactNode, useContext, useState } from 'react';
import { RxCollection, RxDatabase } from 'rxdb';

type setDbPromiseFNC<T> = (dbPromise?: Promise<RxDatabase<T>>) => void;

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
}: {
  children?: ReactNode;
}): ReactElement<RxDBProviderProps<Collections>> {
  const [db, setDb] = useState<RxDatabase<Collections> | null>(null);
  const setDbPromise: setDbPromiseFNC<Collections> = (
    dbPromise?: Promise<RxDatabase<Collections>>
  ) => {
    if (dbPromise) {
      dbPromise.then(resolvedDb => {
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
