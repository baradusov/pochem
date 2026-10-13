import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CURRENCY_INFO, CurrencyCode } from '../core/entities/Currency';
import { searchCurrencies } from '../core/utils/searchCurrencies';

interface CurrencyPickerProps {
  visible: boolean;
  currentCurrency: CurrencyCode;
  onScreenCurrencies: CurrencyCode[];
  onSelect: (currency: CurrencyCode) => void;
  onClose: () => void;
}

export const CurrencyPicker = ({
  visible,
  currentCurrency,
  onScreenCurrencies,
  onSelect,
  onClose,
}: CurrencyPickerProps) => {
  const [query, setQuery] = useState('');
  const results = searchCurrencies(query);

  const handleSelect = (currency: CurrencyCode) => {
    setQuery('');
    onSelect(currency);
  };

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const handleSubmit = () => {
    if (results.length > 0) {
      handleSelect(results[0]);
    }
  };

  const renderItem = ({ item }: { item: CurrencyCode }) => {
    const info = CURRENCY_INFO[item];
    const isCurrent = item === currentCurrency;
    const isOnScreen = !isCurrent && onScreenCurrencies.includes(item);

    return (
      <Pressable
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        onPress={() => handleSelect(item)}
      >
        <Text style={styles.flag}>{info.flag}</Text>
        <View style={styles.itemText}>
          <Text style={styles.code}>{item}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {info.name}
          </Text>
        </View>
        {isCurrent && <Feather name="check" size={20} color="#000" />}
        {isOnScreen && <Text style={styles.swapHint}>⇅ swap</Text>}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchBox}>
            <Feather name="search" size={17} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSubmit}
              placeholder="Currency, country or city"
              placeholderTextColor="#8E8E93"
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
              spellCheck={false}
              returnKeyType="done"
              clearButtonMode="while-editing"
              selectionColor="#000"
            />
          </View>
          <Pressable onPress={handleClose} hitSlop={8}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>

        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <Text style={styles.empty}>Nothing found for “{query}”</Text>
          }
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#000',
    padding: 0,
  },
  cancel: {
    fontSize: 17,
    color: '#000',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  itemPressed: {
    backgroundColor: '#F2F2F7',
  },
  flag: {
    fontSize: 28,
  },
  itemText: {
    flex: 1,
  },
  code: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  name: {
    fontSize: 14,
    color: '#8E8E93',
  },
  swapHint: {
    fontSize: 14,
    color: '#8E8E93',
  },
  empty: {
    padding: 32,
    textAlign: 'center',
    fontSize: 15,
    color: '#8E8E93',
  },
});
