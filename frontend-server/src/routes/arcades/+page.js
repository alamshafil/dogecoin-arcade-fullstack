export async function load({ fetch }) {
    const res = await fetch("/api/arcades");
    const jsonRes = await res.json();
    return { arcadeMachines: jsonRes.arcadeMachines };
}
