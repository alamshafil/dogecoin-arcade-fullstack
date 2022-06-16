// Copyright (c) 2022 Shafil Alam

import { connectToDatabase } from '$lib/db'
import { ObjectId } from 'mongodb'

export async function get({params, request}) {
    try {
        var address = params.address
        
        const dbConnection = await connectToDatabase()
        const db = dbConnection.db
        const collection = db.collection('arcade-history')
        const arcadeHistory = await collection.find({from: address}).toArray()

        return {
            status: 200,
            body: {arcadeHistory}
        }
    } catch(err) {
        console.log(err)
        return {
            status: 500,
            body: {
                error: 'A server error occured'
            }
        }
    }
}

export async function post({params, request}) {
}

export async function put({params, request}) {
}

export async function del({params, request}) {
}