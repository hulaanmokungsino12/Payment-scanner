const express = require('express');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

const app = express();

// Use the public/anon key only to verify user access tokens. Never put the
// Supabase service-role key in this server configuration.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabaseAuthConfigured = Boolean(supabaseUrl && supabaseAnonKey);

async function requireSupabaseAuth(req, res, next) {
  if (!supabaseAuthConfigured) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variable');
    return res.status(503).json({
      success: false,
      message: 'Authentication service is not configured.',
    });
  }

  const authorization = req.get('authorization') || '';
  const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);

  if (!tokenMatch) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in and try again.',
    });
  }

  try {
    // Ask Supabase Auth to validate the token; do not trust a decoded JWT alone.
    const verificationResponse = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${tokenMatch[1]}`,
      },
    });

    const verifiedUser = verificationResponse.ok
      ? await verificationResponse.json()
      : null;

    if (!verifiedUser?.id) {
      return res.status(401).json({
        success: false,
        message: 'Your login session is invalid or expired. Please log in again.',
      });
    }

    req.authenticatedUser = verifiedUser;
    return next();
  } catch (error) {
    console.error('Supabase token verification failed:', error.message);
    return res.status(503).json({
      success: false,
      message: 'Unable to verify your login right now. Please try again.',
    });
  }
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post('/scan', requireSupabaseAuth, express.json({ limit: '20mb' }), async (req, res) => {
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

==================================================
IMPORTANT CUSTOMER RULES
==================================================

1. Identify every separate customer in the image.

2. Each customer MUST be a separate object in the output.

3. DO NOT combine different customers into one customer.

4. Keep each customer's orders attached ONLY to that customer.

5. Each customer may have multiple ordered items.

6. Each customer may have a different payment method.

7. If a customer's payment method is not visible, use an empty string.

8. If a customer's name is not visible, use an empty string.

9. If an order quantity is not visible, use 1 if it is reasonably clear that the item was ordered; otherwise use 0.

10. Ignore unrelated text that is not part of an order.

11. Preserve the customer name as accurately as possible.

12. Return ALL customers found in the image.

==================================================
OFFICIAL MENU
==================================================

These are the official products available.

Use these product names when returning the "item" field.

1. Beef Smash Burger — ₱70

2. Beef Cheese Burger — ₱80

3. Puto — ₱12

4. Ube Cheese Champorado — ₱55

5. Freshly Baked Tuna Sushi — ₱80

6. Baked Tuna Sushi Combo — ₱115

7. Beef Nachos with Veggies — ₱80

8. Beef Nachos Combo — ₱95

9. Cucumber Lemonade — ₱25

10. Pork Mami Overload — ₱65

11. Pork Mami Overload with Egg — ₱70

12. Potato Wedges — ₱45

13. Beef Smash Burger with Lemonade — ₱85

14. Beef Smash Burger with Potato Wedges — ₱110

15. Beef Smash Burger with Potato Wedges and Lemonade — ₱120

16. Lumpianada — ₱60

17. Lumpianada Combo — ₱75

18. Seaweed — ₱20 per pack OR 3 packs for ₱50

19. Combo — ₱115

The "Combo" product contains:

- 1 tub Baked Tuna Sushi
- 1 Seaweed
- 1 Cucumber Lemonade

==================================================
PRODUCT NORMALIZATION
==================================================

Customers do NOT have to use the exact official product name.

Understand natural language, abbreviations, spelling mistakes, missing words, shorthand, and common variations.

Your job is to understand what the customer means and map the order to the correct official product.

Examples:

"puto cheese"
→ Puto

"cheesy puto"
→ Puto

"puto w cheese"
→ Puto

"puto with cheese"
→ Puto

"beef burger"
→ Beef Smash Burger

"burger"
→ Beef Smash Burger

"smash burger"
→ Beef Smash Burger

"cheese burger"
→ Beef Cheese Burger

"beef cheese burger"
→ Beef Cheese Burger

"burger with lemonade"
→ Beef Smash Burger with Lemonade

"smash burger + lemonade"
→ Beef Smash Burger with Lemonade

"burger lemonade"
→ Beef Smash Burger with Lemonade

"burger with wedges"
→ Beef Smash Burger with Potato Wedges

"smash burger + potato wedges"
→ Beef Smash Burger with Potato Wedges

"burger wedges"
→ Beef Smash Burger with Potato Wedges

"burger wedges lemonade"
→ Beef Smash Burger with Potato Wedges and Lemonade

"burger + wedges + lemonade"
→ Beef Smash Burger with Potato Wedges and Lemonade

"smash burger potato wedges and lemonade"
→ Beef Smash Burger with Potato Wedges and Lemonade

"tuna sushi"
→ Freshly Baked Tuna Sushi

"baked tuna"
→ Freshly Baked Tuna Sushi

"fresh tuna sushi"
→ Freshly Baked Tuna Sushi

"tuna sushi combo"
→ Baked Tuna Sushi Combo

"baked tuna sushi combo"
→ Baked Tuna Sushi Combo

"nachos"
→ Beef Nachos with Veggies

"beef nachos"
→ Beef Nachos with Veggies

"nachos with veggies"
→ Beef Nachos with Veggies

"nachos combo"
→ Beef Nachos Combo

"beef nachos combo"
→ Beef Nachos Combo

"lemonade"
→ Cucumber Lemonade

"cucumber lemonade"
→ Cucumber Lemonade

"cucumber lemon"
→ Cucumber Lemonade

"mami"
→ Pork Mami Overload

"pork mami"
→ Pork Mami Overload

"mami overload"
→ Pork Mami Overload

"mami with egg"
→ Pork Mami Overload with Egg

"pork mami with egg"
→ Pork Mami Overload with Egg

"potato"
→ Potato Wedges

"potato wedges"
→ Potato Wedges

"wedges"
→ Potato Wedges

"lumpia"
→ Lumpianada

"lumpianada"
→ Lumpianada

"lumpianada + lemonade"
→ Lumpianada Combo

"lumpia + cucumber lemonade"
→ Lumpianada Combo

"lumpia combo"
→ Lumpianada Combo

"seaweed"
→ Seaweed

"seaweed pack"
→ Seaweed

"seaweed packs"
→ Seaweed

"3 seaweed"
→ Seaweed with quantity 3

"3 packs seaweed"
→ Seaweed with quantity 3

"combo"
→ Combo

==================================================
CHEESE RULE
==================================================

Some products can have cheese added.

IMPORTANT:

The cheese modifier is ONLY an additional modifier.

Do NOT create a new product name for the cheese version.

For example:

"burger with lemonade with cheese"

must become:

{
  "item": "Beef Smash Burger with Lemonade",
  "quantity": 1,
  "cheese": true
}

NOT:

"Cheese Burger with Lemonade"

--------------------------------------------------
BEEF SMASH BURGER WITH LEMONADE
--------------------------------------------------

Normal product:

Beef Smash Burger with Lemonade — ₱85

Examples:

"burger lemonade"
→ item = "Beef Smash Burger with Lemonade"
→ cheese = false

"burger lemonade with cheese"
→ item = "Beef Smash Burger with Lemonade"
→ cheese = true

"smash burger + lemonade + cheese"
→ item = "Beef Smash Burger with Lemonade"
→ cheese = true

"beef smash burger with lemonade with cheese"
→ item = "Beef Smash Burger with Lemonade"
→ cheese = true

The application will add ₱10 when cheese is true.

--------------------------------------------------
BEEF SMASH BURGER WITH POTATO WEDGES
--------------------------------------------------

Normal product:

Beef Smash Burger with Potato Wedges — ₱110

Examples:

"burger with wedges"
→ item = "Beef Smash Burger with Potato Wedges"
→ cheese = false

"burger wedges with cheese"
→ item = "Beef Smash Burger with Potato Wedges"
→ cheese = true

"smash burger + potato wedges + cheese"
→ item = "Beef Smash Burger with Potato Wedges"
→ cheese = true

The application will add ₱10 when cheese is true.

--------------------------------------------------
OTHER CHEESE ORDERS
--------------------------------------------------

If a customer writes:

"puto cheese"

return:

{
  "item": "Puto",
  "quantity": 1,
  "cheese": false
}

Do NOT set cheese=true for Puto because Puto already has cheese as part of the product/order description.

"Beef Cheese Burger" is a separate official product.

Therefore:

"cheese burger"
→ Beef Cheese Burger
→ cheese = false

==================================================
SEAWEED PRICING
==================================================

Seaweed has special quantity pricing:

1 pack = ₱20
2 packs = ₱40
3 packs = ₱50
4 packs = ₱70
5 packs = ₱90
6 packs = ₱100

Always return:

"Seaweed"

and put the number of packs in quantity.

Example:

"seaweed x3"

returns:

{
  "item": "Seaweed",
  "quantity": 3,
  "cheese": false
}

==================================================
COMBO RULE
==================================================

If the customer orders:

1 Baked Tuna Sushi
1 Seaweed
1 Cucumber Lemonade

and clearly describes this as the menu "Combo", return:

{
  "item": "Combo",
  "quantity": 1,
  "cheese": false
}

The official Combo price is ₱115.

Do not split this into three separate products if the customer clearly ordered the Combo.

==================================================
QUANTITY RULES
==================================================

Understand common quantity formats such as:

x2
x 2
2x
2 pcs
2 pieces
2 packs
2 tubs
qty 2
quantity 2
2

Examples:

"burger x2"
→ quantity = 2

"2 burgers"
→ quantity = 2

"seaweed 3 packs"
→ quantity = 3

"mami x2"
→ quantity = 2

If quantity is not visible but it is reasonably clear that the item was ordered:

quantity = 1

==================================================
IMPORTANT OUTPUT RULES
==================================================

1. DO NOT invent new product names.

2. DO NOT return customer-specific descriptions as product names.

3. DO NOT create combinations that are not part of the official menu.

4. Normalize customer wording to the closest official product.

5. Preserve the actual quantity ordered.

6. Preserve whether cheese was explicitly requested using the "cheese" field.

7. For products without a cheese modifier, use cheese = false.

8. If an item cannot confidently be matched to an official menu item, return the customer's original item wording rather than inventing a product.

9. Return ONLY the JSON array.

==================================================
OUTPUT FORMAT
==================================================

Every order MUST contain:

- item
- quantity
- cheese

Example:

[
  {
    "customer": "Juan Dela Cruz",
    "orders": [
      {
        "item": "Puto",
        "quantity": 3,
        "cheese": false
      },
      {
        "item": "Beef Smash Burger with Lemonade",
        "quantity": 1,
        "cheese": true
      },
      {
        "item": "Seaweed",
        "quantity": 3,
        "cheese": false
      }
    ],
    "payment": "GCash"
  }
]

Another example:

[
  {
    "customer": "Maria Santos",
    "orders": [
      {
        "item": "Beef Smash Burger with Potato Wedges",
        "quantity": 2,
        "cheese": true
      },
      {
        "item": "Pork Mami Overload with Egg",
        "quantity": 1,
        "cheese": false
      }
    ],
    "payment": "Cash"
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

                    cheese: {
                      type: 'boolean',
                    },
                  },

                  required: [
                    'item',
                    'quantity',
                    'cheese',
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