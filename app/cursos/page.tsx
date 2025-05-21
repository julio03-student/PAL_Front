"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  type Content,
  getCourses,
  getCategories,
  getUsers,
  createCourse,
  updateCourse,
  deleteCourse,
  getContentsByCourse,
  downloadContent,
  uploadContent,
  deleteContent,
} from "@/lib/api"
import { Edit, Trash2, Plus, Clock, Calendar, FileText, Download, Upload } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [instructors, setInstructors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [downloadingContent, setDownloadingContent] = useState<number | null>(null)
  const [uploadingContent, setUploadingContent] = useState(false)
  const [newContentFile, setNewContentFile] = useState<File | null>(null)
  const [newContentType, setNewContentType] = useState("DOCUMENTO")

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [coursesData, categoriesData, usersData] = await Promise.all([getCourses(), getCategories(), getUsers()])
      
      // Cargar contenidos para cada curso
      const coursesWithContents = await Promise.all(
        coursesData.map(async (course) => {
          const contents = await getContentsByCourse(course.id)
          return { ...course, contents }
        })
      )
      
      setCourses(coursesWithContents)
      setCategories(categoriesData)
      setInstructors(usersData)
      setLoading(false)
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

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      resetForm()
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDownloadContent = async (contentId: number) => {
    try {
      setDownloadingContent(contentId)
      await downloadContent(contentId)
    } catch (error) {
      console.error('Error al descargar el archivo:', error)
      alert('Error al descargar el archivo')
    } finally {
      setDownloadingContent(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewContentFile(e.target.files[0])
    }
  }

  const handleUploadContent = async (courseId: number) => {
    if (!newContentFile) return

    try {
      setUploadingContent(true)
      const content = await uploadContent({
        file: newContentFile,
        type: newContentType,
        courseId,
      })

      if (content) {
        setCourses(courses.map(course => {
          if (course.id === courseId) {
            return {
              ...course,
              contents: [...(course.contents || []), content]
            }
          }
          return course
        }))
        setNewContentFile(null)
        setNewContentType("DOCUMENTO")
      }
    } catch (error) {
      console.error('Error al subir el contenido:', error)
      alert('Error al subir el contenido')
    } finally {
      setUploadingContent(false)
    }
  }

  const handleDeleteContent = async (courseId: number, contentId: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este contenido?")) {
      const success = await deleteContent(contentId)
      if (success) {
        setCourses(courses.map(course => {
          if (course.id === courseId) {
            return {
              ...course,
              contents: course.contents?.filter(content => content.id !== contentId) || []
            }
          }
          return course
        }))
      }
    }
  }

  if (loading) {
    return <LoadingSpinner />
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

              {/* Sección de Contenidos */}
              {editingCourse && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Contenidos del Curso</h3>
                  
                  {/* Lista de contenidos existentes */}
                  {editingCourse.contents && editingCourse.contents.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {editingCourse.contents.map((content) => (
                        <div key={content.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            <span className="text-sm">{content.type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadContent(content.id)}
                              disabled={downloadingContent === content.id}
                            >
                              {downloadingContent === content.id ? (
                                <div className="h-4 w-4">
                                  <LoadingSpinner />
                                </div>
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteContent(editingCourse.id, content.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulario para agregar nuevo contenido */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contentType">Tipo de Contenido</Label>
                        <Select
                          value={newContentType}
                          onValueChange={setNewContentType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DOCUMENTO">Documento</SelectItem>
                            <SelectItem value="VIDEO">Video</SelectItem>
                            <SelectItem value="IMAGEN">Imagen</SelectItem>
                            <SelectItem value="AUDIO">Audio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="contentFile">Archivo</Label>
                        <Input
                          id="contentFile"
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.mp4,.jpg,.jpeg,.png,.mp3"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleUploadContent(editingCourse.id)}
                      disabled={!newContentFile || uploadingContent}
                      className="w-full"
                    >
                      {uploadingContent ? (
                        <div className="h-4 w-4 mr-2">
                          <LoadingSpinner />
                        </div>
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Subir Contenido
                    </Button>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="submit">{editingCourse ? "Actualizar" : "Crear"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                  <span className="font-medium">Precio: ${course.price.toFixed(2)}</span>
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
                
                {/* Sección de Contenidos */}
                {course.contents && course.contents.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Contenidos del Curso:</h4>
                    <div className="space-y-2">
                      {course.contents.map((content) => (
                        <div 
                          key={content.id} 
                          className="flex items-center justify-between text-sm text-gray-600 hover:bg-gray-50 p-2 rounded-md cursor-pointer transition-colors"
                          onClick={() => handleDownloadContent(content.id)}
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            <span>{content.type}</span>
                          </div>
                          {downloadingContent === content.id ? (
                            <div className="h-4 w-4">
                              <LoadingSpinner />
                            </div>
                          ) : (
                            <Download className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
