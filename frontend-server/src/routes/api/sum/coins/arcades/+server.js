// Copyright (c) 2022 Shafil Alam

import { connectToDatabase } from '$lib/db'
import { json } from '@sveltejs/kit';

export async function GET({ params, request }) {
    try {
        var address = params.address

        const dbConnection = await connectToDatabase()
        const db = dbConnection.db
        const collection = db.collection('arcade-history')
        const totalValues = await collection.aggregate([{ $group: { _id: "$arcade_name", sum: { $sum: "$value" } } }]).toArray()

        return json({ totalValues })
    } catch (err) {
        console.log(err)
        return json({
            error: 'A server error occured'
        }, {
            status: 500
        })
    }
}
