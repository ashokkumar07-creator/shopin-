
async function sendTelegramOrder(order) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error("Telegram configuration missing");
  }

  const items = Array.isArray(order.items) ? order.items : [];

  const itemLines = items.map(item => {
    const qty = Number(item.qty || 0);
    const price = Number(item.price || 0);

    return `${item.name} x ${qty} - Rs.${price * qty}`;
  }).join("\n");

  const total = Number(order.finalTotal ?? order.total ?? 0);

  const message = [
    "🔔 PRIYA KAMBU KOOL - NEW ORDER",
    "",
    `Order ID: ${order.id}`,
    `Customer: ${order.customer?.name || "Unknown"}`,
    `Phone: ${order.customer?.phone || "Not provided"}`,
    "",
    "ORDER ITEMS:",
    itemLines || "No items",
    "",
    `Order Type: ${order.fulfillment === "takeaway" ? "Takeaway" : "Dine in"}`,
    `Payment: ${order.payment || "Not specified"}`,
    `Packing Charge: Rs.${Number(order.packing || 0)}`,
    "",
    `TOTAL: Rs.${total}`,
    "",
    "Please check the Admin Dashboard."
  ].join("\n");

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    }
  );

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.description || "Telegram send failed");
  }

  return result;
}

module.exports = { sendTelegramOrder };
