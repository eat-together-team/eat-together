import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Ionicons } from '@expo/vector-icons';
import { colorTokens } from '../../../theme/colorTokens';
import { useTheme } from '../../../rapi_ui_components';
import LargeButton from '../../../components/LargeButton';
import InformationCard from '../../../components/InformationCard';
import FilterChip from '../../../components/FilterChip';

export default function CreateAccountStep2Content({
  navigation,
  foodTags,
  setFoodTags,
  hobbyTags,
  setHobbyTags,
  schoolTags,
  setSchoolTags
}) {
  const { theme } = useTheme();
  const colors = colorTokens[theme];

  const handleRemoveFoodTag = (index) => {
    LayoutAnimation.configureNext({
      duration: 400,
      update: { type: 'spring', springDamping: 0.65 },
    });
    setFoodTags(foodTags.filter((_, i) => i !== index));
  };

  const handleRemoveHobbyTag = (index) => {
    LayoutAnimation.configureNext({
      duration: 400,
      update: { type: 'spring', springDamping: 0.65 },
    });
    setHobbyTags(hobbyTags.filter((_, i) => i !== index));
  };

  const handleRemoveSchoolTag = (index) => {
    LayoutAnimation.configureNext({
      duration: 400,
      update: { type: 'spring', springDamping: 0.65 },
    });
    setSchoolTags(schoolTags.filter((_, i) => i !== index));
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <InformationCard
        type="Informative"
        text="Choose 1-5 tags for each category for your profile"
      />

      <View style={[styles.categoryBox, { borderColor: colors.foodTagContainer }]}>
        {foodTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {foodTags.map((tag, index) => (
              <FilterChip
                key={tag}
                text={tag}
                color="Purple"
                type="Remove"
                onRemove={() => handleRemoveFoodTag(index)}
              />
            ))}
          </View>
        )}
        <LargeButton
          outlined
          color={colors.foodTagBorder}
          onPress={() =>
            navigation.navigate('EditUserTags', {
              selectedTags: foodTags,
              onSaveTags: setFoodTags,
              title: 'favorite foods',
              category: 'food',
            })
          }
          leadingIcon={
            <Ionicons
              name="add"
              size={16}
              color={colors.foodTagBorder}
            />
          }
        >
          Add favorite foods
        </LargeButton>
      </View>

      <View style={[styles.categoryBox, { borderColor: colors.hobbyTagContainer }]}>
        {hobbyTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {hobbyTags.map((tag, index) => (
              <FilterChip
                key={tag}
                text={tag}
                color="Blue"
                type="Remove"
                onRemove={() => handleRemoveHobbyTag(index)}
              />
            ))}
          </View>
        )}
        <LargeButton
          outlined
          color={colors.hobbyTagBorder}
          onPress={() =>
            navigation.navigate('EditUserTags', {
              selectedTags: hobbyTags,
              onSaveTags: setHobbyTags,
              title: 'hobbies',
              category: 'hobby',
            })
          }
          leadingIcon={<Ionicons name="add" size={16} color={colors.hobbyTagBorder} />}
        >
          Add hobbies
        </LargeButton>
      </View>

      <View style={[styles.categoryBox, { borderColor: colors.educationTagContainer }]}>
        {schoolTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {schoolTags.map((tag, index) => (
              <FilterChip
                key={tag}
                text={tag}
                color="Yellow"
                type="Remove"
                onRemove={() => handleRemoveSchoolTag(index)}
              />
            ))}
          </View>
        )}
        <LargeButton
          outlined
          color={colors.educationTagBorder}
          onPress={() =>
            navigation.navigate('EditUserTags', {
              selectedTags: schoolTags,
              onSaveTags: setSchoolTags,
              title: 'education',
              category: 'education',
            })
          }
          leadingIcon={<Ionicons name="add" size={16} color={colors.educationTagBorder} />}
        >
          Add education
        </LargeButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 20,
  },
  categoryBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
    justifyContent: 'center',
  },
});
