"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Checkbox } from "@/components/ui/checkbox"
import { type Exam, type Question, getExamById, createAnswer, getQuestions } from "@/lib/api"
import { Plus, ArrowLeft } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useLoading } from "@/hooks/use-loading"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ExamDetailPage() {
  const params = useParams()
  const examId = Number(params.id)

  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [open, setOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)

  const [formData, setFormData] = useState({
    text: "",
    correct: false,
  })

  const { isLoading, withLoading } = useLoading()

  useEffect(() => {
    const fetchData = async () => {
      if (examId) {
        const [examData, questionsData] = await Promise.all([
          withLoading(() => getExamById(examId)),
          withLoading(getQuestions) || [],
        ])

        if (examData) {
          setExam(examData)
          // Filter questions that belong to this exam
          const examQuestions = questionsData.filter((q) => q.examId === examId)
          setQuestions(examQuestions)
        }
      }
    }

    fetchData()
  }, [examId, withLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      correct: checked,
    }))
  }

  const resetForm = () => {
    setFormData({
      text: "",
      correct: false,
    })
    setSelectedQuestion(null)
  }

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedQuestion) {
      const answerData = {
        question: { id: selectedQuestion.id },
        text: formData.text,
        correct: formData.correct,
      }

      const newAnswer = await withLoading(() => createAnswer(answerData))

      if (newAnswer) {
        // Refresh the exam data to show the new answer
        const updatedExam = await withLoading(() => getExamById(examId))
        if (updatedExam) {
          setExam(updatedExam)
        }

        setOpen(false)
        resetForm()
      }
    }
  }

  if (!exam && !isLoading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-gray-500">Examen no encontrado.</p>
        <Link href="/examenes">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Exámenes
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/examenes">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{exam?.title || "Cargando..."}</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="mb-8">
            <Card className="bg-primary-50">
              <CardHeader>
                <CardTitle className="text-primary-800">Detalles del Examen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  <span className="font-medium">Curso:</span> {exam?.courseId}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Número de Preguntas:</span> {exam?.questions.length || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Preguntas y Respuestas</h2>
            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button className="bg-accent-600 hover:bg-accent-700" disabled={!exam || exam.questions.length === 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Respuesta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Añadir Respuesta</DialogTitle>
                    <DialogDescription>Selecciona una pregunta y añade una respuesta.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="question">Pregunta</Label>
                      <select
                        id="question"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={selectedQuestion?.id || ""}
                        onChange={(e) => {
                          const questionId = Number(e.target.value)
                          const question = exam?.questions.find((q) => q.id === questionId) || null
                          setSelectedQuestion(question)
                        }}
                        required
                      >
                        <option value="">Selecciona una pregunta</option>
                        {exam?.questions.map((question) => (
                          <option key={question.id} value={question.id}>
                            {question.text}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="text">Respuesta</Label>
                      <Input id="text" name="text" value={formData.text} onChange={handleInputChange} required />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="correct" checked={formData.correct} onCheckedChange={handleCheckboxChange} />
                      <Label htmlFor="correct">Es la respuesta correcta</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-accent-600 hover:bg-accent-700"
                      disabled={isLoading || !selectedQuestion}
                    >
                      Añadir
                      {isLoading && <LoadingSpinner className="ml-2" />}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {exam?.questions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No hay preguntas disponibles para este examen.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {exam?.questions.map((question) => (
                <Card key={question.id} className="overflow-hidden">
                  <CardHeader className="pb-2 bg-secondary-100">
                    <CardTitle className="text-secondary-800">{question.text}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <h3 className="font-medium mb-2">Respuestas:</h3>
                    <ul className="space-y-2 pl-5 list-disc">
                      {/* Here we would map through answers if we had them in the API response */}
                      <li className="text-gray-500">No hay respuestas disponibles para esta pregunta.</li>
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
