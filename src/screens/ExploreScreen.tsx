// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Background from '../components/Background';
import SearchBar from '../components/SearchBar';
import EcomTile from '../components/EcomTile';
import LatestPurchasesTile from '../components/LatestPurchasesTile';
import PiePayComparison from '../components/PiePayComparison.tsx';

// ---------- mock data ---------- //
const MOCK_MERCHANTS = [
  {
    id: 'flipkart',
    name: 'Flipkart',
    logoUrl:
      'https://bugbasev1.blob.core.windows.net/public/programs/flipkart-nyd/7ae67f2fd71b273481efa7316e4cf0c9d7ba7323/profile/1723544173323-hdflipkartroundlogoicontransparentpng701751694966204grvmunpzzfremovebgpreview.png',
    websiteUrl: 'https://www.flipkart.com',
    categories: [
      {
        title: 'Mobiles',
        imageUrl: 'https://m.media-amazon.com/images/I/61BGE6iu4AL._AC_UY218_.jpg',
        productPageUrl: 'https://www.flipkart.com/mobile-phones-store',
      },
      {
        title: 'Fashion',
        imageUrl:
          'https://photo-cdn2.icons8.com/5-TM0TBn2MG_IrbA7Pn5I9ZbCV2t8i-WmyZNh6m3nKE/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvNzkzLzhhMTIw/Mjg5LWIyMmItNGI1/Yy05ZWQzLWZlZDVh/YzE0MDRjZC5qcGc.webp',
        productPageUrl: 'https://www.flipkart.com/clothing/pr?sid=2oq',
      },
      {
        title: 'Electronics',
        imageUrl: 'https://img.icons8.com/fluency/96/000000/laptop.png',
        productPageUrl:
          'https://www.flipkart.com/flipkart-electronics-new-store',
      },
      {
        title: 'Home',
        imageUrl: 'https://img.icons8.com/fluency/96/000000/sofa.png',
        productPageUrl: 'https://www.flipkart.com/furniture-store',
      },
      {
        title: 'Beauty',
        imageUrl:
          'https://photo-cdn2.icons8.com/4vvSfsIqLqnZk9FRQx-5gU4hNZ8PMElu0ufJB63oEQY/rs:fit:576:385/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5h/c3NldHMvYXNzZXRz/L3NhdGEvb3JpZ2lu/YWwvNDMyL2MwZDhi/NWI5LTFmZmItNGNh/Yy05YTg0LTY3NGRi/ZjQxZTFkYS5qcGc.webp',
        productPageUrl:
          'https://www.flipkart.com/beauty-and-personal-care/pr?sid=t06',
      },
      {
        title: 'Toys',
        imageUrl: 'https://img.icons8.com/fluency/96/000000/teddy-bear.png',
        productPageUrl: 'https://www.flipkart.com/toys-online-store',
      },
    ],
  },
];

const MOCK_PRODUCTS = [
  {
    id: 1,
    title: 'iPhone 14',
    imageUrl: 'https://m.media-amazon.com/images/I/61BGE6iu4AL._AC_UY218_.jpg',
    price: 79999,
    productPageUrl:
      'https://www.flipkart.com/apple-iphone-14-starlight-128-gb/p/itm3485a56f6e676?pid=MOBGHWFHABH3G73H',
  },
  {
    id: 2,
    title: 'Nike Sneakers',
    imageUrl:
      'https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/44f222ab-96b6-43b9-82e7-9a1bd888611d/NIKE+COURT+VISION+LO.png',
    price: 4599,
    productPageUrl:
      'https://www.flipkart.com/nike-blazer-low-platform-sneakers-women/p/itm23e5c1871e94d?pid=SHOGTHZ23WDFHHYM',
  },
  {
    id: 3,
    title: 'Dell Laptop',
    imageUrl:
      'https://5.imimg.com/data5/ND/GA/MY-44419499/dell-mini-laptop.jpg',
    price: 55999,
    productPageUrl:
      'https://www.flipkart.com/dell-latitude-3440-2024-intel-core-i3-12th-gen-1215u-8-gb-512-gb-ssd-windows-11-pro-business-laptop/p/itm7f265faf0871e?pid=COMH5G3F8BGPNY9N',
  },
  {
    id: 4,
    title: 'Wrist Watch',
    imageUrl:
      'https://www.vaerwatches.com/cdn/shop/files/38-wristWrist-Shot-Lime.jpg?v=1712715073&width=600',
    price: 2499,
    productPageUrl:
      'https://www.flipkart.com/lorenz-mk-4087r-date-dial-analog-watch-blue-magnetic-lock-strap-men/p/itm50682d1116646?pid=WATGZDGQF8GYFA5Y',
  },
];

const ExploreScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [webUri, setWebUri] = useState(null);
  const [piePayTitle, setPiePayTitle] = useState(null);

  const webViewRef = useRef(null);

  const onSubmitSearch = () => {
    setWebUri('https://www.flipkart.com/search?q=' + searchQuery);
    setSearchQuery('');
  };

  const _ = Array.from({ length: 2000000 }, (_, i) => i * Math.random()).sort(
    (a, b) => b - a,
  );

  useEffect(() => {
    if (!webUri) {
      setPiePayTitle(null);
    }

    const backAction = () => {
      if (webUri) {
        setWebUri(null); // close modal
        return true; // prevent default back navigation
      }
      return false; // allow normal back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [webUri]);

  const injectedJavaScript = `
    const scraper = () => {
      try {
        setTimeout(() => {
          const data = {};
          
          const titleElement = document.querySelector('h1 span');
          data.productTitle = titleElement ? titleElement.innerText.trim() : '';
         
          const discountElement = document.querySelectorAll('.css-1rynq56.r-173mn98');
          data.wowDealPrice = discountElement && discountElement.length > 1 ? discountElement[1].innerText.trim() : '';

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'SCRAPED_DATA',
            data: data
          }));
          
        }, 3000); // Wait 3 seconds for dynamic content to load
        
      } catch (error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'ERROR',
          error: error.message
        }));
      }
    };

    scraper();
    window.onload = () => scraper();
    true; // This is required
  `;

  function convertProductData(product) {
    const numericPrice = parseInt(
      product.wowDealPrice.replace(/[^0-9]/g, ''),
      10,
    );

    return {
      productTitle: product.productTitle,
      wowDealPrice: numericPrice,
    };
  }

  const handleMessage = async event => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === 'SCRAPED_DATA') {
        const data = convertProductData(message.data);
        const response = await fetch('http://localhost:3000/api/prices', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          setPiePayTitle(data.productTitle);
        }
      } else if (message.type === 'ERROR') {
        console.error('Scraping error:', message.error);
      }
    } catch (error) {
      console.error('Message parsing error:', error);
    }
  };

  return (
    <Background>
      {/* Header Section */}
      <HeaderSection />

      {/* Searchbar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search products, categories, ..."
        onSubmit={onSubmitSearch}
      />

      {/* Merchants Section */}
      {MOCK_MERCHANTS.map(merchant => (
        <EcomTile key={merchant.id} merchant={merchant} setWebUri={setWebUri} />
      ))}

      {/* Latest purchases */}
      <LatestPurchasesTile
        products={products}
        onRemove={id => {
          const index = products.findIndex(p => p.id === id);
          if (index !== -1) {
            const newList = [...products];
            newList.splice(index, 1);
            setProducts(newList);
          }
        }}
        setWebUri={setWebUri}
      />

      {/* WebView modal */}
      <Modal
        visible={!!webUri}
        animationType="slide"
        onRequestClose={() => setWebUri(null)}
      >
        <View style={{ flex: 1 }}>
          <Pressable style={styles.closeBtn} onPress={() => setWebUri(null)}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          {webUri && (
            <WebView
              ref={webViewRef}
              source={{ uri: webUri }}
              injectedJavaScript={injectedJavaScript}
              onMessage={handleMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              onNavigationStateChange={() => {
                webViewRef.current.injectJavaScript(injectedJavaScript);
              }}
              userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36"
            />
          )}
          {piePayTitle && <PiePayComparison title={piePayTitle} />}
        </View>
      </Modal>
    </Background>
  );
};

export default ExploreScreen;

// ---------------- internal components ---------------- //
const HeaderSection = () => {
  return (
    <View style={headerStyles.container}>
      <Text style={headerStyles.welcomeText}>Welcome!</Text>
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  walletBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: '#F1F1F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
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
