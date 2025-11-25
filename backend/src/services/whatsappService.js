import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.META_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;

async function sendTemplate(to, templateName, lang) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: lang }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    return { number: to, status: "sent", response: response.data };

  } catch (error) {
    return {
      number: to,
      status: "failed",
      error: error.response?.data || error.message
    };
  }
}

export async function sendBulkMessages(
  numbers,
  templateName,
  lang,
  onProgress
) {
  const results = [];

  for (let index = 0; index < numbers.length; index += 1) {
    const number = numbers[index];
    const result = await sendTemplate(number, templateName, lang);
    results.push(result);

    if (typeof onProgress === "function") {
      await onProgress({
        result,
        remaining: numbers.length - (index + 1)
      });
    }

    // Delay to prevent rate limits
    await new Promise(res => setTimeout(res, 0));
  }

  return results;
}
