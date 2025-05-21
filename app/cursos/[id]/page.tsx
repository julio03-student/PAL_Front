"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { type Course, getCourses, enrollInCourse, createPayment } from "@/lib/api"
import { Book, Calendar, Clock, DollarSign, GraduationCap, User } from "lucide-react"
import { ErrorMessage } from "@/components/error-message"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function CourseDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const courseId = Number.parseInt(params.id)
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentId, setPaymentId] = useState<string>("")
  const userId = process.env.NEXT_PUBLIC_USER_ID ? Number.parseInt(process.env.NEXT_PUBLIC_USER_ID) : 2

  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const coursesData = await getCourses()
        const foundCourse = coursesData.find((c) => c.id === courseId)

        if (foundCourse) {
          setCourse(foundCourse)
        } else {
          setError("Curso no encontrado")
        }
      } catch (err) {
        setError("Error al cargar los datos del curso")
        console.error("Error fetching course data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId])

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPaymentFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number.parseFloat(value) : value,
    }))
  }

  const handlePaymentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentId(e.target.value)
  }

  const resetPaymentForm = () => {
    setPaymentFormData({
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
    })
  }

  const handleEnrollOpenChange = (open: boolean) => {
    setEnrollOpen(open)
    if (!open) {
      setPaymentId("")
      setError(null)
      setSuccess(null)
    }
  }

  const handlePaymentOpenChange = (open: boolean) => {
    setPaymentOpen(open)
    if (!open) {
      resetPaymentForm()
      setError(null)
      setSuccess(null)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const paymentData = {
        userID: userId,
        amount: paymentFormData.amount,
        paymentDate: paymentFormData.paymentDate,
      }

      const newPayment = await createPayment(paymentData)
      if (newPayment) {
        setSuccess(`Pago realizado con éxito. ID de pago: ${newPayment.id}`)
        setPaymentId(newPayment.id.toString())

        setTimeout(() => {
          setPaymentOpen(false)
          // Volvemos a abrir el diálogo de inscripción
          setEnrollOpen(true)
        }, 2000)
      }
    } catch (err) {
      setError("Error al realizar el pago. Por favor, intenta de nuevo.")
      console.error("Error creating payment:", err)
    }
  }

  const handleEnroll = async () => {
    if (!course) return

    setEnrolling(true)
    setError(null)
    setSuccess(null)

    try {
      // Validar que se haya ingresado un ID de pago si el curso no es gratuito
      if (course.price > 0 && !paymentId) {
        throw new Error("Debes ingresar un ID de pago para inscribirte en este curso.")
      }

      const enrollmentData = {
        userId,
        courseId,
        enrollmentDate: new Date().toISOString().split("T")[0],
        paymentId: paymentId ? Number.parseInt(paymentId) : undefined,
      }

      await enrollInCourse(enrollmentData)
      setSuccess("¡Te has inscrito exitosamente en este curso!")

      // Redirigir a mis cursos después de 2 segundos
      setTimeout(() => {
        router.push("/mis-cursos")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Error al inscribirse en el curso")
      console.error("Error enrolling in course:", err)
    } finally {
      setEnrolling(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return <div className="text-center py-10">Cargando detalles del curso...</div>
  }

  if (!course) {
    return (
      <div className="container mx-auto py-10">
        <ErrorMessage message="Curso no encontrado" />
        <div className="mt-4 text-center">
          <Button onClick={() => router.push("/cursos")}>Volver a Cursos</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/cursos")} className="mb-4">
          ← Volver a Cursos
        </Button>
        <h1 className="text-3xl font-bold">{course.title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Descripción del Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">{course.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  <span>{course.durationInHours || 0} horas</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <span>Publicado: {formatDate(course.publicationDate)}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  <span>Instructor: {course.instructor.username}</span>
                </div>
                <div className="flex items-center">
                  <Book className="h-5 w-5 mr-2 text-primary" />
                  <span>Categoría: {course.category.name}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    course.status === "activo"
                      ? "bg-green-100 text-green-800"
                      : course.status === "inactivo"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {course.status}
                </span>
                {course.difficultyLevel && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.difficultyLevel === "BEGINNER"
                        ? "bg-blue-100 text-blue-800"
                        : course.difficultyLevel === "INTERMEDIATE"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {course.difficultyLevel === "BEGINNER"
                      ? "Principiante"
                      : course.difficultyLevel === "INTERMEDIATE"
                        ? "Intermedio"
                        : "Avanzado"}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Inscripción</CardTitle>
              <CardDescription>Inscríbete en este curso para comenzar tu aprendizaje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Precio:</span>
                  <span className="text-xl font-bold flex items-center">
                    <DollarSign className="h-5 w-5" />
                    {course.price === 0 ? "Gratis" : course.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Calificación:</span>
                  <span className="font-bold">{course.average_grade}/5</span>
                </div>
              </div>

              <Dialog open={enrollOpen} onOpenChange={handleEnrollOpenChange}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Inscribirme
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Inscripción en {course.title}</DialogTitle>
                    <DialogDescription>
                      {course.price === 0
                        ? "Este curso es gratuito. Puedes inscribirte inmediatamente."
                        : "Este curso requiere un pago. Ingresa el ID de un pago existente o realiza un nuevo pago."}
                    </DialogDescription>
                  </DialogHeader>

                  {error && <ErrorMessage message={error} />}
                  {success && <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">{success}</div>}

                  {course.price > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold">Precio del curso:</span>
                        <span className="font-bold">${course.price.toFixed(2)}</span>
                      </div>

                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="paymentId" className="mb-2 block">
                            ID de Pago
                          </Label>
                          <Input
                            id="paymentId"
                            type="number"
                            placeholder="Ingresa el ID de un pago existente"
                            value={paymentId}
                            onChange={handlePaymentIdChange}
                          />
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-gray-500 mb-2">- o -</p>
                        </div>

                        <Dialog open={paymentOpen} onOpenChange={handlePaymentOpenChange}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              Realizar un Nuevo Pago
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Realizar Nuevo Pago</DialogTitle>
                              <DialogDescription>
                                Completa los detalles del pago para poder inscribirte en cursos de pago.
                              </DialogDescription>
                            </DialogHeader>
                            {error && <ErrorMessage message={error} />}
                            {success && (
                              <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">{success}</div>
                            )}
                            <form onSubmit={handlePaymentSubmit}>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="amount">Monto</Label>
                                  <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    value={paymentFormData.amount}
                                    onChange={handlePaymentInputChange}
                                    required
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="paymentDate">Fecha de Pago</Label>
                                  <Input
                                    id="paymentDate"
                                    name="paymentDate"
                                    type="date"
                                    value={paymentFormData.paymentDate}
                                    onChange={handlePaymentInputChange}
                                    required
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit">Realizar Pago</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    <Button onClick={handleEnroll} disabled={enrolling || (course.price > 0 && !paymentId)}>
                      {enrolling ? "Inscribiendo..." : "Confirmar Inscripción"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {course.price > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Este curso requiere un pago. Asegúrate de tener un pago registrado antes de inscribirte.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
