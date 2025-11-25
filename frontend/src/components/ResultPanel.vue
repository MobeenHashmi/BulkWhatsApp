<template>
  <div class="module module--results">
    <div class="module__header">
      <span class="step-pill">Step 3</span>
      <div>
        <h2>Results</h2>
        <p class="muted">Track delivery feedback in real time.</p>
      </div>
    </div>

    <div v-if="results.length === 0" class="empty-state">
      <p>No results yet. Send a campaign to see delivery logs.</p>
    </div>

    <div v-else-if="results.length === 1" class="results-grid">
      <article class="result-card">
        <header>
          <p class="muted">Record #1</p>
          <span class="status-chip" :data-status="results[0].status || 'info'">
            {{ (results[0].status || "info").replace("_", " ") }}
          </span>
        </header>
        <pre>{{ formatResult(results[0]) }}</pre>
      </article>
    </div>

    <div v-else class="slider">
      <button class="slider__control" @click="prevSlide" aria-label="Previous result">
        ‹
      </button>

      <article class="result-card slider__card">
        <header>
          <p class="muted">Record #{{ activeIndex + 1 }} of {{ results.length }}</p>
          <span class="status-chip" :data-status="activeResult.status || 'info'">
            {{ (activeResult.status || "info").replace("_", " ") }}
          </span>
        </header>
        <pre>{{ formatResult(activeResult) }}</pre>
      </article>

      <button class="slider__control" @click="nextSlide" aria-label="Next result">
        ›
      </button>

      <div class="slider__dots">
        <button 
          v-for="(_, idx) in results" 
          :key="idx" 
          class="slider__dot" 
          :class="{ 'slider__dot--active': idx === activeIndex }"
          @click="goToSlide(idx)"
          :aria-label="`Go to record ${idx + 1}`"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["results"],
  data() {
    return {
      activeIndex: 0
    };
  },
  computed: {
    activeResult() {
      return this.results[this.activeIndex] || {};
    }
  },
  watch: {
    results: {
      handler(newResults) {
        if (this.activeIndex >= newResults.length) {
          this.activeIndex = Math.max(0, newResults.length - 1);
        }
      },
      immediate: true
    }
  },
  methods: {
    formatResult(result) {
      if (typeof result === "string") {
        return result;
      }

      try {
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return String(result);
      }
    },
    nextSlide() {
      this.activeIndex = (this.activeIndex + 1) % this.results.length;
    },
    prevSlide() {
      this.activeIndex =
        (this.activeIndex - 1 + this.results.length) % this.results.length;
    },
    goToSlide(index) {
      this.activeIndex = index;
    }
  }
};
</script>
