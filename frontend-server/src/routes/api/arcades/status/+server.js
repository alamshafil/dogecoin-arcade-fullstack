// Copyright (c) 2022 Shafil Alam

import { connectToDatabase } from '$lib/db'
import { json } from '@sveltejs/kit';

export async function GET({ params, request }) {
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
              $cond: ["$status.online", 1, 0]
            }
          },
          offline: {
            $sum: {
              $cond: ["$status.online", 0, 1]
            }
          }
        }
      },
    ]).toArray()

    return json({ arcadeStatus })
  } catch (err) {
    console.log(err)
    return json({
      error: 'A server error occured'
    }, {
      status: 500
    })
  }
}
