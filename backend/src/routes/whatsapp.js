import { Router } from "express";
import { sendBulkMessages } from "../services/whatsappService.js";

const router = Router();

router.post("/send-bulk", async (req, res) => {
  const { numbers, template_name, language_code } = req.body;

  if (!numbers || numbers.length === 0) {
    return res.status(400).json({ message: "No numbers received" });
  }

  const result = await sendBulkMessages(
    numbers,
    template_name,
    language_code
  );

  res.json(result);
});

router.post("/send-bulk/stream", async (req, res) => {
  const { numbers, template_name, language_code } = req.body;

  if (!numbers || numbers.length === 0) {
    return res.status(400).json({ message: "No numbers received" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const sendEvent = payload => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  sendEvent({ remaining: numbers.length, init: true });

  try {
    await sendBulkMessages(
      numbers,
      template_name,
      language_code,
      async progress => {
        sendEvent(progress);
      }
    );

    sendEvent({ done: true });
  } catch (error) {
    sendEvent({
      error: error.response?.data || error.message || "Send failed"
    });
  } finally {
    res.end();
  }
});

export default router;
