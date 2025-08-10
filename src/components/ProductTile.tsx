// @ts-nocheck
import React from 'react';
import { View, Image, Text, StyleSheet, Pressable } from 'react-native';

const ProductTile = React.memo(({ product, onPress, onRemove }) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {product.title}
      </Text>
      <Text style={styles.price}>₹{product.price.toLocaleString()}</Text>
      <Pressable style={styles.removeBtn} onPress={onRemove}>
        <Text style={styles.removeText}>Remove</Text>
      </Pressable>
    </Pressable>
  );
});

export default ProductTile;

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  imageWrapper: {
    width: 93,
    height: 109,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
  },
  removeBtn: {
    marginTop: 4,
  },
  removeText: {
    fontSize: 11,
    color: '#B00020',
  },
  title: {
    color: '#616161',
    fontSize: 12,
    marginTop: 8,
    textTransform: 'capitalize',
  },
  price: {
    color: '#424242',
    fontWeight: '600',
    fontSize: 14,
  },
});
