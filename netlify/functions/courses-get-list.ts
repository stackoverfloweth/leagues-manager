import { Handler } from '@netlify/functions'
import { Api, env, getClient } from '../utilities'
import { SeasonResponse } from '@/models/api'

export const handler: Handler = Api('GET', '/courses-get-list', () => async () => {
  const client = await getClient()

  try {
    const db = client.db(env().mongodbName)
    const collection = db.collection<SeasonResponse>('courses')

    const courses = await collection.find().toArray()

    return {
      statusCode: 200,
      body: JSON.stringify(courses),
    }
  } finally {
    await client.close()
  }
})