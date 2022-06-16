<!-- Copyright (c) 2022 Shafil Alam -->

<script>
    export let type, from, value, arcade_name, tx, timestamp

    function parseTime(timestamp) {
        var date = new Date(timestamp*1000)
        return date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US")
    }
</script>

{#if type == 'payment'}
<div class="alert shadow-lg mb-4">
    <div>
        <div class="w-10 ml-2">
            <img src="/img/dogecoin.png" alt="Arcade" />
        </div>
        <div>
            <div class="font-bold text-xs md:text-base">{from} sent {value} DOGE to arcade machine {arcade_name}</div>
            <p class="text-sm break-all text-xs md:text-base">TX ID: {tx}</p>
            <p class="text-sm break-all text-xs md:text-base">Received: {parseTime(timestamp)}</p>
        </div>
    </div>
</div>
{:else if type == 'play'}
<div class="alert shadow-lg mb-4">
    <div>
        <div class="w-10 ml-2">
            <img src="/img/arcade.png" alt="Arcade" />
        </div>
        <div>
            <div class="font-bold text-xs md:text-base">{from} played arcade machine {arcade_name} (Cost: {value} DOGE)</div>
            <p class="text-sm break-all text-xs md:text-base">Played: {parseTime(timestamp)}</p>
        </div>
    </div>
</div>
{/if}
