import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
} from 'react-native';
import { AVAILABLE_CURRENCIES, CurrencyCode } from '../core/entities/Currency';

interface CurrencyPickerProps {
  visible: boolean;
  currentCurrency: CurrencyCode;
  disabledCurrencies: CurrencyCode[];
  onSelect: (currency: CurrencyCode) => void;
  onClose: () => void;
}

export const CurrencyPicker = ({
  visible,
  currentCurrency,
  disabledCurrencies,
  onSelect,
  onClose,
}: CurrencyPickerProps) => {
  const renderItem = ({ item }: { item: CurrencyCode }) => {
    const isDisabled =
      disabledCurrencies.includes(item) && item !== currentCurrency;
    const isCurrent = item === currentCurrency;

    return (
      <Pressable
        style={[
          styles.item,
          isCurrent && styles.currentItem,
          isDisabled && styles.disabledItem,
        ]}
        onPress={() => {
          if (!isDisabled) {
            onSelect(item);
          }
        }}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.itemText,
            isCurrent && styles.currentItemText,
            isDisabled && styles.disabledItemText,
          ]}
        >
          {item}
        </Text>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Currency</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Done</Text>
          </Pressable>
        </View>

        <FlatList
          data={AVAILABLE_CURRENCIES as unknown as CurrencyCode[]}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.list}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  list: {
    paddingVertical: 8,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  currentItem: {
    backgroundColor: '#f0f0f0',
  },
  disabledItem: {
    opacity: 0.4,
  },
  itemText: {
    fontSize: 17,
    color: '#000',
  },
  currentItemText: {
    fontWeight: '600',
  },
  disabledItemText: {
    color: '#999',
  },
});
