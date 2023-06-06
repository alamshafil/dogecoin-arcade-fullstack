<script>
    export let data;

    async function fetchMachines() {
        const res = await fetch("/api/history");
        const jsonRes = await res.json();
        arcadeHistory = jsonRes.arcadeHistory;
    }
</script>

<div class="container mx-auto">
    <div class="navbar bg-base-100">
        <div class="flex-1">
            <a href="/" class="btn btn-ghost normal-case text-xl"
                >Arcade History</a
            >
        </div>
        <div class="flex-none">
            <!-- <ul class="menu menu-horizontal p-0">
                <label for="add-modal" class="btn modal-button">Add new</label>
            </ul> -->
        </div>
    </div>

    <div class="flex flex-col space-y-4">
        {#each data.arcadeHistory as history}
            <div class="alert shadow-lg">
                <div>
                    <div class="w-10 ml-4">
                        <img src="/img/dogecoin.png" alt="Arcade" />
                    </div>
                    <div>
                        <div class="text-xs">{history.from} sent {history.value} DOGE to arcade machine {history.arcade_name}</div>
                    </div>
                </div>
                <div class="flex-none">
                    <button class="btn btn-sm">Edit</button>
                </div>
            </div>
        {/each}
    </div>
</div>
