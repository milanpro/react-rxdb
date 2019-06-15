import { RxCollection, RxDatabase } from "rxdb";
import React, { ReactNode, ReactElement, useContext, useState } from "react";

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
  children
}: RxDBProviderWithPromiseProps<Collections>): ReactElement<
  RxDBProviderProps<Collections>
> {
  const [db, setDb] = useState<RxDatabase<Collections> | null>(null);
  // TODO: UseEffect for handling of rxdb value changes
  dbPromise.then(resolvedDb => setDb(resolvedDb));
  return <RxDBContext.Provider value={db}>{children}</RxDBContext.Provider>;
}

export function useRxDB<Collections = { [key: string]: RxCollection }>(
  overrideDb?: RxDatabase<Collections>
): RxDatabase<Collections> {
  const db: RxDatabase<Collections> = useContext(RxDBContext);

  if (overrideDb) {
    return overrideDb;
  }

  if (!db) {
    throw new Error(
      'Could not find "db" in the context or passed in as a prop. ' +
        "Wrap the root component in an <RxDBProvider>, or pass an " +
        "RxDatabase instance in via props."
    );
  }
  return db;
}
