// Copyright (c) 2022 Shafil Alam

import { connectToDatabase } from '$lib/db'
import { json as json$1 } from '@sveltejs/kit';
import { ObjectId } from 'mongodb'

export async function GET({ params, request }) {
    try {
        const dbConnection = await connectToDatabase()
        const db = dbConnection.db
        const collection = db.collection('arcade-machines')
        const arcadeMachines = await collection.find({}).toArray()

        return json$1({ arcadeMachines })
    } catch (err) {
        return json$1({
            error: 'A server error occured'
        }, {
            status: 500
        })
    }
}

export async function POST({ params, request }) {
    try {
        const dbConnection = await connectToDatabase()
        const db = dbConnection.db
        const collection = db.collection('arcade-machines')

        const machine = await request.json()
        await collection.insertOne(machine)

        return json$1({
            status: 'Success'
        })
    } catch (err) {
        return json$1({
            error: 'A server error occured'
        }, {
            status: 500
        })
    }
}

export async function PUT({ params, request }) {
    try {
        const dbConnection = await connectToDatabase()
        const db = dbConnection.db
        const collection = db.collection('arcade-machines')

        const machine = await request.json()
        await collection.updateOne({ _id: ObjectId(machine.dbID) }, {
            $set: {
                name: machine.name,
                cost: machine.cost,
                id: machine.id,
            }
        })

        return json$1({
            status: 'Success'
        })
    } catch (err) {
        return json$1({
            error: 'A server error occured'
        }, {
            status: 500
        })
    }
}

// TODO
export async function DELETE({ params, request }) {
}
