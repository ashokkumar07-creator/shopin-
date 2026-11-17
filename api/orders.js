
const { json } = require('./_shared');
const { sendTelegramOrder } = require('./_telegram');

module.exports = async (req, res) => {

  // GET ALL ORDERS
  if (req.method === 'GET') {
    try {
      const rows = await json(
        'orders?select=data&order=created_at.asc',
        { method: 'GET' }
      );

      return res.status(200).json(
        rows.map(row => row.data)
      );

    } catch (error) {
      console.error('GET orders error:', error.message);

      return res.status(500).json({
        error: error.message
      });
    }
  }

  // CREATE NEW ORDER
  if (req.method === 'POST') {
    try {
      const order = req.body;

      // Validate order
      if (
        !order?.id ||
        !order.customer?.name ||
        !order.customer?.phone ||
        !Array.isArray(order.items) ||
        !order.items.length
      ) {
        return res.status(400).json({
          error: 'Incomplete order'
        });
      }

      // Save to Supabase
      const rows = await json(
        'orders?on_conflict=id',
        {
          method: 'POST',
          headers: {
            Prefer: 'resolution=ignore-duplicates,return=representation'
          },
          body: [
            {
              id: order.id,
              data: order
            }
          ]
        }
      );

      // Telegram notification for newly inserted orders
      if (Array.isArray(rows) && rows.length > 0) {
        try {
          await sendTelegramOrder(order);

          console.log(
            'Telegram notification sent:',
            order.id
          );

        } catch (telegramError) {
          console.error(
            'Telegram notification failed:',
            telegramError.message
          );
        }
      }

      // Return saved order
      return res.status(201).json(order);

    } catch (error) {
      console.error('POST orders error:', error.message);

      return res.status(500).json({
        error: error.message
      });
    }
  }

  // METHOD NOT ALLOWED
  res.setHeader('Allow', 'GET, POST');

  return res.status(405).json({
    error: 'Method not allowed'
  });
};
