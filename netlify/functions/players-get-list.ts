import { Handler } from '@netlify/functions'
import { ObjectId } from 'mongodb'
import { Api, env, getClient } from '../utilities'
import { PlayerResponse } from '@/models/api'

export const handler: Handler = Api('GET', '/players-get-list/:seasonId', ([seasonId]) => async () => {
  const client = await getClient()

  try {
    const db = client.db(env().mongodbName)
    const collection = db.collection<PlayerResponse>('players')

    const players = await collection
      .find({
        seasonId: new ObjectId(seasonId),
      })
      .sort({ tagId: 1 })
      .toArray()

    return {
      statusCode: 200,
      body: JSON.stringify(players),
    }
  } finally {
    await client.close()
  }
})