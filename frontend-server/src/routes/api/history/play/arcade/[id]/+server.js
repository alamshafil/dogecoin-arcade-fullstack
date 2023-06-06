// Copyright (c) 2022 Shafil Alam

import { connectToDatabase } from '$lib/db'
import { json } from '@sveltejs/kit';

export async function GET({ params, request }) {
    try {
        var id = params.id

        const dbConnection = await connectToDatabase()
        const db = dbConnection.db
        const collection = db.collection('arcade-plays')
        const arcadeHistory = await collection.find({ arcade_id: id }).toArray()

        return json({ arcadeHistory })
    } catch (err) {
        console.log(err)
        return json({
            error: 'A server error occured'
        }, {
            status: 500
        })
    }
}
