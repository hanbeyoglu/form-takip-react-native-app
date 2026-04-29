import AsyncStorage from "@react-native-async-storage/async-storage";

type StorageValue = string | null;

export interface StorageService {
  getItem(key: string): Promise<StorageValue>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

class AsyncStorageService implements StorageService {
  async getItem(key: string): Promise<StorageValue> {
    return AsyncStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}

export const storageService: StorageService = new AsyncStorageService();
