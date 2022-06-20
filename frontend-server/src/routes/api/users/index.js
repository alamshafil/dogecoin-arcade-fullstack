// Copyright (c) 2022 Shafil Alam

import { connectToDatabase } from '$lib/db'
import { ObjectId } from 'mongodb'

export async function get({params, request}) {
    try {        
        const dbConnection = await connectToDatabase()
        const db = dbConnection.db
        const collection = db.collection('arcade-plays')
        const addresses = await collection.distinct("from")

        return {
            status: 200,
            body: {addresses}
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
