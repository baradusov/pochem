import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useCurrency } from '../hooks/useCurrency';

interface SettingsScreenProps {
  onClose: () => void;
}

export const SettingsScreen = observer(function SettingsScreen({
  onClose,
}: SettingsScreenProps) {
  const store = useCurrency();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={8}>
          <Text style={styles.backButton}>← Назад</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Курсы обновлены</Text>
          <Text style={styles.value}>
            {store.rates?.updatedAt ? formatDate(store.rates.updatedAt) : '—'}
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.footer}
        onPress={() => Linking.openURL('https://baradusov.ru')}
      >
        <Text style={styles.footerText}>Сделано Нурилем</Text>
        <Text style={styles.footerLink}>baradusov.ru</Text>
      </Pressable>
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
  content: {
    padding: 16,
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
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 15,
  },
});
