<!-- Copyright (c) 2022 Shafil Alam -->

<script>
    import History from '$lib/History.svelte';
    import Fa from 'svelte-fa/src/fa.svelte'
    import { faSearch } from '@fortawesome/free-solid-svg-icons'
    import { browser } from '$app/env';
    
    let dogecoinAddr = '';

    let historySearch = '';
    let arcadeHistory = [];
    let filteredHistory = [];

    let playHistorySearch = '';
    let playHistory = [];
    let filteredPlayHistory = [];

    var showUser = false;

    if(browser && (localStorage["dogecoin_addr"] != null)) {
        dogecoinAddr = localStorage["dogecoin_addr"]
        logIn()
    }

    async function getHistory() {
        const res = await fetch("/api/history/payment/user/" + dogecoinAddr);
        const jsonRes = await res.json();
        arcadeHistory = jsonRes.arcadeHistory;
    }

    async function getPlayHistory() {
        const res = await fetch("/api/history/play/user/" + dogecoinAddr);
        const jsonRes = await res.json();
        playHistory = jsonRes.arcadeHistory;
    }

    function logIn() {
        getHistory()
        getPlayHistory()
        if(dogecoinAddr != '' || dogecoinAddr != undefined) {
            if(browser) localStorage["dogecoin_addr"] = dogecoinAddr
            showUser = true
        }
    }

    function logOut() {
        if(browser) localStorage.removeItem("dogecoin_addr")
        arcadeHistory = []
        filteredHistory = []
        dogecoinAddr = ''
        historySearch = ''
        showUser = false
    }

    $: filteredHistory = arcadeHistory.filter((history) => {
        return history.arcade_name.toLowerCase().includes(historySearch.toLowerCase()) 
        || history.from.includes(historySearch)
        || history.value.toString().includes(historySearch)
    })

    $: filteredPlayHistory = playHistory.filter((history) => {
        return history.arcade_name.toLowerCase().includes(playHistorySearch.toLowerCase()) 
        || history.from.includes(playHistorySearch)
        || history.value.toString().includes(playHistorySearch)
    })
</script>

{#if !showUser}
<div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
        <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <div class="card-body">
                <div class="form-control">
                    <label class="label" for="address-input">
                        <span class="label-text">Dogecoin Address</span>
                    </label>
                    <input
                        bind:value={dogecoinAddr}
                        type="text"
                        id="address-input"
                        class="input input-bordered"
                    />
                </div>
                <div class="form-control mt-6">
                    <button on:click={logIn} class="btn btn-primary">Login</button>
                </div>
            </div>
        </div> 
        <div class="text-center lg:text-left">
            <h1 class="text-5xl font-bold">Login now!</h1>
            <p class="py-6">
                View your stats, infomation, and many more just by using your wallet address!
            </p>
        </div>
    </div>
</div>
{:else if showUser}
<div class="container mx-auto">
    <div class="flex flex-col space-y-4 mt-5">
        <div class="navbar bg-base-100">
            <div class="flex-1">
                <h3 class="text-xl text-xs md:text-base">Payment history for {dogecoinAddr}</h3>
            </div>
            <div class="flex-none">
                <ul class="menu menu-horizontal p-0">
                    <button on:click={logOut} class="btn">Log Out</button>
                </ul>
            </div>
        </div>
        <div class="form-control mt-4 w-full">
            <div class="input-group w-full">
                <span><Fa icon={faSearch} fw/></span>
                <input type="text" bind:value={historySearch} placeholder="Search..." class="input input-bordered w-full" />
            </div>
        </div>
        {#each filteredHistory as history}
            <History type='payment' from={history.from} value={history.value} arcade_name={history.arcade_name} tx={history.tx} timestamp={history.timestamp} />
        {/each}
        {#if arcadeHistory.length == 0}
            <p class="mt-10 text-xs text-center">No history was found.</p>
        {/if}
    </div>
    <br/><br/><hr/><br/><br/>
    <div class="flex flex-col space-y-4 mt-5">
        <div class="navbar bg-base-100">
            <div class="flex-1">
                <h3 class="text-xl text-xs md:text-base">Game history for {dogecoinAddr}</h3>
            </div>
            <div class="flex-none">
                <ul class="menu menu-horizontal p-0">
                    <button class="btn">View</button>
                </ul>
            </div>
        </div>
        <div class="form-control mt-4 w-full">
            <div class="input-group w-full">
                <span><Fa icon={faSearch} fw/></span>
                <input type="text" bind:value={historySearch} placeholder="Search..." class="input input-bordered w-full" />
            </div>
        </div>
        {#each filteredPlayHistory as history}
            <History type='play' from={history.from} value={history.value} arcade_name={history.arcade_name} timestamp={history.timestamp} />
        {/each}
        {#if playHistory.length == 0}
            <p class="mt-10 text-xs text-center">No play history was found.</p>
        {/if}
    </div>
</div>
{/if}
