// Copyright (c) 2022 Shafil Alam

import { connectToDatabase } from '$lib/db'
import { ObjectId } from 'mongodb'

export async function get({params, request}) {
    try {
        var address = params.address
        
        const dbConnection = await connectToDatabase()
        const db = dbConnection.db
        const collection = db.collection('arcade-history')
        const totalValues = await collection.aggregate([{$group: {_id:"$arcade_name", sum:{$sum:"$value"}}}]).toArray()

        return {
            status: 200,
            body: {totalValues}
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
