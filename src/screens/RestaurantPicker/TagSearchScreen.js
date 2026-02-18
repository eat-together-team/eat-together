import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import { Layout } from 'react-native-rapi-ui';
import { Ionicons } from '@expo/vector-icons';
import NormalText from '../../components/NormalText';
import SmallText from '../../components/SmallText';
import { auth, db } from '../../provider/Firebase';

const POPULAR_CUISINES = ['Mexican cuisine', 'Italian cuisine', 'Mediterranean cuisine', 'Indian cuisine', 'Japanese cuisine'];
const SUGGESTED_DIETARY_TAGS = ['Vegan', 'Vegetarian', 'Dairy-free', 'Gluten-free'];

export default function TagSearchScreen({ route, navigation }) {
  const { items = [], selectedItems: initialSelected = [], screenType, title = 'Add tags' } = route.params || {};
  const [selected, setSelected] = useState(Array.isArray(initialSelected) ? [...initialSelected] : []);
  const [search, setSearch] = useState('');
  const [favoriteCuisines, setFavoriteCuisines] = useState([]);

  useEffect(() => {
    if (screenType !== 'cuisine') return;
    const user = auth.currentUser;
    if (!user) return;
    db.collection('Users')
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (!doc.exists) return;
        const tags = doc.data().tags || [];
        const userFoodTags = tags.filter((t) => t.type === 'food').map((t) => t.tag);
        setFavoriteCuisines(userFoodTags.filter((tag) => items.includes(tag)));
      })
      .catch(() => {});
  }, [screenType, items]);

  const defaultItems =
    !search.trim()
      ? screenType === 'cuisine'
        ? selected.length > 0
          ? selected
          : favoriteCuisines.length > 0
            ? favoriteCuisines
            : POPULAR_CUISINES.filter((c) => items.includes(c))
        : screenType === 'dietary'
          ? selected.length > 0
            ? selected
            : SUGGESTED_DIETARY_TAGS.filter((t) => items.includes(t))
          : null
      : null;

  const defaultTitle =
    defaultItems && screenType === 'cuisine'
      ? selected.length > 0
        ? 'Selected cuisines'
        : favoriteCuisines.length > 0
          ? 'Your favorite cuisines'
          : 'Popular cuisines'
      : defaultItems && screenType === 'dietary'
        ? selected.length > 0
          ? 'Selected dietary restrictions'
          : 'Suggested'
        : null;

  const filtered = search.trim()
    ? items.filter((item) => String(item).toLowerCase().includes(search.toLowerCase()))
    : defaultItems ?? items;

  const toggle = useCallback((item) => {
    setSelected((prev) => {
      const idx = prev.indexOf(item);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, item];
    });
  }, []);

  const handleDone = useCallback(() => {
    Keyboard.dismiss();
    const param = screenType === 'dietary' ? 'selectedDietaryTags' : 'cuisineTagSelected';
    navigation.navigate('Restaurant', { [param]: selected });
  }, [navigation, screenType, selected]);

  const renderItem = useCallback(({ item }) => {
    const isSelected = selected.indexOf(item) >= 0;
    return (
      <View style={[styles.item, isSelected && styles.itemSelected]}>
        <NormalText size={12} color="black" style={styles.itemText}>{item}</NormalText>
        <TouchableOpacity
          onPress={() => toggle(item)}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isSelected ? "close" : "add"} 
            size={20} 
            color="black" 
          />
        </TouchableOpacity>
      </View>
    );
  }, [selected, toggle]);

  return (
    <Layout style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            const param = screenType === 'dietary' ? 'selectedDietaryTags' : 'cuisineTagSelected';
            navigation.navigate('Restaurant', { [param]: selected });
          }}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder={screenType === 'dietary' ? 'Search food tags' : 'Search cuisines'}
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoFocus
        />
      </View>
      <View style={styles.content}>
        {defaultTitle && (
          <NormalText weight="bold" size={12} style={styles.sectionTitle}>
            {defaultTitle}
          </NormalText>
        )}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          renderItem={renderItem}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    paddingTop: 36,
    gap: 12,
  },

  backButton: {
    padding: 4,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  sectionTitle: {
    marginBottom: 12,
    paddingHorizontal: 4,
    fontWeight: 'bold',
  },

  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 2,
    borderColor: '#B2B2B2',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 24,
    alignItems: 'center',
  },

  item: {
    width: 350,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D0D0D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 8,
    alignSelf: 'center',
  },

  itemSelected: {
    backgroundColor: 'rgba(93, 176, 117, 0.3)',
    borderColor: '#5DB075',
  },

  itemText: {
    textAlign: 'left',
    flex: 1,
  },

  iconButton: {
    padding: 4,
    marginLeft: 8,
  }
});
