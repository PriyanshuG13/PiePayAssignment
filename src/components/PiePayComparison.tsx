// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  Vibration,
  GestureResponderEvent,
  PanResponderGestureState,
  ImageBackground,
  Image
} from 'react-native';

interface ApiData {
  flipkartPrice: number;
  wowDealPrice: number;
  savingPercentage: number;
  productImgUri: string;
}

interface LoadingDotProps {
  delay: number;
  index: number;
}

const LoadingDot: React.FC<LoadingDotProps> = ({ delay, index }) => {
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(animate, 1000);
      });
    };

    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, [opacity, delay]);

  // @ts-ignore
  return (
    <Animated.View
      style={[
        styles.dot,
        styles[`dot${index}`],
        { opacity },
      ]}
    />
  );
};

interface PiePayComparisonProps {
  title: string;
}

const PiePayComparison: React.FC<PiePayComparisonProps> = ({ title }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<ApiData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes in seconds
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY()).current;

  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = screenWidth * 0.8;
  const slideThreshold = buttonWidth * 0.7;

  // Simulate API call
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        // Simulate API delay
        const urlTitle = title
          .replace(/[^a-zA-Z0-9 ]/g, '')
          .trim()
          .replace(/\s+/g, '_');

        const response = await fetch(
          `http://localhost:3000/api/prices/${urlTitle}`,
        );

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const apiData: ApiData = await response.json();
        console.log(apiData);

        setData(apiData);
        setIsLoading(false);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Handle error appropriately in production
      }
    };

    fetchData();
  }, [fadeAnim, title]);

  // Countdown timer
  useEffect(() => {
    if (!isLoading && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsVisible(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isLoading, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => !isLoading,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (
        event: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        pan.flattenOffset();
        const { dx } = gestureState;

        if (dx > slideThreshold) {
          // Slide completed - proceed action
          Animated.spring(pan, {
            toValue: { x: buttonWidth - 60, y: 0 },
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start(() => {
            // Add haptic feedback
            Vibration.vibrate(50);
            console.log('Proceed action triggered');

            // Reset slider after action
            setTimeout(() => {
              Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
                tension: 100,
                friction: 8,
              }).start();
            }, 1000);
          });
        } else {
          // Slide back to start
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    }),
  ).current;

  if (!isVisible) {
    return null;
  }

  if (isLoading || !data) {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={require('../assets/loader.png')}
          resizeMode="stretch" // or "contain", "stretch"
          style={styles.loadingCard}
        >
          <View style={styles.spinnerContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <LoadingDot key={i} delay={i * 100} index={i} />
            ))}
          </View>
        </ImageBackground>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ImageBackground
        source={require('../assets/pie-pay-banner-bg.png')}
        resizeMode="stretch" // or "contain", "stretch"
        style={styles.card}
      >
        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerIcon}>🕐</Text>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>

        {/* Flipkart Price */}
        <View style={styles.priceRow}>
          <Text style={styles.flipkartPrice}>
            {formatPrice(data.flipkartPrice)}
          </Text>
        </View>

        {/* Piepay Price */}
        <View style={styles.piepayRow}>
          <View style={styles.piepayPriceContainer}>
            <Text style={styles.piepayPrice}>
              {formatPrice(data.wowDealPrice)}
            </Text>
          </View>
          <View style={styles.discountContainer}>
            <Text style={styles.discountText}>{data.savingPercentage}%</Text>
          </View>
          <Image source={{ uri: data.productImgUri }} style={styles.productImageContainer} />
        </View>

        {/* Proceed Slider */}
        <View style={styles.sliderContainer}>
          <View style={[styles.sliderTrack, { width: buttonWidth }]}>
            <Text style={styles.sliderText}>Proceed</Text>
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.sliderButton,
                {
                  transform: [
                    {
                      translateX: pan.x.interpolate({
                        inputRange: [0, buttonWidth - 60],
                        outputRange: [0, buttonWidth - 60],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.sliderArrow}>›››</Text>
            </Animated.View>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  loadingCard: {
    width: '100%',
    height: 350,
    alignItems: 'center',
    position: 'relative',
  },
  spinnerContainer: {
    width: 40,
    height: 40,
    bottom: -190,
    position: 'relative',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2C2C2C',
    position: 'absolute',
  },
  dot1: { top: 0, left: 17 },
  dot2: { top: 5, right: 5 },
  dot3: { top: 17, right: 0 },
  dot4: { bottom: 5, right: 5 },
  dot5: { bottom: 0, left: 17 },
  dot6: { bottom: 5, left: 5 },
  dot7: { top: 17, left: 0 },
  dot8: { top: 5, left: 5 },
  card: {
    width: '100%',
    height: 380,
    position: 'relative'
  },
  timerContainer: {
    position: 'absolute',
    top: 25,
    right: 25,
    backgroundColor: '#F5D971',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  timerIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  priceRow: {
    position: 'absolute',
    bottom: 245,
    right: 75,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: '#2C2C2C',
    fontWeight: '400',
  },
  flipkartPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5D971',
    marginVertical: 8,
  },
  piepayRow: {
    width: '100%',
    position: 'absolute',
    bottom: 150,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  piepayPriceContainer: {
    marginLeft: 40,
  },
  piepayLabel: {
    fontSize: 16,
    color: '#2C2C2C',
    marginBottom: 4,
    fontWeight: '400',
  },
  piepayPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  discountContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  discountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  productImageContainer: {
    width: 50,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    objectFit: 'contain',
  },
  phoneEmoji: {
    fontSize: 24,
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 50,
    marginHorizontal: 40,
    marginTop: 16,
  },
  sliderTrack: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  sliderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2C',
    textAlign: 'center',
  },
  sliderButton: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: 52,
    height: 52,
    backgroundColor: '#F5D971',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sliderArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
});

export default PiePayComparison;
