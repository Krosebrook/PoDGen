import { MerchProduct, IntegrationPlatform } from '../types';

export const MERCH_PRODUCTS: MerchProduct[] = [
  { 
    id: 'tshirt-white', 
    name: 'Classic White Tee', 
    description: 'Cotton crew neck', 
    placeholderImage: 'https://placehold.co/400x400/1e293b/ffffff?text=T-Shirt',
    defaultPrompt: 'A {style_preference} product photography shot of a plain white t-shirt lying flat on a minimalist concrete surface, featuring this logo printed clearly on the chest.' 
  },
  { 
    id: 'tshirt-graphic', 
    name: 'Graphic T-Shirt', 
    description: 'Premium cotton graphic tee', 
    placeholderImage: 'https://placehold.co/400x400/1e293b/ffffff?text=Graphic+T-Shirt',
    defaultPrompt: 'A {style_preference} studio shot of a classic fit graphic t-shirt with a bold design on the front, featuring this logo prominently.' 
  },
  { 
    id: 'hoodie-black', 
    name: 'Streetwear Hoodie', 
    description: 'Black oversized hoodie', 
    placeholderImage: 'https://placehold.co/400x400/1e293b/ffffff?text=Hoodie',
    defaultPrompt: 'A {style_preference} studio photo of a black streetwear hoodie on a mannequin, with this logo prominently displayed on the center chest area. Cinematic lighting.' 
  },
  { 
    id: 'mug-ceramic', 
    name: 'Ceramic Mug', 
    description: 'White glossy finish', 
    placeholderImage: 'https://placehold.co/400x400/1e293b/ffffff?text=Mug',
    defaultPrompt: 'A {style_preference} lifestyle photography shot of a white ceramic coffee mug on a wooden table next to a book, with this logo printed on the side of the mug.' 
  },
  { 
    id: 'tote-bag', 
    name: 'Canvas Tote', 
    description: 'Eco-friendly beige tote', 
    placeholderImage: 'https://placehold.co/400x400/1e293b/ffffff?text=Tote+Bag',
    defaultPrompt: 'A {style_preference} studio shot of a beige canvas tote bag hanging on a hook, with this logo design centered on the bag fabric.' 
  },
  {
    id: 'cap-baseball',
    name: 'Baseball Cap',
    description: 'Navy blue structured cap',
    placeholderImage: 'https://placehold.co/400x400/1e293b/ffffff?text=Cap',
    defaultPrompt: 'A {style_preference} closeup of a navy blue baseball cap sitting on a shelf, with this logo embroidered on the front panel.'
  },
  {
    id: 'phone-case',
    name: 'Phone Case',
    description: 'Slim protective case',
    placeholderImage: 'https://placehold.co/400x400/1e293b/ffffff?text=Phone+Case',
    defaultPrompt: 'A {style_preference} product shot of a modern smartphone case lying on a marble countertop, with this logo design printed on the back of the case.'
  },
  {
    id: 'sticker-pack',
    name: 'Sticker Pack',
    description: 'Die-cut vinyl stickers',
    placeholderImage: 'https://placehold.co/400x400/1e293b/ffffff?text=Stickers',
    defaultPrompt: 'A {style_preference} flat lay photography shot of die-cut vinyl stickers scattered on a laptop lid, featuring this logo as the main sticker design with a white border.'
  },
  {
    id: 'mug-travel',
    name: 'Travel Tumbler',
    description: 'Stainless steel coffee cup',
    placeholderImage: 'https://placehold.co/400x400/1e293b/ffffff?text=Tumbler',
    defaultPrompt: 'A {style_preference} lifestyle shot of a matte black stainless steel travel coffee tumbler sitting on an office desk, with this logo laser-etched onto the side.'
  },
  {
    id: 'laptop-sleeve',
    name: 'Laptop Sleeve',
    description: 'Protective laptop sleeve',
    placeholderImage: 'https://placehold.co/400x400/1e293b/ffffff?text=Laptop+Sleeve',
    defaultPrompt: 'A {style_preference} product shot of a protective laptop sleeve featuring customizable full-print designs with this logo centered on the fabric.'
  },
  {
    id: 'canvas-print',
    name: 'Canvas Print',
    description: 'Wall-mounted canvas',
    placeholderImage: 'https://placehold.co/400x400/1e293b/ffffff?text=Canvas+Print',
    defaultPrompt: 'A {style_preference} interior design shot of a wall-mounted canvas print ideal for digital artwork and photos, displaying this logo art in a modern living room.'
  },
  {
    id: 'beanie',
    name: 'Beanie',
    description: 'Comfortable beanie hat',
    placeholderImage: 'https://placehold.co/400x400/1e293b/ffffff?text=Beanie',
    defaultPrompt: 'A {style_preference} closeup of a comfortable beanie hat, perfect for embroidery, with this logo stitched onto the folded cuff.'
  }
];

