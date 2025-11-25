<template>
  <div class="app-shell">
    <header class="hero">
      <div>
        <p class="hero__eyebrow">WhatsApp Campaign Tool</p>
        <h1>Manage your bulk messaging workflow</h1>
        <p class="hero__copy">
          Upload audience lists, configure templates, and monitor delivery in a single, streamlined workspace.
        </p>
      </div>
      <div class="hero__badge">
        <span>{{ remainingNumbers }}</span>
        remaining of {{ totalNumbers }}
      </div>
    </header>

    <main class="workspace">
      <section class="panel accent">
        <FileUpload
          :total="totalNumbers"
          :remaining="remainingNumbers"
          :is-sending="isSending"
          @numbers-loaded="handleNumbersLoaded"
        />
      </section>

      <section class="panel">
        <SenderPanel
          :numbers="numbers"
          :is-sending="isSending"
          @result="handlePartialResult"
          @progress="handleProgress"
          @sent="handleSent"
          @sending="handleSendingState"
        />
      </section>

      <section class="panel panel--stretch">
        <ResultPanel :results="results" />
      </section>
    </main>
  </div>
</template>

<script>
import FileUpload from "./components/FileUpload.vue";
import SenderPanel from "./components/SenderPanel.vue";
import ResultPanel from "./components/ResultPanel.vue";

export default {
  components: { FileUpload, SenderPanel, ResultPanel },
  data() {
    return {
      numbers: [],
      results: [],
      totalNumbers: 0,
      remainingNumbers: 0,
      isSending: false
    };
  },
  methods: {
    handleNumbersLoaded(list) {
      this.numbers = list;
      this.totalNumbers = list.length;
      this.remainingNumbers = list.length;
      this.results = [];
    },
    handleProgress(remaining) {
      this.remainingNumbers = remaining;
    },
    handlePartialResult(result) {
      this.results = [...this.results, result];
    },
    handleSent(finalResults) {
      this.results = finalResults;
      this.remainingNumbers = 0;
      this.isSending = false;
    },
    handleSendingState(state) {
      this.isSending = state;
      if (state) {
        this.results = [];
        this.remainingNumbers = this.numbers.length;
      }
    }
  }
};
</script>
