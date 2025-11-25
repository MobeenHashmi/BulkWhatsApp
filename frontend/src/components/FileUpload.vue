<template>
  <div class="module module--upload">
    <div class="module__header">
      <span class="step-pill">Step 1</span>
      <div>
        <h2>Upload recipients</h2>
        <p class="muted">TXT file · one number per line</p>
      </div>
    </div>

    <label class="upload-zone">
      <input type="file" @change="loadFile" />
      <div>
        <strong>Drag & drop or click to browse</strong>
        <p class="muted">We never store your files.</p>
      </div>
    </label>

    <div class="module__stats module__stats--grid">
      <div>
        <p class="muted">Total numbers loaded</p>
        <p class="stat-value">{{ total }}</p>
      </div>
      <div v-if="remaining < total">
        <p class="muted">Sending messages, please wait…</p>
        <p class="stat-value">{{ remaining }}</p>
      </div>
    </div>

    <div class="progress" :data-active="isSending">
      <div class="progress__bar" :style="{ width: progressPercent + '%' }"></div>
    </div>
    <p class="muted" v-if="isSending">Sending in progress — counting down live.</p>
  </div>
</template>

<script>
export default {
  emits: ["numbers-loaded"],
  props: {
    total: {
      type: Number,
      default: 0
    },
    remaining: {
      type: Number,
      default: 0
    },
    isSending: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    progressPercent() {
      if (!this.total) return 0;
      const sent = this.total - this.remaining;
      return Math.min(100, Math.max(0, (sent / this.total) * 100));
    }
  },
  methods: {
    loadFile(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = e => {
        const text = e.target.result;
        const list = text.split(/\r?\n/).filter(n => n.trim() !== "");

        this.$emit("numbers-loaded", list);
      };

      reader.readAsText(file);
    }
  }
};
</script>
