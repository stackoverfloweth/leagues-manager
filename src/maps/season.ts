import mapper, { Profile } from '@kitbag/mapper'
import { Season } from '@/models'
import { SeasonResponse } from '@/models/api'

export const mapSeasonResponseToSeason = {
  sourceKey: 'SeasonResponse',
  destinationKey: 'Season',
  map: (source: SeasonResponse): Season => {
    return {
      ...source,
      id: mapper.map('ObjectId', source._id, 'string'),
      courseId: mapper.map('ObjectId', source.courseId, 'string'),
      course: mapper.map('CourseResponse', source.course, 'Course'),
    }
  },
} as const satisfies Profile
