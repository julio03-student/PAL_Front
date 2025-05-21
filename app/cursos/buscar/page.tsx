"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  type CourseSearchParams,
  type CourseSearchResult,
  type DifficultyLevel,
  type PriceFilter,
  type SortBy,
  type SortDirection,
  searchCourses,
  enrollInCourse,
  createPayment,
} from "@/lib/api"
import { Search, Clock, Calendar, GraduationCap, Book } from "lucide-react"
import { ErrorMessage } from "@/components/error-message"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SearchCoursesPage() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<CourseSearchParams>({
    query: "",
    priceFilter: "ALL",
    difficultyLevel: "ALL",
    sortBy: "RELEVANCE",
    sortDirection: "ASC",
    page: 0,
    pageSize: 10,
  })

  const [searchResults, setSearchResults] = useState<CourseSearchResult>({
    courses: [],
    totalResults: 0,
    page: 0,
    pageSize: 10,
    totalPages: 0,
  })

  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null)
  const [paymentId, setPaymentId] = useState<string>("")
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const userId = process.env.NEXT_PUBLIC_USER_ID ? Number.parseInt(process.env.NEXT_PUBLIC_USER_ID) : 2

  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
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
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setLoading(true)
    try {
      const results = await searchCourses(searchParams)
      setSearchResults(results)
      setSearched(true)
    } catch (error) {
      console.error("Error searching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({
      ...prev,
      page: newPage,
    }))
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

  const resetPaymentForm = () => {
    setPaymentFormData({
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
    })
  }

  const handleEnroll = (course: any) => {
    setSelectedCourse(course)
    setEnrollOpen(true)
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

  useEffect(() => {
    if (searched) {
      handleSearch()
    }
  }, [searchParams.page, searchParams.pageSize])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6 mt-2">Buscar Cursos</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
          <CardDescription>Encuentra el curso perfecto para ti</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="query">Buscar</Label>
                <div className="relative">
                  <Input
                    id="query"
                    name="query"
                    placeholder="Nombre del curso, descripción..."
                    value={searchParams.query}
                    onChange={handleInputChange}
                  />
                  <Button type="submit" size="sm" className="absolute right-1 top-1 h-7" disabled={loading}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priceFilter">Precio</Label>
                <Select
                  value={searchParams.priceFilter}
                  onValueChange={(value) => handleSelectChange("priceFilter", value as PriceFilter)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por precio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los precios</SelectItem>
                    <SelectItem value="FREE">Gratis</SelectItem>
                    <SelectItem value="PAID">De pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="difficultyLevel">Nivel de Dificultad</Label>
                <Select
                  value={searchParams.difficultyLevel}
                  onValueChange={(value) => handleSelectChange("difficultyLevel", value as DifficultyLevel)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los niveles</SelectItem>
                    <SelectItem value="BEGINNER">Principiante</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                    <SelectItem value="ADVANCED">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sortBy">Ordenar por</Label>
                <Select
                  value={searchParams.sortBy}
                  onValueChange={(value) => handleSelectChange("sortBy", value as SortBy)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RELEVANCE">Relevancia</SelectItem>
                    <SelectItem value="PRICE">Precio</SelectItem>
                    <SelectItem value="DATE">Fecha</SelectItem>
                    <SelectItem value="RATING">Calificación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sortDirection">Dirección</Label>
                <Select
                  value={searchParams.sortDirection}
                  onValueChange={(value) => handleSelectChange("sortDirection", value as SortDirection)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Dirección" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASC">Ascendente</SelectItem>
                    <SelectItem value="DESC">Descendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Buscando..." : "Buscar Cursos"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

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

      {searched && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Resultados ({searchResults.totalResults})</h2>
          </div>

          {searchResults.courses.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No se encontraron cursos que coincidan con tu búsqueda.</p>
              <p className="text-gray-500 mt-2">Intenta con otros términos o filtros.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {searchResults.courses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription>Categoría: {course.category.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-2">{course.description}</p>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">
                          {course.price === 0 ? "Gratis" : `$${course.price.toFixed(2)}`}
                        </span>
                        {course.averageGrade && (
                          <span className="font-medium">Calificación: {course.averageGrade}/5</span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{course.durationInHours} horas</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(course.publicationDate)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
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

              {/* Paginación */}
              {searchResults.totalPages > 1 && (
                <div className="flex justify-center space-x-2 mb-8">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(searchResults.page - 1)}
                    disabled={searchResults.page === 0}
                  >
                    Anterior
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: searchResults.totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={i === searchResults.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(i)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(searchResults.page + 1)}
                    disabled={searchResults.page === searchResults.totalPages - 1}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
