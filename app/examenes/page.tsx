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
import { type Exam, type Course, getExams, getCourses, createExam, deleteExam } from "@/lib/api"
import { Trash2, Plus, FileText } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useLoading } from "@/hooks/use-loading"
import Link from "next/link"

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [open, setOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    courseId: 0,
    questions: [{ text: "", examId: 0 }],
  })

  const { isLoading, withLoading } = useLoading()

  useEffect(() => {
    const fetchData = async () => {
      const [examsData, coursesData] = await Promise.all([withLoading(getExams) || [], withLoading(getCourses) || []])
      setExams(examsData)
      setCourses(coursesData)
    }

    fetchData()
  }, [withLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "courseId" ? Number.parseInt(value) : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "courseId" ? Number.parseInt(value) : value,
    }))
  }

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions[index] = { ...updatedQuestions[index], text: value }
    setFormData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }))
  }

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { text: "", examId: 0 }],
    }))
  }

  const removeQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      const updatedQuestions = [...formData.questions]
      updatedQuestions.splice(index, 1)
      setFormData((prev) => ({
        ...prev,
        questions: updatedQuestions,
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      courseId: 0,
      questions: [{ text: "", examId: 0 }],
    })
  }

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este examen?")) {
      const success = await withLoading(() => deleteExam(id))
      if (success) {
        setExams(exams.filter((exam) => exam.id !== id))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newExam = await withLoading(() => createExam(formData))

    if (newExam) {
      setExams([...exams, newExam])
      setOpen(false)
      resetForm()
    }
  }

  const getCourseTitle = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId)
    return course ? course.title : "Curso no encontrado"
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mt-2">Exámenes</h1>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-primary-600 hover:bg-primary-700" disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Examen
              {isLoading && <LoadingSpinner className="ml-2" />}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Examen</DialogTitle>
                <DialogDescription>Completa los detalles del examen a continuación.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="courseId">Curso</Label>
                    <Select
                      value={formData.courseId.toString()}
                      onValueChange={(value) => handleSelectChange("courseId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label>Preguntas</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addQuestion}
                      className="text-accent-600 border-accent-600 hover:bg-accent-100"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Añadir Pregunta
                    </Button>
                  </div>
                  {formData.questions.map((question, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <Textarea
                        placeholder={`Pregunta ${index + 1}`}
                        value={question.text}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        required
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        disabled={formData.questions.length <= 1}
                        className="mt-1 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-primary-600 hover:bg-primary-700" disabled={isLoading}>
                  Crear
                  {isLoading && <LoadingSpinner className="ml-2" />}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No hay exámenes disponibles. Crea uno nuevo para comenzar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="overflow-hidden">
              <CardHeader className="pb-2 bg-primary-100">
                <CardTitle className="text-primary-800">{exam.title}</CardTitle>
                <CardDescription>Curso: {getCourseTitle(exam.courseId)}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Preguntas:</span> {exam.questions.length}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between space-x-2 pt-0">
                <Link href={`/examenes/${exam.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-secondary-600 border-secondary-600 hover:bg-secondary-100"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Ver Detalles
                  </Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(exam.id)} disabled={isLoading}>
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
