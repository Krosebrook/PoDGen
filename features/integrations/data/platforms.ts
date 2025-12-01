
export interface IntegrationTemplateParams {
  prompt: string;
  imageBase64: string | null;
  mimeType: string;
  webhookUrl?: string;
}

export interface IntegrationPlatform {
  id: string;
  name: string;
  icon: string;
  template: (params: IntegrationTemplateParams) => string;
}

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
