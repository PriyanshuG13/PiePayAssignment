const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory database
interface ProductData {
  id: string;
  title: string;
  wowDealPrice: number | null;
}

const database: Record<string, ProductData> = {};

// Calculate savings percentage
const calculateSavings = (flipkartPrice: number, wowDealPrice: number | null): number => {
  if (!wowDealPrice) return 0;
  if (isNaN(wowDealPrice) || wowDealPrice >= flipkartPrice) return 0;
  return Math.round(((flipkartPrice - wowDealPrice) / flipkartPrice) * 100);
};

// POST /api/prices
app.post('/api/prices', (req: any, res: any) => {
  const { productTitle, wowDealPrice } = req.body;

  if (!productTitle) {
    return res.status(400).json({ error: 'productTitle is required' });
  }

  const sanitisedTitle = productTitle
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  database[sanitisedTitle] = { id: sanitisedTitle, title: productTitle, wowDealPrice };

  res.status(201).json({ message: 'Price data saved successfully' });
});

// GET /api/prices/:productTitle
app.get('/api/prices/:productTitle', (req: any, res: any) => {
  const productTitle = req.params.productTitle;
  const productData = database[productTitle];

  if (!productData) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const flipkartPrice = 200000;
  const wowDealPrice = productData.wowDealPrice || flipkartPrice.toString();
  const productImgUri = 'https://m.media-amazon.com/images/I/61BGE6iu4AL._AC_UY218_.jpg';
  const savingPercentage = calculateSavings(flipkartPrice, productData.wowDealPrice);

  res.json({
    flipkartPrice,
    wowDealPrice,
    productImgUri,
    savingPercentage
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});