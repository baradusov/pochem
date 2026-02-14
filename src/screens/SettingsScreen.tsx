import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Modal,
  FlatList,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { ConversionHistoryEntry } from '../core/entities/ConversionHistory';
import { formatDate, formatNumber } from '../core/utils/format';
import { groupHistoryByDate } from '../core/utils/group';
import { useCurrency } from '../hooks/useCurrency';

interface SettingsScreenProps {
  onClose: () => void;
}

const BLOCK_COUNT_OPTIONS = [2, 3, 4];

interface HistoryEntryViewProps {
  entry: ConversionHistoryEntry;
  onPress: () => void;
}

const HistoryEntryView = ({ entry, onPress }: HistoryEntryViewProps) => {
  const otherCurrencies = entry.currencies.filter(
    (c) => c !== entry.sourceCurrency
  );

  return (
    <Pressable style={styles.historyEntry} onPress={onPress}>
      <Text style={styles.sourceCurrencyLabel}>{entry.sourceCurrency}</Text>
      <Text style={styles.sourceAmount}>
        {formatNumber(entry.sourceAmount)}
      </Text>

      <View style={styles.otherCurrenciesRow}>
        {otherCurrencies.map((currency) => (
          <View key={currency} style={styles.otherCurrencyItem}>
            <Text style={styles.otherCurrencyLabel}>{currency}</Text>
            <Text style={styles.otherCurrencyAmount}>
              {formatNumber(entry.amounts[currency])}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
};

export const SettingsScreen = observer(function SettingsScreen({
  onClose,
}: SettingsScreenProps) {
  const store = useCurrency();
  const [pickerVisible, setPickerVisible] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (store.refreshing) {
      spinValue.setValue(0);
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
    }
  }, [store.refreshing, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleBlockCountSelect = (count: number) => {
    store.updateBlockCount(count);
    setPickerVisible(false);
  };

  const handleHistoryPress = (entry: ConversionHistoryEntry) => {
    store.restoreFromHistory(entry);
    onClose();
  };

  const groupedHistory = groupHistoryByDate(store.conversionHistory);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={8}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} bounces={false}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <View style={styles.settingsContent}>
          <View style={styles.row}>
            <Text style={styles.label}>Last updated</Text>
            <View style={styles.valueWithAction}>
              <Text style={styles.value}>
                {store.rates ? formatDate(store.rates.updatedAt) : '—'}
              </Text>
              <Pressable
                onPress={() => store.refreshRates()}
                hitSlop={8}
                disabled={store.refreshing}
              >
                <Animated.Text
                  style={[
                    styles.refreshIcon,
                    { transform: [{ rotate: spin }] },
                  ]}
                >
                  ↻
                </Animated.Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.row} onPress={() => setPickerVisible(true)}>
            <Text style={styles.label}>Number of currencies</Text>
            <Text style={styles.value}>{store.blockCount} ›</Text>
          </Pressable>
        </View>

        {store.conversionHistory.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>History</Text>

            {groupedHistory.map((group) => (
              <View key={group.date}>
                <Text style={styles.dateHeader}>{formatDate(group.date)}</Text>
                {group.entries.map((entry) => (
                  <HistoryEntryView
                    key={entry.id}
                    entry={entry}
                    onPress={() => handleHistoryPress(entry)}
                  />
                ))}
              </View>
            ))}
          </>
        )}

        <View style={styles.footerSpacer} />

        <Pressable
          style={styles.footer}
          onPress={() => Linking.openURL('https://baradusov.ru')}
        >
          <Text style={styles.footerText}>Made by Nuril</Text>
          <Text style={styles.footerLink}>baradusov.ru</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={pickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerVisible(false)}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <Pressable onPress={() => setPickerVisible(false)} hitSlop={8}>
              <Text style={styles.backButton}>← Back</Text>
            </Pressable>
          </View>

          <FlatList
            data={BLOCK_COUNT_OPTIONS}
            keyExtractor={(item) => String(item)}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.optionRow,
                  item === store.blockCount && styles.optionRowSelected,
                ]}
                onPress={() => handleBlockCountSelect(item)}
              >
                <Text
                  style={[
                    styles.optionText,
                    item === store.blockCount && styles.optionTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 17,
    color: '#007AFF',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  settingsContent: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 17,
    color: '#000',
  },
  value: {
    fontSize: 17,
    color: '#999',
  },
  valueWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshIcon: {
    fontSize: 17,
    color: '#007AFF',
  },
  dateHeader: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  historyEntry: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sourceCurrencyLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  sourceAmount: {
    fontSize: 40,
    fontWeight: '600',
    marginBottom: 8,
  },
  otherCurrenciesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    rowGap: 8,
  },
  otherCurrencyItem: {
    flexDirection: 'column',
  },
  otherCurrencyLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  otherCurrencyAmount: {
    fontSize: 15,
    color: '#000',
  },
  footerSpacer: {
    height: 20,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 15,
  },
  optionRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionRowSelected: {
    backgroundColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 17,
    color: '#000',
  },
  optionTextSelected: {
    fontWeight: '600',
  },
});
