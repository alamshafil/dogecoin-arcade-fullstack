// Copyright (c) 2022 Shafil Alam

import { connectToDatabase } from '$lib/db'
import { ObjectId } from 'mongodb'

export async function get({params, request}) {
    try {
        const dbConnection = await connectToDatabase()
        const db = dbConnection.db
        const collection = db.collection('arcade-machines')
        const arcadeMachines = await collection.find({}).toArray()

        return {
            status: 200,
            body: {arcadeMachines}
        }
    } catch(err) {
        return {
            status: 500,
            body: {
                error: 'A server error occured'
            }
        }
    }
}

export async function post({params, request}) {
    try {
        const dbConnection = await connectToDatabase()
        const db = dbConnection.db
        const collection = db.collection('arcade-machines')

        const machine = await request.json()
        await collection.insertOne(machine)

        return {
            status: 200,
            body: {
                status: 'Success'
            }
        }
    } catch(err) {
        return {
            status: 500,
            body: {
                error: 'A server error occured'
            }
        }
    }
}

export async function put({params, request}) {
    try {
        const dbConnection = await connectToDatabase()
        const db = dbConnection.db
        const collection = db.collection('arcade-machines')

        const machine = await request.json()
        await collection.updateOne({_id: ObjectId(machine.id)}, {$set: {
            name: machine.name,
            address: machine.address,
            cost: machine.cost
        }})

        return {
            status: 200,
            body: {
                status: 'Success'
            }
        }
    } catch(err) {
        return {
            status: 500,
            body: {
                error: 'A server error occured'
            }
        }
    }
}

export async function del({params, request}) {
}
