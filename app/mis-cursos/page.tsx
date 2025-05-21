"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type Enrollment, getMyEnrollments } from "@/lib/api"
import { Book, Calendar, Clock } from "lucide-react"
import { ErrorMessage } from "@/components/error-message"
import Link from "next/link"

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userId = process.env.NEXT_PUBLIC_USER_ID ? Number.parseInt(process.env.NEXT_PUBLIC_USER_ID) : 2

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true)
      try {
        const data = await getMyEnrollments(userId)
        setEnrollments(data)
        setError(null)
      } catch (err) {
        setError("Error al cargar los cursos inscritos. Por favor, intenta de nuevo más tarde.")
        console.error("Error fetching enrollments:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollments()
  }, [userId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return <div className="text-center py-10">Cargando cursos inscritos...</div>
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mt-2">Mis Cursos Inscritos</h1>
      </div>

      {error && <ErrorMessage message={error} />}

      {enrollments.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No tienes cursos inscritos actualmente.</p>
          <Link href="/cursos">
            <Button>Explorar Cursos</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{enrollment.course.title}</CardTitle>
                <CardDescription>
                  Categoría: {enrollment.course.category.name} | Instructor: {enrollment.course.instructor.username}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3 mb-2">{enrollment.course.description}</p>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Inscrito el: {formatDate(enrollment.enrollmentDate)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{enrollment.course.durationInHours || 0} horas</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      enrollment.course.difficultyLevel === "BEGINNER"
                        ? "bg-blue-100 text-blue-800"
                        : enrollment.course.difficultyLevel === "INTERMEDIATE"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {enrollment.course.difficultyLevel === "BEGINNER"
                      ? "Principiante"
                      : enrollment.course.difficultyLevel === "INTERMEDIATE"
                        ? "Intermedio"
                        : "Avanzado"}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 pt-0">
                <Button variant="outline" size="sm">
                  <Book className="h-4 w-4 mr-1" />
                  Ver Contenido
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
