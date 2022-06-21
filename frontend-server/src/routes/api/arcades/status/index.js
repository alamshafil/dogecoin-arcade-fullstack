// Copyright (c) 2022 Shafil Alam

import { connectToDatabase } from '$lib/db'
import { ObjectId } from 'mongodb'

export async function get({params, request}) {
    try {        
        const dbConnection = await connectToDatabase()
        const db = dbConnection.db
        const collection = db.collection('arcade-machines')

        const arcadeStatus = await collection.aggregate([
            {
              $group: {
                _id: null,
                online: {
                  $sum: {
                    $cond: ["$status.online",1,0]
                  }
                },
                offline: {
                  $sum: {
                    $cond: ["$status.online",0,1]
                  }
                }
              }
            },
          ]).toArray()
        
        return {
            status: 200,
            body: {arcadeStatus}
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
