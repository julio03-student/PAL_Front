"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { type Category, getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api"
import { Edit, Trash2, Plus, Layers } from "lucide-react"
import { ErrorMessage } from "@/components/error-message"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const data = await getCategories()
        setCategories(data)
        setError(null)
      } catch (err) {
        setError("Error al cargar las categorías. Por favor, intenta de nuevo más tarde.")
        console.error("Error fetching categories:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      setEditingCategory(null)
      setCategoryName("")
      setError(null)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      try {
        const success = await deleteCategory(id)
        if (success) {
          setCategories(categories.filter((category) => category.id !== id))
          setError(null)
        } else {
          setError("No se pudo eliminar la categoría. Por favor, intenta de nuevo.")
        }
      } catch (err) {
        setError("Error al eliminar la categoría. Por favor, intenta de nuevo más tarde.")
        console.error("Error deleting category:", err)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (editingCategory) {
        const updatedCategory = await updateCategory(editingCategory.id, categoryName)
        if (updatedCategory) {
          setCategories(categories.map((category) => (category.id === editingCategory.id ? updatedCategory : category)))
          setOpen(false)
          setEditingCategory(null)
          setCategoryName("")
        } else {
          setError("No se pudo actualizar la categoría. Por favor, intenta de nuevo.")
        }
      } else {
        const newCategory = await createCategory(categoryName)
        if (newCategory) {
          setCategories([...categories, newCategory])
          setOpen(false)
          setCategoryName("")
        } else {
          setError("No se pudo crear la categoría. Por favor, intenta de nuevo.")
        }
      }
    } catch (err) {
      setError(
        `Error al ${editingCategory ? "actualizar" : "crear"} la categoría. Por favor, intenta de nuevo más tarde.`,
      )
      console.error(`Error ${editingCategory ? "updating" : "creating"} category:`, err)
    }
  }

  if (loading) {
    return <div className="text-center py-10">Cargando categorías...</div>
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mt-2">Categorías</h1>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Editar Categoría" : "Crear Nueva Categoría"}</DialogTitle>
                <DialogDescription>Ingresa el nombre de la categoría a continuación.</DialogDescription>
              </DialogHeader>
              {error && <ErrorMessage message={error} />}
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Nombre de la categoría"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingCategory ? "Actualizar" : "Crear"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <ErrorMessage message={error} className="mb-6" />}

      {categories.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No hay categorías disponibles. Crea una nueva para comenzar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-primary" />
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">ID: {category.id}</p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 pt-0">
                <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
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
