import { Handler } from '@netlify/functions'
import { Api, env, getClient } from '../utilities'
import { EventPlayerResponse } from '@/models/api'

export const handler: Handler = Api('GET', '/event-players-get-list/:eventId', ([eventId]) => async () => {
  const client = await getClient()

  try {
    const db = client.db(env().mongodbName)
    const collection = db.collection<EventPlayerResponse>('event-players')

    const courses = await collection.find({
      eventId,
    }).toArray()

    return {
      statusCode: 200,
      body: JSON.stringify(courses),
    }
  } finally {
    await client.close()
  }
})