"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  type Course,
  type Category,
  type User,
  getCourses,
  getCategories,
  getUsers,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  createPayment,
} from "@/lib/api"
import { Edit, Trash2, Plus, Clock, Calendar, Book, GraduationCap } from "lucide-react"
import Link from "next/link"
import { ErrorMessage } from "@/components/error-message"

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [instructors, setInstructors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [paymentId, setPaymentId] = useState<string>("")
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const userId = process.env.NEXT_PUBLIC_USER_ID ? Number.parseInt(process.env.NEXT_PUBLIC_USER_ID) : 2

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    instructorId: 0,
    description: "",
    price: 0,
    status: "activo",
    average_grade: 0,
    difficultyLevel: "BEGINNER",
    publicationDate: new Date().toISOString().split("T")[0] + "T00:00:00",
    durationInHours: 0,
  })

  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [coursesData, categoriesData, usersData] = await Promise.all([getCourses(), getCategories(), getUsers()])
        setCourses(coursesData)
        setCategories(categoriesData)
        setInstructors(usersData)
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "average_grade" || name === "durationInHours" ? Number.parseFloat(value) : value,
    }))
  }

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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "instructorId" ? Number.parseInt(value) : value,
    }))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      instructorId: 0,
      description: "",
      price: 0,
      status: "activo",
      average_grade: 0,
      difficultyLevel: "BEGINNER",
      publicationDate: new Date().toISOString().split("T")[0] + "T00:00:00",
      durationInHours: 0,
    })
    setEditingCourse(null)
  }

  const resetPaymentForm = () => {
    setPaymentFormData({
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
    })
  }

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleEnrollOpenChange = (open: boolean) => {
    setEnrollOpen(open)
    if (!open) {
      setSelectedCourse(null)
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

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      category: course.category.name,
      instructorId: course.instructor.id,
      description: course.description,
      price: course.price,
      status: course.status,
      average_grade: course.average_grade,
      difficultyLevel: course.difficultyLevel || "BEGINNER",
      publicationDate: course.publicationDate || new Date().toISOString().split("T")[0] + "T00:00:00",
      durationInHours: course.durationInHours || 0,
    })
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este curso?")) {
      const success = await deleteCourse(id)
      if (success) {
        setCourses(courses.filter((course) => course.id !== id))
      }
    }
  }

  const handleEnroll = (course: Course) => {
    setSelectedCourse(course)
    setEnrollOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCourse) {
      const updatedCourse = await updateCourse(editingCourse.id, formData)
      if (updatedCourse) {
        setCourses(courses.map((course) => (course.id === editingCourse.id ? updatedCourse : course)))
      }
    } else {
      const newCourse = await createCourse(formData)
      if (newCourse) {
        setCourses([...courses, newCourse])
      }
    }

    setOpen(false)
    resetForm()
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

  const handleEnrollSubmit = async () => {
    if (!selectedCourse) return

    setEnrolling(true)
    setError(null)
    setSuccess(null)

    try {
      // Validar que se haya ingresado un ID de pago si el curso no es gratuito
      if (selectedCourse.price > 0 && !paymentId) {
        throw new Error("Debes ingresar un ID de pago para inscribirte en este curso.")
      }

      const enrollmentData = {
        userId,
        courseId: selectedCourse.id,
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
    return <div className="text-center py-10">Cargando cursos...</div>
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mt-2">Cursos</h1>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingCourse ? "Editar Curso" : "Crear Nuevo Curso"}</DialogTitle>
                <DialogDescription>Completa los detalles del curso a continuación.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="instructor">Instructor</Label>
                    <Select
                      value={formData.instructorId.toString()}
                      onValueChange={(value) => handleSelectChange("instructorId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id.toString()}>
                            {instructor.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="average_grade">Calificación Promedio</Label>
                    <Input
                      id="average_grade"
                      name="average_grade"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.average_grade}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="difficultyLevel">Nivel de Dificultad</Label>
                    <Select
                      value={formData.difficultyLevel}
                      onValueChange={(value) => handleSelectChange("difficultyLevel", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Principiante</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                        <SelectItem value="ADVANCED">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="durationInHours">Duración (horas)</Label>
                    <Input
                      id="durationInHours"
                      name="durationInHours"
                      type="number"
                      min="1"
                      value={formData.durationInHours}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="publicationDate">Fecha de Publicación</Label>
                  <Input
                    id="publicationDate"
                    name="publicationDate"
                    type="datetime-local"
                    value={formData.publicationDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingCourse ? "Actualizar" : "Crear"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Diálogo de inscripción */}
      <Dialog open={enrollOpen} onOpenChange={handleEnrollOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscripción en {selectedCourse?.title}</DialogTitle>
            <DialogDescription>
              {selectedCourse?.price === 0
                ? "Este curso es gratuito. Puedes inscribirte inmediatamente."
                : "Este curso requiere un pago. Ingresa el ID de un pago existente o realiza un nuevo pago."}
            </DialogDescription>
          </DialogHeader>

          {error && <ErrorMessage message={error} />}
          {success && <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">{success}</div>}

          {selectedCourse && selectedCourse.price > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Precio del curso:</span>
                <span className="font-bold">${selectedCourse.price.toFixed(2)}</span>
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
                    {success && <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">{success}</div>}
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
            <Button
              onClick={handleEnrollSubmit}
              disabled={enrolling || (selectedCourse && selectedCourse.price > 0 && !paymentId)}
            >
              {enrolling ? "Inscribiendo..." : "Confirmar Inscripción"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {courses.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No hay cursos disponibles. Crea uno nuevo para comenzar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>
                  Categoría: {course.category.name} | Instructor: {course.instructor.username}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3 mb-2">{course.description}</p>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">
                    Precio: {course.price === 0 ? "Gratis" : `$${course.price.toFixed(2)}`}
                  </span>
                  <span className="font-medium">Calificación: {course.average_grade}/5</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{course.durationInHours || 0} horas</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(course.publicationDate)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
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
              <CardFooter className="flex justify-end space-x-2 pt-0">
                <Button variant="outline" size="sm" onClick={() => handleEdit(course)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(course.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
                <Link href={`/cursos/${course.id}`}>
                  <Button variant="outline" size="sm">
                    <Book className="h-4 w-4 mr-1" />
                    Ver Detalle
                  </Button>
                </Link>
                <Button variant="default" size="sm" onClick={() => handleEnroll(course)}>
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Inscribirme
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
