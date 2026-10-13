import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { ConversionHistoryEntry } from '../core/entities/ConversionHistory';
import { formatDay, formatNumber, formatTime } from '../core/utils/format';
import { groupHistoryByDate } from '../core/utils/group';
import { useCurrency } from '../hooks/useCurrency';

interface HistoryEntryViewProps {
  entry: ConversionHistoryEntry;
  onPress: () => void;
}

const HistoryEntryView = ({ entry, onPress }: HistoryEntryViewProps) => {
  const otherCurrencies = entry.currencies.filter(
    (c) => c !== entry.sourceCurrency
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.entry, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.sourceRow}>
        <Text style={styles.sourceCurrency}>{entry.sourceCurrency}</Text>
        <Text style={styles.time}>{formatTime(entry.timestamp)}</Text>
      </View>
      <Text style={styles.sourceAmount}>
        {formatNumber(entry.sourceAmount)}
      </Text>

      <View style={styles.otherCurrencies}>
        {otherCurrencies.map((currency) => (
          <View key={currency}>
            <Text style={styles.otherCurrency}>{currency}</Text>
            <Text style={styles.otherAmount}>
              {formatNumber(entry.amounts[currency])}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
};

interface HistoryListProps {
  onSelect: (entry: ConversionHistoryEntry) => void;
}

export const HistoryList = observer(function HistoryList({
  onSelect,
}: HistoryListProps) {
  const store = useCurrency();
  const groups = groupHistoryByDate(store.conversionHistory);

  return (
    <View>
      {groups.map((group) => (
        <View key={group.date}>
          <Text style={styles.day}>{formatDay(group.date)}</Text>
          {group.entries.map((entry) => (
            <HistoryEntryView
              key={entry.id}
              entry={entry}
              onPress={() => onSelect(entry)}
            />
          ))}
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  day: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  entry: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pressed: {
    backgroundColor: '#F2F2F7',
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  sourceCurrency: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  time: {
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    color: '#999',
  },
  sourceAmount: {
    fontSize: 40,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    color: '#000',
    marginBottom: 8,
  },
  otherCurrencies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    rowGap: 8,
  },
  otherCurrency: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  otherAmount: {
    fontSize: 15,
    fontVariant: ['tabular-nums'],
    color: '#000',
  },
});
