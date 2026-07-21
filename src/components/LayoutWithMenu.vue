<template>
    <div>
      <CustomMenu />
      <router-view />
    </div>
  </template>
  
  <script setup>
  import CustomMenu from '@/components/CustomMenu';
  import { RouterView } from 'vue-router';
  </script>