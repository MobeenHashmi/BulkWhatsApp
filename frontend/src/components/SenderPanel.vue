<template>
  <div class="module">
    <div class="module__header">
      <span class="step-pill">Step 2</span>
      <div>
        <h2>Configure campaign</h2>
        <p class="muted">Set the template and language before sending.</p>
      </div>
    </div>

    <label class="field">
      <span>Template name</span>
      <input v-model="template" placeholder="eg. Internal_Marketing" />
    </label>

    <label class="field">
      <span>Language code</span>
      <input v-model="language" placeholder="en_US" />
    </label>

    <button 
      class="primary-btn" 
      @click="sendMessages" 
      :disabled="loading || numbers.length === 0"
    >
      {{ loading ? "Sending..." : "Send bulk messages" }}
    </button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: {
    numbers: {
      type: Array,
      default: () => []
    }
  },
  emits: ["sent", "result", "progress", "sending"],

  data() {
    return {
      template: "",
      language: "en_US",
      loading: false,
      bufferedResults: []
    };
  },

  methods: {
    async sendMessages() {
      if (this.numbers.length === 0 || this.loading) return;

      this.loading = true;
      this.bufferedResults = [];
      this.$emit("sending", true);
      this.$emit("progress", this.numbers.length);

      try {
        await this.streamMessages();
        this.$emit("sent", [...this.bufferedResults]);
      } catch (err) {
        console.error("Streaming send failed, falling back", err);
        try {
          await this.legacySend();
          this.$emit("sent", [...this.bufferedResults]);
        } catch (legacyError) {
          console.error("Send failed", legacyError);
          this.$emit("sent", [
            {
              status: "error",
              detail: legacyError?.message || legacyError
            }
          ]);
        }
      } finally {
        this.loading = false;
        this.$emit("sending", false);
      }
    },

    async streamMessages() {
      const response = await fetch(
        "http://localhost:5000/api/whatsapp/send-bulk/stream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            numbers: this.numbers,
            template_name: this.template,
            language_code: this.language
          })
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Unable to start streaming response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processBuffer = () => {
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const chunk = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 2);

          if (chunk.startsWith("data:")) {
            const payloadRaw = chunk.replace(/^data:\s*/, "");
            if (payloadRaw) {
              let payload;
              try {
                payload = JSON.parse(payloadRaw);
              } catch (parseError) {
                console.error("Failed to parse stream payload", parseError);
                continue;
              }
              if (payload.error) throw new Error(payload.error);
              if (typeof payload.remaining === "number") {
                this.$emit("progress", payload.remaining);
              }
              if (payload.result) {
                this.bufferedResults.push(payload.result);
                this.$emit("result", payload.result);
              }
              if (payload.done) {
                return;
              }
            }
          }

          boundary = buffer.indexOf("\n\n");
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          processBuffer();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        processBuffer();
      }
    },

    async legacySend() {
      const response = await axios.post(
        "http://localhost:5000/api/whatsapp/send-bulk",
        {
          numbers: this.numbers,
          template_name: this.template,
          language_code: this.language
        }
      );

      const data = Array.isArray(response.data) ? response.data : [response.data];
      this.bufferedResults.push(...data);
      data.forEach(item => this.$emit("result", item));
      this.$emit("progress", 0);
    }
  }
};
</script>
