import React, { useState, useMemo, useEffect, useRef } from 'react'
import { View, ScrollView, StyleSheet, Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import RestaurantCard from "../../components/RestaurantCard";
import Header2Text from '../../components/typography/Header2Text';
import Searchbar from '../../components/Searchbar';
import FilterChip from '../../components/FilterChip';
import { useTheme } from '../../rapi_ui_components';
import { colorTokens } from '../../theme/colorTokens';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MAX_TAGS = 4;

//dietary tags (approved category aliases) from Yelp
const dietaryTags = ["Vegan","Vegetarian","Gluten-free","Halal","Kosher","Dairy-free","Pescatarian","Meat eater","Spicy-food lover","Non-spicy foods only"];

// Dietary screen that allows users to select dietary preferences
const DietaryPref = ({ setSelectedDietaryTags, selectedDietaryTags }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const contentOpacity = useRef(new Animated.Value(1)).current;

  //debounce the search query before filtering, matching the app's other inline tag search patterns
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
        Animated.timing(contentOpacity, { toValue: 1, duration: 380, useNativeDriver: true }).start();
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredTags = useMemo(() => {
    if (debouncedQuery.trim().length < 3) return [];
    return dietaryTags.filter(
      (tag) => tag.toLowerCase().includes(debouncedQuery.toLowerCase()) && !selectedDietaryTags.includes(tag)
    );
  }, [debouncedQuery, selectedDietaryTags]);

  const handleAddTag = (tag) => {
    if (selectedDietaryTags.length >= MAX_TAGS) {
      alert("You can only select up to 4 tags.");
      return;
    }
    LayoutAnimation.configureNext({
      duration: 600,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.8 },
      delete: { type: 'spring', property: 'scaleXY', springDamping: 0.7 },
    });
    setSelectedDietaryTags([...selectedDietaryTags, tag]);
    setSearchQuery('');
  };

  const handleRemoveTag = (index) => {
    LayoutAnimation.configureNext({ duration: 400, update: { type: 'spring', springDamping: 0.65 } });
    setSelectedDietaryTags(selectedDietaryTags.filter((_, i) => i !== index));
  };

  return (
    <View style={[styles.cardWrapper, { backgroundColor: colors.containerLow }]}>
      <RestaurantCard height={572} width={340}>
        <View style={styles.content}>
          <Header2Text color={colors.onBackground} center>Do you have any{'\n'}dietary restrictions?</Header2Text>
          <Searchbar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search dietary restrictions"
            containerStyle={styles.searchbar}
          >
            <Animated.View style={{ opacity: contentOpacity }}>
              <ScrollView style={styles.resultsScroll} contentContainerStyle={styles.resultsGrid} showsVerticalScrollIndicator={false}>
                {filteredTags.map((tag) => (
                  <FilterChip key={tag} text={tag} type="Add" color="Clear" onPress={() => handleAddTag(tag)} />
                ))}
              </ScrollView>
            </Animated.View>
          </Searchbar>
          {selectedDietaryTags.length > 0 && (
            <View style={styles.tagsList}>
              {selectedDietaryTags.map((tag, index) => (
                <FilterChip key={tag} text={tag} color="Green" type="Remove" onRemove={() => handleRemoveTag(index)} />
              ))}
            </View>
          )}
        </View>
      </RestaurantCard>
    </View>
  )
}
const styles = StyleSheet.create({
    cardWrapper: {
      width: 340,
      borderRadius: 20,
      overflow: 'hidden',
    },

    content: {
      alignItems: 'center',
      gap: 25,
      paddingHorizontal: 20,
      paddingTop: 0,
      paddingBottom: 25,
    },

    searchbar: {
      width: '100%',
      paddingHorizontal: 0,
      paddingVertical: 0,
    },

    resultsScroll: {
      maxHeight: 130,
    },

    resultsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      justifyContent: 'center',
    },

    tagsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      justifyContent: 'center',
    },
  })
export default DietaryPref
