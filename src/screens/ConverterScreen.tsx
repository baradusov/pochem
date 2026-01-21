import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  InputAccessoryView,
  TouchableOpacity,
  Text,
  TextInput,
  Keyboard,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { CurrencyCode } from '../core/entities/Currency';
import { CurrencyBlock } from '../components/CurrencyBlock';
import { CurrencyPicker } from '../components/CurrencyPicker';
import { useCurrency } from '../hooks/useCurrency';

const INPUT_ACCESSORY_ID = 'currencyInputAccessory';

export const ConverterScreen = observer(function ConverterScreen() {
  const store = useCurrency();
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const contentHeight = windowHeight - insets.top;
  const blockHeight = contentHeight / store.selectedCurrencies.length;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (keyboardHeight > 0) {
      const activeIndex = store.selectedCurrencies.indexOf(store.activeCurrency);
      const blockTop = activeIndex * blockHeight;
      const blockBottom = blockTop + blockHeight;
      const visibleHeight = contentHeight - keyboardHeight;

      let scrollY = 0;
      if (blockBottom > visibleHeight) {
        scrollY = blockBottom - visibleHeight;
      }
      scrollY = Math.max(0, Math.min(scrollY, keyboardHeight));

      scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
    }
  }, [store.activeCurrency, store.selectedCurrencies, keyboardHeight, blockHeight, contentHeight]);

  const handleCurrencyPress = (currency: CurrencyCode) => {
    store.selectCurrency(currency);
    inputRef.current?.focus();
  };

  const handleCurrencyCodePress = (index: number) => {
    Keyboard.dismiss();
    setEditingIndex(index);
    setPickerVisible(true);
  };

  const handlePickerSelect = (currency: CurrencyCode) => {
    if (editingIndex !== null) {
      store.replaceCurrency(editingIndex, currency);
    }
    setPickerVisible(false);
    setEditingIndex(null);
  };

  const handlePickerClose = () => {
    setPickerVisible(false);
    setEditingIndex(null);
  };

  const handleChangeText = (text: string) => {
    store.updateInput(text);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={store.formatAmount(store.activeCurrency)}
        onChangeText={handleChangeText}
        keyboardType="decimal-pad"
        selectionColor="#000"
        inputAccessoryViewID={Platform.OS === 'ios' ? INPUT_ACCESSORY_ID : undefined}
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={{
          height: contentHeight + keyboardHeight,
          paddingBottom: keyboardHeight,
        }}
        scrollEnabled={keyboardHeight > 0}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {store.selectedCurrencies.map((currency, index) => (
          <CurrencyBlock
            key={`${index}-${currency}`}
            currency={currency}
            isLast={index === store.selectedCurrencies.length - 1}
            onPress={handleCurrencyPress}
            onCurrencyCodePress={() => handleCurrencyCodePress(index)}
            isKeyboardVisible={keyboardHeight > 0}
          />
        ))}
      </ScrollView>

      <CurrencyPicker
        visible={pickerVisible}
        currentCurrency={editingIndex !== null ? store.selectedCurrencies[editingIndex] : 'EUR'}
        disabledCurrencies={store.selectedCurrencies}
        onSelect={handlePickerSelect}
        onClose={handlePickerClose}
      />

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={INPUT_ACCESSORY_ID}>
          <View style={styles.accessoryContainer}>
            <TouchableOpacity onPress={Keyboard.dismiss} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  accessoryContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  doneButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
});
