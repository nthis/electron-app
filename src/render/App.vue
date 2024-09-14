<template>
 <Home></Home>
</template>

<script>
import Home from './pages/home/index.vue'
export default {
  name: 'App',
  components: {
    Home
  }
}
</script>

<style>
body{
  background: #F0F2F5 ;
}
body::-webkit-scrollbar {
  width: 4px;
}
body::-webkit-scrollbar-track {
  background-color: rgb(190, 180, 180,.5);
  -webkit-border-radius: 2em;
  -moz-border-radius: 2em;
  border-radius: 2em;
}
body::-webkit-scrollbar-thumb {
  background-color: rgb(190, 180, 180);
  -webkit-border-radius: 2em;
  -moz-border-radius: 2em;
  border-radius: 2em;
}
.app-box {
  padding-top: 14vh;
  display: flex;
  width: 100%;
  justify-content: center;
  margin-bottom: 29px;
}
</style>
