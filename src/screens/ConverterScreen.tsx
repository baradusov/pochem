import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
  Modal,
  Pressable,
  Image,
  LayoutAnimation,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { CurrencyCode } from '../core/entities/Currency';
import {
  BLOCK_CHROME_HEIGHT,
  BLOCK_PADDING_HORIZONTAL,
  CurrencyBlock,
} from '../components/CurrencyBlock';
import { CurrencyPicker } from '../components/CurrencyPicker';
import { CalculatorKeyboard } from '../components/CalculatorKeyboard';
import { fitFontSize } from '../components/fitFontSize';
import { SettingsScreen } from './SettingsScreen';
import { useCurrency } from '../hooks/useCurrency';

/** While typing, the edited block takes this many shares of height, others one */
const EDITED_BLOCK_FLEX = 2;

const animateLayout = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
};

export const ConverterScreen = observer(function ConverterScreen() {
  const store = useCurrency();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [blocksHeight, setBlocksHeight] = useState(0);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const currencies = store.visibleCurrencies;
  const isExpanded = (currency: CurrencyCode) =>
    store.isEditing && currency === store.activeCurrency;
  const flexOf = (currency: CurrencyCode) =>
    isExpanded(currency) ? EDITED_BLOCK_FLEX : 1;
  const totalFlex = currencies.reduce((sum, c) => sum + flexOf(c), 0);

  const fitBlockFont = (currency: CurrencyCode) =>
    fitFontSize(
      store.formatAmount(currency),
      width - BLOCK_PADDING_HORIZONTAL * 2,
      (blocksHeight * flexOf(currency)) / totalFlex - BLOCK_CHROME_HEIGHT
    );

  // Non-edited blocks share one size so the numbers read as a single table
  const sharedFontSize = Math.min(
    ...currencies.filter((c) => !isExpanded(c)).map(fitBlockFont)
  );
  const fontSizeOf = (currency: CurrencyCode) =>
    isExpanded(currency) ? fitBlockFont(currency) : sharedFontSize;

  const handleCurrencyPress = (currency: CurrencyCode) => {
    if (!isExpanded(currency)) animateLayout();
    store.startEditing(currency);
  };

  const handleEvaluate = () => {
    animateLayout();
    store.finishEditing();
  };

  const handleCurrencyCodePress = (index: number) => {
    if (store.isEditing) handleEvaluate();
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View
        style={styles.blocks}
        onLayout={(e) => setBlocksHeight(e.nativeEvent.layout.height)}
      >
        {currencies.map((currency, index) => (
          <CurrencyBlock
            key={`${index}-${currency}`}
            currency={currency}
            isLast={index === currencies.length - 1}
            flex={flexOf(currency)}
            fontSize={fontSizeOf(currency)}
            onPress={handleCurrencyPress}
            onCurrencyCodePress={() => handleCurrencyCodePress(index)}
          />
        ))}
      </View>

      {store.isEditing && (
        <CalculatorKeyboard
          onDigit={(d) => store.appendDigit(d)}
          onOperator={(op) => store.appendOperator(op)}
          onDecimal={() => store.appendDecimal()}
          onBackspace={() => store.backspace()}
          onClear={() => store.clearInput()}
          onEvaluate={handleEvaluate}
        />
      )}

      {!store.isEditing && (
        <View style={[styles.logoContainer, { bottom: insets.bottom + 16 }]}>
          <Pressable onPress={() => setSettingsVisible(true)} hitSlop={8}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
            />
          </Pressable>
        </View>
      )}

      <CurrencyPicker
        visible={pickerVisible}
        currentCurrency={
          editingIndex !== null ? currencies[editingIndex] : 'EUR'
        }
        onScreenCurrencies={currencies}
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
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  blocks: {
    flex: 1,
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
});
