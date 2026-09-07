import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header3Text from './typography/Header3Text';
import SubBodyText from './typography/SubBodyText';
import LabelText from './typography/LabelText';
import { useTheme } from '../rapi_ui_components';
import { colorTokens } from '../theme/colorTokens';

// Compact list-row version of a restaurant card, used for the final results list
const CompactRestaurantCard = ({ restaurant, starred, onToggleStar }) => {
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const category = (restaurant.categories || '').split(',')[0].trim();

  const handleShare = () => {
    Share.share({ message: restaurant.url || restaurant.name }).catch(() => {});
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.containerLow }]}>
      <Image
        source={restaurant.imageUrl ? { uri: restaurant.imageUrl } : require('../../assets/foodBackground.png')}
        style={styles.image}
      />
      <View style={styles.content}>
        <Header3Text color={colors.onBackground} numberOfLines={1} ellipsizeMode="tail">
          {restaurant.name}
        </Header3Text>
        {!!category && (
          <SubBodyText color={colors.onBackground}>{category}</SubBodyText>
        )}
        <View style={styles.priceRatingRow}>
          <Header3Text color={colors.onBackground} style={styles.price}>{restaurant.price}</Header3Text>
          <View style={styles.ratingRow}>
            <LabelText color={colors.onBackground}>{restaurant.rating}</LabelText>
            <Ionicons name="star" size={10} color={colors.onBackground} />
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onToggleStar?.(restaurant, !starred)} hitSlop={8}>
          <Ionicons name={starred ? 'heart' : 'heart-outline'} size={18} color={starred ? colors.error : colors.onBackground} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} hitSlop={8}>
          <Ionicons name="share-outline" size={18} color={colors.onBackground} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 94,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  image: {
    width: 100,
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    gap: 4,
  },
  priceRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  price: {
    fontSize: 13,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actions: {
    paddingRight: 15,
    gap: 14,
    alignItems: 'center',
  },
});

export default CompactRestaurantCard;
