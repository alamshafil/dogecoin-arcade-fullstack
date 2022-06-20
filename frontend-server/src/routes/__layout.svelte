<!-- Copyright (c) 2022 Shafil Alam -->

<script>
  import "../app.css";
  import DogePrice from "$lib/DogePrice.svelte";
  import Fa from 'svelte-fa/src/fa.svelte'
  import { faHome, faGamepad, faUser, faCogs, faPaintBrush, faClose } from '@fortawesome/free-solid-svg-icons'

  let name = "Dogecoin Arcade"
</script>

<svelte:head>
  <title>{name}</title>
</svelte:head>

<div class="drawer">
  <input id="drawer-main" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content flex flex-col">
    <!-- Navbar -->
    <div class="w-full navbar bg-base-300">
      <div class="flex-none lg:hidden">
        <label for="drawer-main" class="btn btn-square btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block w-6 h-6 stroke-current"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            /></svg
          >
        </label>
      </div>
      <div class="flex-1 px-2 mx-2">
        <div class="w-10">
          <img src="/img/arcade.png" alt="Logo" />
        </div>
        <a href="/" class="btn btn-ghost normal-case text-xl">{name}</a>
        <DogePrice />
      </div>
      <div class="flex-none hidden lg:block">
        <ul class="menu menu-horizontal">
          <!-- Navbar menu content -->
          <a href="/" class="btn btn-ghost normal-case"><Fa icon={faHome} fw/> Home</a>
          <a href="/users" class="btn btn-ghost normal-case"><Fa icon={faUser} fw/> Users</a>
          <a href="/arcades" class="btn btn-ghost normal-case"><Fa icon={faGamepad} fw/> Arcade Machines</a>
        </ul>
      </div>
      <!-- User dropdown -->
      <!-- <div class="dropdown dropdown-end">
        <span tabindex="0" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <img src="img/dogecoin.png" alt="User" />
          </div>
        </span>
        <ul tabindex="0" class="menu menu-compact dropdown-content mt-3 p-2 shadow-xl bg-base-100 rounded-box w-52">
          <li>
            <div class="justify-between">
              <Fa icon={faPaintBrush} fw/> Dashboard
              <span class="badge">New</span>
            </div>
          </li>
          <li><a href="/"><Fa icon={faCogs} fw/> Settings</a></li>
          <li><a href="/"><Fa icon={faClose} fw/> Logout</a></li>
        </ul>
      </div> -->
    </div>
    <!-- Page content -->
    <slot />
  </div>
  <div class="drawer-side">
    <label for="drawer-main" class="drawer-overlay" />
    <ul class="menu p-4 overflow-y-auto w-80 bg-base-100">
      <!-- Sidebar content -->
      <li><a href="/">Home</a></li>
      <li><a href="/users">Users</a></li>
      <li><a href="/arcades">Arcade Machines</a></li>
    </ul>
  </div>
</div>
