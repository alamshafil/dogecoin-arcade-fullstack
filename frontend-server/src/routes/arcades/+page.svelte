<!-- Copyright (c) 2022 Shafil Alam -->

<script>
    export let data;

    import Circle from "$lib/Circle.svelte";
    import History from "$lib/History.svelte";
    import Fa from 'svelte-fa/src/fa.svelte'
    import { faPlus, faHistory, faEdit, faClose, faSearch, faCloudUpload } from '@fortawesome/free-solid-svg-icons'
    import { Tabs, Tab, TabList, TabPanel } from 'svelte-tabs';

    let filteredMachines;

    let arcadeHistory = [];
    let filteredHistory = [];

    let playHistory = [];
    let filteredPlayHistory = [];

    let arcadeName;
    let arcadeCost;
    let arcadeID;
    let arcadeDB; // Database ID

    let machineSearch = "";
    let historySearch = "";

    $: filteredMachines = data.arcadeMachines.filter((machine) => {
        return machine.name.toLowerCase().includes(machineSearch.toLowerCase()) 
        || machine.id.includes(machineSearch)
        || machine.cost.toString().includes(machineSearch)
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

    function setArcade(machine) {
        arcadeName = machine.name
        arcadeCost = machine.cost
        arcadeID = machine.id
        arcadeDB = machine._id
    }

    function clearModal() {
        arcadeName = ''
        arcadeCost = ''
        arcadeID = ''
        arcadeDB = ''
    }

    function parseTime(timestamp) {
        if(timestamp <= -1) return 'Never seen'
        var date = new Date( timestamp * 1000 )
        return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US")
    }

    async function addArcade() {
        try {
            const arcadeMachine = {
                name: arcadeName,
                id: arcadeID,
                cost: arcadeCost,
                status: {
                    online: false,
                    timestamp: -1
                }
            };
            await fetch("/api/arcades", {
                method: "POST",
                body: JSON.stringify(arcadeMachine),
            });
            clearModal()
            fetchMachines();
        } catch (err) {
            alert("There was an error");
        }
        clearModal()
    }

    async function editArcade() {
        try {
            const arcadeMachine = {
                name: arcadeName,
                cost: arcadeCost,
                id: arcadeID,
                dbID: arcadeDB,
            };
            await fetch("/api/arcades", {
                method: "PUT",
                body: JSON.stringify(arcadeMachine),
            });
            clearModal()
            fetchMachines();
        } catch (err) {
            alert("There was an error");
        }
        clearModal()
    }

    async function fetchMachines() {
        const res = await fetch("/api/arcades");
        const jsonRes = await res.json();
        arcadeMachines = jsonRes.arcadeMachines;
    }

    async function getHistory(machine) {
        setArcade(machine)
        const res = await fetch("/api/history/payment/arcade/" + arcadeID);
        const jsonRes = await res.json();
        arcadeHistory = jsonRes.arcadeHistory;
        getPlayHistory()
    }

    async function getPlayHistory() {
        const res = await fetch("/api/history/play/arcade/" + arcadeID);
        const jsonRes = await res.json();
        playHistory = jsonRes.arcadeHistory;
    }
</script>

<div class="container mx-auto">
    <div class="navbar bg-base-100">
        <div class="flex-1">
            <span class="text-xl">Arcade Machines</span>
        </div>
        <div class="flex-none">
            <ul class="menu menu-horizontal p-0">
                <label for="add-modal" class="btn modal-button"><Fa icon={faPlus} fw/>New</label>
            </ul>
        </div>
    </div>
    <div class="form-control mb-4 w-full">
        <div class="input-group w-full">
            <span><Fa icon={faSearch} fw/></span>
            <input type="text" bind:value={machineSearch} placeholder="Search..." class="input input-bordered w-full" />
        </div>
    </div>
    <div class="flex flex-col space-y-4">
        {#each filteredMachines as machine}
            <div class="w-100 shadow-lg alert">
                <div class="w-20 ml-4">
                    <img src="/img/arcade.png" alt="Arcade" />
                </div>
                <div>
                    <h3 class="font-bold">{machine.name}</h3>
                    <div class="text-xs">ID: {machine.id}</div>
                    <div class="text-xs">Cost: {machine.cost} DOGE</div>
                    <div class="text-xs">
                        <Circle text="{machine.status.online ? "Online" : "Offline"} ({parseTime(machine.status.timestamp)})" status={machine.status.online} />
                    </div>
                </div>
                <div class="flex-none">
                    <label for="history-modal" on:click={getHistory(machine)} class="btn modal-button"><Fa icon={faHistory} fw/> History</label>
                    <label for="edit-modal" on:click={setArcade(machine)} class="btn modal-button"><Fa icon={faEdit} fw/> Edit</label>
                </div>
            </div>
        {/each}
        {#if data.arcadeMachines.length == 0}
            <p class="mt-10 text-xs text-center">No arcade machines were found.</p>
        {/if}
    </div>
</div>

<!-- Add modal -->
<input type="checkbox" id="add-modal" class="modal-toggle" />
<div class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Add new arcade machine</h3>
        <div class="space-y-4 mt-4">
            <div class="form-control">
                <label class="input-group">
                <span>Name</span>
                <input type="text" bind:value={arcadeName} class="input input-bordered w-full" />
                </label>
            </div>
            <div class="form-control">
                <label class="input-group">
                <span>Unique ID</span>
                <input type="text" bind:value={arcadeID} autocomplete="off" class="input input-bordered w-full" />
                </label>
            </div>
            <div class="form-control">
                <label class="input-group">
                <span>Cost</span>
                <input type="text" bind:value={arcadeCost} autocomplete="off" class="input input-bordered w-full" />
                <span>DOGE</span>
                </label>
            </div>
        </div>
        <div class="modal-action">
            <label on:click={addArcade} for="add-modal" class="btn"><Fa icon={faPlus} fw/> Add</label>
            <label on:click={clearModal} for="add-modal" class="btn"><Fa icon={faClose} fw/> Close</label>
        </div>
    </div>
</div>

<!-- Edit modal -->
<input type="checkbox" id="edit-modal" class="modal-toggle" />
<div class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Editing machine '{arcadeName}'</h3>
        <p class="text-xs">ID: {arcadeID}</p>
        <div class="space-y-4 mt-4">
            <div class="form-control">
                <label class="input-group">
                <span>Name</span>
                <input type="text" bind:value={arcadeName} class="input input-bordered w-full" />
                </label>
            </div>
            <div class="form-control">
                <label class="input-group">
                <span>Unique ID</span>
                <input type="text" bind:value={arcadeID} autocomplete="off" class="input input-bordered w-full" />
                </label>
            </div>
            <div class="form-control">
                <label class="input-group">
                <span>Cost</span>
                <input type="text" bind:value={arcadeCost} autocomplete="off" class="input input-bordered w-full" />
                <span>DOGE</span>
                </label>
            </div>
        </div>
        <div class="modal-action">
            <label on:click={editArcade} for="edit-modal" class="btn"><Fa icon={faCloudUpload} fw/> Update</label>
            <label on:click={clearModal} for="edit-modal" class="btn"><Fa icon={faClose} fw/> Close</label>
        </div>
    </div>
</div>

<!-- History modal -->
<input type="checkbox" id="history-modal" class="modal-toggle" />
<div class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
        <h3 class="font-bold text-lg">History of '{arcadeName}'</h3>
        <p class="text-xs">ID: {arcadeID}</p>
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
                        <History type='payment' from={history.from} value={history.value} arcade_name={history.arcade_name} tx={history.tx} timestamp={history.timestamp} />
                        {/each}                   
                        {#if arcadeHistory.length == 0}
                            <p class="mt-10 text-xs text-center">No history was found.</p>
                        {/if}
                    </TabPanel>       
                    <TabPanel>
                        {#each filteredPlayHistory as history}
                        <History type='play' from={history.from} value={history.value} arcade_name={history.arcade_name} timestamp={history.timestamp} />
                        {/each}
                        {#if playHistory.length == 0}
                            <p class="mt-10 text-xs text-center">No play history was found.</p>
                        {/if}
                    </TabPanel>
                </Tabs>
        </div>
        <div class="modal-action">
            <label on:click={clearModal} for="history-modal" class="btn"><Fa icon={faClose} fw/> Close</label>
        </div>
    </div>
</div>
