<!-- Copyright (c) 2022 Shafil Alam -->

<script>
    export let status
    export let text

    let colorClass = 'bg-red-500'

    if(status) colorClass = 'bg-green-500'
    if(!status) colorClass = 'bg-red-500'
</script>

<div class="flex items-start mt-1">
    <span class="w-4 h-4 mr-2 rounded-full {colorClass}"></span>
    <span>{text}</span>
</div>
