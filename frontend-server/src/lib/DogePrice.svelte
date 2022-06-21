<!-- Copyright (c) 2022 Shafil Alam -->
<!-- Based on CoinGecko API -->

<script>
	import { doge_price } from '$lib/stores.js';

    const coin = 'dogecoin'
    const curreny = 'USD'

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=${curreny}`
    let price;

    async function fetchPrice() {
        price = await fetch(url).then((e) => e.json());
        doge_price.update(p => price.dogecoin.usd);
    }
    fetchPrice();
</script>

{#if price}
    {#await price}
        Loading...
    {:then data}
      <span>1 DOGE = ${data.dogecoin.usd}</span>
    {/await}
{:else}
    Loading...
{/if}
