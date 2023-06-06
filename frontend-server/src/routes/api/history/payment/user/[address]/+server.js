// Copyright (c) 2022 Shafil Alam

import { connectToDatabase } from '$lib/db'
import { json } from '@sveltejs/kit';

export async function GET({ params, request }) {
    try {
        var address = params.address

        const dbConnection = await connectToDatabase()
        const db = dbConnection.db
        const collection = db.collection('arcade-history')
        const arcadeHistory = await collection.find({ from: address }).toArray()

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

// TODO
export async function POST({ params, request }) {
}

export async function PUT({ params, request }) {
}

export async function DELETE({ params, request }) {
}
