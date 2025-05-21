"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  type CourseSearchParams,
  type CourseSearchResult,
  type DifficultyLevel,
  type PriceFilter,
  type SortBy,
  type SortDirection,
  searchCourses,
} from "@/lib/api"
import { Search, Clock, Calendar } from "lucide-react"

export default function SearchCoursesPage() {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }))
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
