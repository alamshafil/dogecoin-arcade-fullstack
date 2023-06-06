export async function load({ fetch }) {
    const res_all = await fetch("/api/sum/coins/all");
    const jsonRes_all = await res_all.json();

    const res_arcades = await fetch("/api/sum/coins/arcades");
    const jsonRes_arcades = await res_arcades.json();

    const res_status = await fetch("/api/arcades/status");
    const jsonRes_status = await res_status.json();

    return {
        totalSum: jsonRes_all.totalValue[0],
        arcadeSums: jsonRes_arcades.totalValues,
        arcadeStatus: jsonRes_status.arcadeStatus[0],
    };
}
