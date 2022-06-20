<!-- Copyright (c) 2022 Shafil Alam -->

<script context="module">
    export async function load({ fetch }) {
        const res = await fetch("/api/users");
        const jsonRes = await res.json();
        return { props: { users: jsonRes.addresses } };
    }
</script>

<script>
    import Circle from "$lib/Circle.svelte";
    import History from "$lib/History.svelte";
    import Fa from 'svelte-fa/src/fa.svelte'
    import { faPlus, faHistory, faEdit, faClose, faSearch, faCloudUpload } from '@fortawesome/free-solid-svg-icons'
    import { Tabs, Tab, TabList, TabPanel } from 'svelte-tabs';

    export let users;
    let filteredUsers;

    let arcadeHistory = [];
    let filteredHistory = [];

    let playHistory = [];
    let filteredPlayHistory = [];

    let userSearch = "";
    let historySearch = "";

    $: filteredUsers = users.filter((user) => {
        return user.includes(userSearch)
    })

    $: filteredHistory = arcadeHistory.filter((history) => {
        return history.arcade_name.toLowerCase().includes(historySearch.toLowerCase()) 
        || history.from.includes(historySearch)
        || history.value.toString().includes(historySearch)
    })

    $: filteredPlayHistory = playHistory.filter((history) => {
        return history.arcade_name.toLowerCase().includes(historySearch.toLowerCase()) 
        || history.from.includes(historySearch)
        || history.value.toString().includes(historySearch)
    })

    function parseTime(timestamp) {
        if(timestamp <= -1) return 'Never seen'
        var date = new Date(timestamp*1000)
        return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US")
    }

    async function fetchUsers() {
        const res = await fetch("/api/users");
        const jsonRes = await res.json();
        users = jsonRes.addresses;
    }

    async function getHistory(addr) {
        const res = await fetch("/api/history/payment/user/" + addr);
        const jsonRes = await res.json();
        arcadeHistory = jsonRes.arcadeHistory;
        getPlayHistory()
    }

    async function getPlayHistory(addr) {
        const res = await fetch("/api/history/play/user/" + addr);
        const jsonRes = await res.json();
        playHistory = jsonRes.arcadeHistory;
    }
</script>

<div class="container mx-auto">
    <div class="navbar bg-base-100">
        <div class="flex-1">
            <span class="text-xl">Users</span>
        </div>
        <div class="flex-none">
            <ul class="menu menu-horizontal p-0">
                <!-- <label for="add-modal" class="btn modal-button"><Fa icon={faPlus} fw/>New</label> -->
            </ul>
        </div>
    </div>
    <div class="form-control mb-4 w-full">
        <div class="input-group w-full">
            <span><Fa icon={faSearch} fw/></span>
            <input type="text" bind:value={userSearch} placeholder="Search..." class="input input-bordered w-full" />
        </div>
    </div>
    <div class="flex flex-col space-y-4">
        {#each filteredUsers as user}
            <div class="alert shadow-lg">
                <div>
                    <div class="w-8 ml-4">
                        <img src="/img/dogecoin.png" alt="Arcade" />
                    </div>
                    <div>
                        <h3 class="font-bold">{user}</h3>
                    </div>
                </div>
                <div class="flex-none">
                    <label for="history-modal" on:click={getHistory(user)} class="btn modal-button"><Fa icon={faHistory} fw/> History</label>                    
                    <label for="" class="btn modal-button"><Fa icon={faEdit} fw/> Edit</label>
                </div>
            </div>
        {/each}
        {#if users.length == 0}
            <p class="mt-10 text-xs text-center">No users were found.</p>
        {/if}
    </div>
</div>

<!-- History modal -->
<input type="checkbox" id="history-modal" class="modal-toggle" />
<div class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
        <h3 class="font-bold text-lg">History</h3>
        <div class="form-control mt-4 w-full">
            <div class="input-group w-full">
                <span><Fa icon={faSearch} fw/></span>
                <input type="text" bind:value={historySearch} placeholder="Search..." class="input input-bordered w-full" />
            </div>
        </div>
        <div class="tabs mt-4">
                <Tabs>
                    <TabList>
                    <Tab>Payment</Tab>
                    <Tab>Games played</Tab>
                    </TabList>
                    <TabPanel>
                        {#each filteredHistory as history}
                        <History type='payment' from="" value={history.value} arcade_name={history.arcade_name} tx={history.tx} timestamp={history.timestamp} />
                        {/each}                   
                        {#if arcadeHistory.length == 0}
                            <p class="mt-10 text-xs text-center">No history was found.</p>
                        {/if}
                    </TabPanel>       
                    <TabPanel>
                        {#each filteredPlayHistory as history}
                        <History type='play' from="" value={history.value} arcade_name={history.arcade_name} timestamp={history.timestamp} />
                        {/each}
                        {#if playHistory.length == 0}
                            <p class="mt-10 text-xs text-center">No play history was found.</p>
                        {/if}
                    </TabPanel>
                </Tabs>
        </div>
        <div class="modal-action">
            <label for="history-modal" class="btn"><Fa icon={faClose} fw/> Close</label>
        </div>
    </div>
</div>
