import { getCurrentDomain } from '@/helpers/helper';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

// @ts-ignore
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const Main = () => {
  const [multiplier, setMultiplier] = useState(1);

  async function handleCheckout() {
    const stripe: any = await stripePromise;

    const res = await fetch('https://maverick.lille.ai/stripe/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          "line_items": [
            {
              "price_data": {
                "currency": 'inr',
                "product_data": {
                  "name": "Contribution"
                },
                "unit_amount": 500 * multiplier
              },
              "quantity": 1
            }
          ],
          "mode": "payment",
          "success_url": getCurrentDomain() + "?payment=true",
          "cancel_url": getCurrentDomain() + "/cancel"
        }
      ), // Multiply by the multiplier (e.g., 500 * 1 = $5, 500 * 2 = $10, etc.)
    });

    const session = await res.json();
    console.log(session);

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
  }

  return (
    <div className="flex flex-col items-center">
      <div className="my-4">
        <h2 className="text-xl">Price: ${500 * multiplier / 100}</h2>
      </div>
      <div className="flex space-x-2">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setMultiplier(1)}
        >
          1x
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setMultiplier(2)}
        >
          2x
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setMultiplier(3)}
        >
          3x
        </button>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
        onClick={handleCheckout}
      >
        Checkout
      </button>
    </div>
  );
};

export default Main;
