export async function load({ fetch }) {
    const res = await fetch("/api/users");
    const jsonRes = await res.json();
    return { users: jsonRes.addresses };
}
