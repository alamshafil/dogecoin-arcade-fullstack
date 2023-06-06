// Copyright (c) 2022 Shafil Alam

import { connectToDatabase } from '$lib/db'
import { json } from '@sveltejs/kit';

export async function GET({ params, request }) {
    try {
        const dbConnection = await connectToDatabase()
        const db = dbConnection.db
        const collection = db.collection('arcade-history')
        const totalValue = await collection.aggregate([{ $group: { _id: null, sum: { $sum: "$value" } } }]).toArray()

        return json({ totalValue })
    } catch (err) {
        console.log(err)
        return json({
            error: 'A server error occured'
        }, {
            status: 500
        })
    }
}