export const INTEGRATION_PLATFORMS: IntegrationPlatform[] = [
  {
    id: 'curl',
    name: 'cURL / Shell',
    icon: 'Terminal',
    template: ({ prompt, mimeType }) => `curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=$API_KEY" \\
-H 'Content-Type: application/json' \\
-d '{
  "contents": [{
    "parts": [
      {"text": "${prompt}"},
      {"inline_data": {
        "mime_type": "${mimeType}",
        "data": "BASE64_IMAGE_DATA"
      }}
    ]
  }]
}'`
  },
  {
    id: 'nodejs',
    name: 'Node.js (Google GenAI SDK)',
    icon: 'Code2',
    template: ({ prompt, mimeType }) => `import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function generateMockup() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { mimeType: '${mimeType}', data: base64ImageString } },
        { text: '${prompt}' }
      ]
    }
  });
  
  console.log(response.text);
}`
  },
  {
    id: 'python',
    name: 'Python',
    icon: 'Code2',
    template: ({ prompt, mimeType }) => `import os
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["API_KEY"])

response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=[
        types.Part.from_bytes(image_bytes, "${mimeType}"),
        "${prompt}"
    ]
)

print(response.text)`
  },
  {
    id: 'discord',
    name: 'Discord Webhook',
    icon: 'Share2',
    template: ({ prompt, webhookUrl }) => `const DISCORD_WEBHOOK_URL = "${webhookUrl || 'YOUR_WEBHOOK_URL'}";

// Assuming 'imageUrl' is the result from Gemini API
async function postToDiscord(imageUrl) {
  await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: "New Merch Design Generated! 🎨",
      embeds: [{
        title: "Prompt: ${prompt.substring(0, 50)}...",
        image: { url: imageUrl },
        color: 5814783
      }]
    })
  });
}`
  },
  {
    id: 'rest-api',
    name: 'Generic REST API',
    icon: 'Share2',
    template: ({ prompt, webhookUrl, mimeType }) => `const API_ENDPOINT = "${webhookUrl || 'https://api.yourdomain.com/v1/assets'}";

async function sendToBackend(imageUrl) {
  // Example: Sending the generated URL and metadata to your backend
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_TOKEN'
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: "${prompt.replace(/"/g, '\\"')}",
        format: "${mimeType}",
        generated_at: new Date().toISOString()
      })
    });

    if (!response.ok) throw new Error('API request failed');
    const result = await response.json();
    console.log('Asset saved:', result.id);
  } catch (error) {
    console.error('Error syncing to backend:', error);
  }
}`
  },
  {
    id: 'aws-s3',
    name: 'AWS S3 Upload',
    icon: 'Code2',
    template: ({ mimeType }) => `import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 Client
const s3 = new S3Client({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function uploadAsset(imageBuffer, fileName) {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: \`merch/\${fileName}\`,
      Body: imageBuffer,
      ContentType: '${mimeType}'
    });

    await s3.send(command);
    console.log(\`Successfully uploaded \${fileName} to S3\`);
  } catch (err) {
    console.error("Upload failed", err);
  }
}`
  }
];

export const MIME_TYPES = [
  { value: 'image/png', label: 'PNG Image' },
  { value: 'image/jpeg', label: 'JPEG Image' },
  { value: 'image/webp', label: 'WebP Image' },
  { value: 'image/heic', label: 'HEIC Image' },
];