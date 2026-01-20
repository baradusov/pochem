import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CurrencyStoreContext } from './src/hooks/useCurrency';
import { CurrencyStore } from './src/core/stores/CurrencyStore';
import { ExchangeRateAdapter } from './src/infrastructure/api/ExchangeRateAdapter';
import { AsyncStorageAdapter } from './src/infrastructure/storage/AsyncStorageAdapter';
import { ConverterScreen } from './src/screens/ConverterScreen';

const exchangeRateAdapter = new ExchangeRateAdapter();
const storageAdapter = new AsyncStorageAdapter();
const currencyStore = new CurrencyStore(exchangeRateAdapter, storageAdapter);

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    currencyStore.initialize().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <CurrencyStoreContext.Provider value={currencyStore}>
        <ConverterScreen />
      </CurrencyStoreContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
