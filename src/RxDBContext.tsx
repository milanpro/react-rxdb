import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { RxCollection, RxDatabase } from 'rxdb';

const RxDBContext = React.createContext<null | RxDatabase<any>>(null);

export interface RxDBProviderProps<Collections> {
  readonly children?: ReactNode;
  readonly db: RxDatabase<Collections>;
}

export interface RxDBProviderWithPromiseProps<Collections> {
  readonly children?: ReactNode;
  readonly dbPromise: Promise<RxDatabase<Collections>>;
}

export function RxDBProvider<Collections = { [key: string]: RxCollection }>({
  dbPromise,
  children,
}: RxDBProviderWithPromiseProps<Collections>): ReactElement<
  RxDBProviderProps<Collections>
> {
  const [db, setDb] = useState<RxDatabase<Collections> | null>(null);
  useEffect(() => {
    dbPromise.then(resolvedDb => setDb(resolvedDb));
  }, []);
  return <RxDBContext.Provider value={db}>{children}</RxDBContext.Provider>;
}

export function useRxDB<Collections = { [key: string]: RxCollection }>(
  overrideDb?: RxDatabase<Collections>
): null | RxDatabase<Collections> {
  const db = useContext<null | RxDatabase<Collections>>(RxDBContext);

  if (overrideDb) {
    return overrideDb;
  }

  return db;
}
