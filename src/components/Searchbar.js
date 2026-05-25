import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_500Medium } from '@expo-google-fonts/inter';
import { colorTokens } from '../theme/colorTokens';
import { useTheme } from '../rapi_ui_components';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Searchbar = ({ value, onChangeText, placeholder = 'Search', children = null, disabled = false, onDisabledPress }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const [fontsLoaded] = useFonts({ Inter_500Medium });
  const [isFocused, setIsFocused] = useState(false);
  const resultsOpacity = useRef(new Animated.Value(0)).current;

  const fontFamily = fontsLoaded
    ? 'Inter_500Medium'
    : Platform.OS === 'ios' ? 'System' : 'sans-serif-medium';

  const isQuery = value.trim().length > 0;
  const showResults = value.trim().length >= 3;

  useEffect(() => {
    if (showResults) {
      resultsOpacity.setValue(0);
      Animated.timing(resultsOpacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }).start();
    }
  }, [showResults]);


  const handleChangeText = (text) => {
    const willShow = text.trim().length >= 3;
    const isShowing = value.trim().length >= 3;
    if (willShow !== isShowing) {
      LayoutAnimation.configureNext({
        duration: 350,
        create: { type: 'easeInEaseOut', property: 'opacity' },
        update: { type: 'easeInEaseOut' },
        delete: { type: 'easeInEaseOut', property: 'opacity' },
      });
    }
    onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={disabled ? onDisabledPress : undefined}
        disabled={!disabled}
      >
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme === 'dark' ? colors.containerLow : colors.background,
              borderColor: colors.containerMedium,
              shadowColor: '#000000',
              borderRadius: showResults ? 20 : 30,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <View style={styles.inputRow} pointerEvents={disabled ? 'none' : 'auto'}>
            <Ionicons name="search" size={24} color={colors.onBackground} />
            <TextInput
              style={[
                styles.input,
                {
                  color: isQuery ? colors.onBackground : colors.textLight,
                  fontFamily,
                },
              ]}
              placeholder={placeholder}
              placeholderTextColor={colors.textLight}
              value={value}
              onChangeText={handleChangeText}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              editable={!disabled}
            />
          </View>

          {showResults && children && (
            <Animated.View style={[styles.resultsContainer, { opacity: resultsOpacity }]}>
              {children}
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBox: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3.7,
    elevation: 3,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 13,
    textAlignVertical: 'center',
  },
  resultsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 15,
  },
});

export default Searchbar;
