import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, QueryClientConfig } from "@tanstack/react-query";
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";
import { MMKV } from "react-native-mmkv";

const cacheStorage = new MMKV({ id: "react-query-cache" });

const storage = {
  getItem: (key: string) => {
    const value = cacheStorage.getString(key);
    return value ?? null;
  },
  setItem: (key: string, value: string) => {
    cacheStorage.set(key, value);
  },
  removeItem: (key: string) => {
    cacheStorage.delete(key);
  },
};

const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
    },
  },
};

export const queryClient = new QueryClient(queryConfig);

export const queryClientPersistOptions: PersistQueryClientOptions = {
  queryClient,
  persister: createSyncStoragePersister({ storage }),
  maxAge: 1000 * 60 * 60 * 24,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => query.state.status === "success",
  },
};
