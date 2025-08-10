// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  FlatList,
} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const itemsPerRow = 4;
const circleSize = windowWidth * 0.2; // 20% of width

const EcomTile = React.memo(({ merchant, setWebUri }) => {
  const { name, categories, logoUrl, websiteUrl } = merchant;

  const [expanded, setExpanded] = useState(false);
  const [rows, setRows] = React.useState(categories);

  useEffect(() => {
    if (categories && categories.length) {
      let temp = [...categories];
      if (!temp.find(row => row.title === 'More')) {
        temp = [
          ...temp,
          {
            title: 'More',
            imageUrl: 'https://img.icons8.com/fluency/96/000000/more.png',
          },
        ];
      }

      const visibleCategories = expanded ? temp : temp.slice(0, 7);
      setRows(visibleCategories);
    }
  }, [categories, expanded]);

  const handleToggle = () => setExpanded(!expanded);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setWebUri(websiteUrl)}>
        <View style={styles.headerRow}>
          <Image source={{ uri: logoUrl }} style={styles.logo} />
          <Text style={styles.headerText}>Buy on {name}</Text>
        </View>
      </Pressable>

      <FlatList
        data={rows}
        keyExtractor={item => item.title}
        numColumns={itemsPerRow}
        columnWrapperStyle={{ justifyContent: 'space-evenly' }}
        renderItem={({ item: cat, index: idx }) => (
          <Pressable
            key={`cat-${idx}`}
            style={styles.circle}
            onPress={() => {
              setWebUri(cat.productPageUrl);
            }}
          >
            <Image
              source={{ uri: cat.imageUrl }}
              style={styles.categoryImage}
            />
            <Text style={styles.categoryTitle}>{cat.title}</Text>
          </Pressable>
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* view more / less toggle */}
      {categories.length > 7 && (
        <Pressable onPress={handleToggle} style={styles.viewMoreBtn}>
          <Text style={styles.viewMoreText}>
            {expanded ? 'View less' : 'View more'}
          </Text>
        </Pressable>
      )}
    </View>
  );
});

export default EcomTile;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    height: 25,
    width: 25,
    marginLeft: 10
  },
  headerText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  circle: {
    width: circleSize,
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoryImage: {
    width: circleSize * 0.8,
    height: circleSize * 0.8,
    borderRadius: circleSize * 0.4,
    backgroundColor: '#FFF',
    objectFit: 'contain',
  },
  categoryTitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#616161',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  viewMoreBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  viewMoreText: {
    color: '#6C33DB',
    fontSize: 14,
  },
  closeBtn: {
    position: 'absolute',
    zIndex: 2,
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFF',
    fontSize: 18,
  },
});
