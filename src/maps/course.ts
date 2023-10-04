import { Course } from '@/models'
import { CourseResponse } from '@/models/api'
import { MapFunction } from '@/services/mapper'

export const mapCourseResponseToCourse: MapFunction<CourseResponse, Course> = function(source) {
  return {
    id: source._id.toString(),
    ...source,
  }
}