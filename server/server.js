const express = require('express');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

const app = express();

app.use(express.json({ limit: '20mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post('/scan', async (req, res) => {
  console.log('Received scan request');

  const base64Image = req.body.image;

  if (!base64Image) {
    console.log('No image received');

    return res.status(400).json({
      success: false,
      message: 'No image received',
    });
  }

  console.log('Image received: YES');
  console.log('Base64 image size:', base64Image.length);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',

      contents: [
        {
          text: `
Look at this image of an order list, order sheet, or chat messages.

The image may contain ONE or MULTIPLE customers.

For EVERY customer you can identify, extract:

- customer: customer's name
- orders: every item ordered by that customer and its quantity
- payment: that customer's payment method, such as GCash or Cash

IMPORTANT RULES:

1. Identify every separate customer in the image.
2. Each customer must be a separate object in the output.
3. Do NOT combine different customers into one customer.
4. Keep each customer's orders attached only to that customer.
5. Each customer may have multiple ordered items.
6. Each customer may have a different payment method.
7. If a customer's payment method is not visible, use an empty string.
8. If a customer's name is not visible, use an empty string.
9. If an order quantity is not visible, use 1 if it is reasonably clear that the item was ordered; otherwise use 0.
10. Ignore unrelated text that is not part of an order.
11. Preserve the customer name as accurately as possible.
12. Return ALL customers found in the image.

For example, if the image contains:

Juan Dela Cruz
Burger x2
Puto x3
Payment: GCash

Maria Santos
Burger x1
Payment: Cash

Pedro Reyes
Puto x5
Payment: GCash

Return:

[
  {
    "customer": "Juan Dela Cruz",
    "orders": [
      {
        "item": "Burger",
        "quantity": 2
      },
      {
        "item": "Puto",
        "quantity": 3
      }
    ],
    "payment": "GCash"
  },
  {
    "customer": "Maria Santos",
    "orders": [
      {
        "item": "Burger",
        "quantity": 1
      }
    ],
    "payment": "Cash"
  },
  {
    "customer": "Pedro Reyes",
    "orders": [
      {
        "item": "Puto",
        "quantity": 5
      }
    ],
    "payment": "GCash"
  }
]

Return ONLY the JSON array.
          `,
        },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
      ],

      config: {
        responseMimeType: 'application/json',

        responseSchema: {
          type: 'array',

          items: {
            type: 'object',

            properties: {
              customer: {
                type: 'string',
              },

              orders: {
                type: 'array',

                items: {
                  type: 'object',

                  properties: {
                    item: {
                      type: 'string',
                    },

                    quantity: {
                      type: 'number',
                    },
                  },

                  required: [
                    'item',
                    'quantity',
                  ],
                },
              },

              payment: {
                type: 'string',
              },
            },

            required: [
              'customer',
              'orders',
              'payment',
            ],
          },
        },
      },
    });

    console.log(
      'Gemini response:',
      response.text
    );

    const results = JSON.parse(response.text);

    console.log(
      'Customers detected:',
      results.length
    );

    console.log(
      'Parsed results:',
      JSON.stringify(results, null, 2)
    );

    res.json({
      success: true,
      result: results,
    });

  } catch (error) {
    console.error(
      'Gemini error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Gemini processing failed',
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});