import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { CurrencyCode } from '../core/entities/Currency';
import { CurrencyBlock } from '../components/CurrencyBlock';
import { CurrencyPicker } from '../components/CurrencyPicker';
import { CalculatorKeyboard } from '../components/CalculatorKeyboard';
import { SettingsScreen } from './SettingsScreen';
import { useCurrency } from '../hooks/useCurrency';

export const ConverterScreen = observer(function ConverterScreen() {
  const store = useCurrency();
  const scrollViewRef = useRef<ScrollView>(null);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const contentHeight = windowHeight - insets.top;
  const blockHeight = contentHeight / store.visibleCurrencies.length;

  useEffect(() => {
    if (keyboardVisible && keyboardHeight > 0) {
      const activeIndex = store.visibleCurrencies.indexOf(store.activeCurrency);
      const blockTop = activeIndex * blockHeight;
      const blockBottom = blockTop + blockHeight;
      const visibleHeight = contentHeight - keyboardHeight;

      let scrollY = 0;
      if (blockBottom > visibleHeight) {
        scrollY = blockBottom - visibleHeight;
      }
      scrollY = Math.max(0, Math.min(scrollY, keyboardHeight));

      scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
    } else {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [
    store.activeCurrency,
    store.visibleCurrencies,
    keyboardVisible,
    keyboardHeight,
    blockHeight,
    contentHeight,
  ]);

  const handleCurrencyPress = (currency: CurrencyCode) => {
    store.selectCurrency(currency);
    setKeyboardVisible(true);
  };

  const handleCurrencyCodePress = (index: number) => {
    setKeyboardVisible(false);
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

  const handleEvaluate = () => {
    store.evaluate();
    setKeyboardVisible(false);
    store.saveToHistory();
  };

  const handleKeyboardHeight = (height: number) => {
    setKeyboardHeight(height);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {!keyboardVisible && (
        <View style={[styles.logoContainer, { bottom: insets.bottom + 16 }]}>
          <Pressable onPress={() => setSettingsVisible(true)} hitSlop={8}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
            />
          </Pressable>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={{
          height: contentHeight + keyboardHeight,
          paddingBottom: keyboardHeight,
        }}
        scrollEnabled={keyboardVisible}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {store.visibleCurrencies.map((currency, index) => (
          <CurrencyBlock
            key={`${index}-${currency}`}
            currency={currency}
            isLast={index === store.visibleCurrencies.length - 1}
            onPress={handleCurrencyPress}
            onCurrencyCodePress={() => handleCurrencyCodePress(index)}
            isKeyboardVisible={keyboardVisible}
          />
        ))}
      </ScrollView>

      <CurrencyPicker
        visible={pickerVisible}
        currentCurrency={
          editingIndex !== null ? store.visibleCurrencies[editingIndex] : 'EUR'
        }
        disabledCurrencies={store.selectedCurrencies}
        onSelect={handlePickerSelect}
        onClose={handlePickerClose}
      />

      <Modal
        visible={settingsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <SettingsScreen onClose={() => setSettingsVisible(false)} />
      </Modal>

      {keyboardVisible && (
        <View style={styles.keyboardContainer}>
          <CalculatorKeyboard
            onDigit={(d) => store.appendDigit(d)}
            onOperator={(op) => store.appendOperator(op)}
            onDecimal={() => store.appendDecimal()}
            onBackspace={() => store.backspace()}
            onClear={() => store.clearInput()}
            onEvaluate={handleEvaluate}
            onHeightChange={handleKeyboardHeight}
          />
        </View>
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'cover',
    borderColor: '#000',
    borderRadius: '50%',
    borderWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  keyboardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
