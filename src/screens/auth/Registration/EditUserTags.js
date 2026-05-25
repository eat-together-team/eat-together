import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';
import { colorTokens } from '../../../theme/colorTokens';
import { useTheme } from '../../../rapi_ui_components';
import SmallAppBar from '../../../components/SmallAppBar';
import Searchbar from '../../../components/Searchbar';
import FilterChip from '../../../components/FilterChip';
import InformationCard from '../../../components/InformationCard';
import foodTags from '../../../utils/foodTags';
import hobbyTags from '../../../utils/hobbyTags';
import schoolTags from '../../../utils/schoolTags';

export default function EditUserTags({ navigation, route }) {
  const { selectedTags = [], onSaveTags, title = 'Tags', category = 'items' } = route.params || {};
  console.log('EditUserTags route.params:', route.params);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [tags, setTags] = useState(selectedTags);
  const [showError, setShowError] = useState(false);
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const [fontsLoaded] = useFonts({ Inter_400Regular });

  const allTags = category === 'food' ? foodTags : category === 'hobby' ? hobbyTags : schoolTags;
  const tagColor = category === 'food' ? 'Purple' : category === 'hobby' ? 'Blue' : 'Yellow';
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const MAX_TAGS = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      const isLongEnough = searchQuery.trim().length >= 3;
      if (isLongEnough) contentOpacity.setValue(0.15);
      LayoutAnimation.configureNext({
        duration: 400,
        create: { type: 'easeInEaseOut', property: 'opacity' },
        update: { type: 'easeInEaseOut' },
        delete: { type: 'easeInEaseOut', property: 'opacity' },
      });
      setDebouncedQuery(searchQuery);
      if (isLongEnough) {
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }).start();
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredTags = useMemo(() => {
    if (debouncedQuery.trim().length < 3) return [];
    return allTags.filter(
      tag =>
        tag.toLowerCase().includes(debouncedQuery.toLowerCase()) &&
        !tags.includes(tag)
    );
  }, [debouncedQuery, tags]);

  const handleAddTag = (tag) => {
    if (tags.length >= MAX_TAGS) {
      setShowError(true);
      setSearchQuery('');
      return;
    }
    setShowError(false);
    LayoutAnimation.configureNext({
      duration: 600,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.8 },
      delete: { type: 'spring', property: 'scaleXY', springDamping: 0.7 },
    });
    setTags([...tags, tag]);
    setSearchQuery('');
  };

  const handleRemoveTag = (index) => {
    setShowError(false);
    LayoutAnimation.configureNext({
      duration: 400,
      update: { type: 'spring', springDamping: 0.65 },
    });
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleDisabledSearchPress = () => {
    setShowError(true);
  };

  const handleBack = () => {
    if (onSaveTags) {
      onSaveTags(tags);
    }
    navigation.goBack();
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <SmallAppBar title={`Edit ${title}`} onBack={handleBack} />

      <View style={styles.infoCardContainer}>
        <InformationCard
          type={showError ? "Error" : "Informative"}
          text={showError ? `You can choose a maximum of ${MAX_TAGS} tags` : `Choose 1-${MAX_TAGS} tags representing your ${title.toLowerCase()}`}
        />
      </View>

      <View style={styles.mainContainer}>
        <Searchbar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${category.toLowerCase()} tags`}
          disabled={tags.length >= MAX_TAGS}
          onDisabledPress={handleDisabledSearchPress}
        >
          <Animated.View style={{ opacity: contentOpacity }}>
            <ScrollView contentContainerStyle={styles.resultsGrid} showsVerticalScrollIndicator={false}>
              {filteredTags.map((tag) => (
                <FilterChip
                  key={tag}
                  text={tag}
                  type="Add"
                  color="Clear"
                  onPress={() => handleAddTag(tag)}
                />
              ))}
            </ScrollView>
          </Animated.View>
        </Searchbar>

        {/* Selected tags */}
        {tags.length > 0 && (
          <View style={styles.selectedContainer}>
            <View style={styles.tagsList}>
              {tags.map((tag, index) => (
                <FilterChip
                  key={tag}
                  text={tag}
                  color={tagColor}
                  type="Remove"
                  onRemove={() => handleRemoveTag(index)}
                />
              ))}
            </View>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  infoCardContainer: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  mainContainer: {
    flex: 1,
  },
  selectedContainer: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 10,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
});
