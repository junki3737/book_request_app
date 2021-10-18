<template>
  <div id="app">
    <div class="pl-5 pt-3 text-left text-3xl">
      <h1>蔵書検索サイト</h1>
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      activeIndex: this.$route.name,
    }
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
}
</style>
