<!-- Copyright (c) 2022 Shafil Alam -->
<script>
    export let data;

    import Fa from "svelte-fa/src/fa.svelte";
    import { faWarning, faCoins, faGamepad } from "@fortawesome/free-solid-svg-icons";
    import { doge_price } from "$lib/stores";

    let price;

    doge_price.subscribe(value => {
		price = value;
	});
</script>

<div class="container mx-auto mt-8">
    <div class="stats shadow-xl flex items-center mb-8">
        <div class="stat">
            <div class="stat-figure">
                <Fa icon={faCoins} fw size="4x" />
            </div>
            <div class="stat-title">Total DOGE</div>
            {#if data.totalSum != undefined}
                <div class="stat-value">{data.totalSum.sum} DOGE</div>
                <div class="stat-desc">{data.totalSum.sum} DOGE = ${(price * data.totalSum.sum).toFixed(2)}</div>
            {:else}
                <div class="stat-value">0 DOGE</div>
                <div class="stat-desc">0 DOGE = $0.00</div>
            {/if}
        </div>

        <div class="stat">
            <div class="stat-figure">
                <Fa icon={faGamepad} fw size="4x" />
            </div>
            <div class="stat-title">Online arcade machines</div>
            {#if data.arcadeStatus != undefined}
                <div class="stat-value">{data.arcadeStatus.online} online</div>
            {:else}
                <div class="stat-value">0 online</div>
            {/if}
        </div>

        <div class="stat">
            <div class="stat-figure">
                <Fa icon={faWarning} fw size="4x" />
            </div>
            <div class="stat-title">Offline arcade machines</div>
            {#if data.arcadeStatus != undefined}
                <div class="stat-value">{data.arcadeStatus.offline} offline</div>
            {:else}
                <div class="stat-value">0 offline</div>
            {/if}
        </div>
    </div>

    <h1 class="font-bold text-xl mb-4">Arcade Machines</h1>
    <div class="space-y-4">
        {#if data.arcadeSums.length != 0}
            {#each data.arcadeSums as arcade}
                <div class="alert shadow-lg">
                    <div>
                        <div class="w-8 ml-4">
                            <img src="/img/arcade.png" alt="Arcade" />
                        </div>
                        <div>
                            <h3 class="font-bold">ID: {arcade.id}</h3>
                        </div>
                    </div>
                    <div class="flex-none">
                        <div>Total: {arcade.sum} DOGE</div>
                        <div class="text-xs">${(price*arcade.sum).toFixed(2)}</div>
                    </div>
                </div>
            {/each}
        {:else}
            <p class="mt-10 text-xs text-center">No arcades were found.</p>
        {/if}
    </div>
</div>
