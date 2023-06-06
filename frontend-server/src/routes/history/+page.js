export async function load({ fetch }) {
    const res = await fetch("/api/history");
    const jsonRes = await res.json();
    return { arcadeHistory: jsonRes.arcadeHistory };
}
