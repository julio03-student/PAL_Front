// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10)
const UPLOAD_MAX_SIZE = parseInt(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE || '10485760', 10)

// Tipos de datos
export interface Role {
  id: number
  name: string
}

export interface User {
  id: number
  username: string
  email: string
  password?: string
  roles: Role[]
}

export interface Category {
  id: number
  name: string
}

export interface Content {
  id: number
  type: string
  courseId: number
  fileUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Course {
  id: number
  title: string
  description: string
  category: Category
  price: number
  instructor: User
  status: string
  average_grade: number
  difficultyLevel?: string
  publicationDate?: string
  durationInHours?: number
  contents?: Content[]
}

export type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL"
export type PriceFilter = "FREE" | "PAID" | "ALL"
export type SortBy = "PRICE" | "DATE" | "RATING" | "RELEVANCE"
export type SortDirection = "ASC" | "DESC"

export interface CourseSearchParams {
  query?: string
  priceFilter?: PriceFilter
  difficultyLevel?: DifficultyLevel
  sortBy?: SortBy
  sortDirection?: SortDirection
  page?: number
  pageSize?: number
}

export interface CourseSearchResult {
  courses: {
    id: number
    title: string
    description: string
    category: Category
    price: number
    isFree: boolean | null
    difficultyLevel: string
    instructorName: string | null
    averageRating: number | null
    averageGrade: number | null
    publicationDate: string
    durationInHours: number
  }[]
  totalResults: number
  page: number
  pageSize: number
  totalPages: number
}

// Función para validar el tamaño del archivo
const validateFileSize = (file: File): boolean => {
  return file.size <= UPLOAD_MAX_SIZE
}

// Funciones para usuarios
export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/all`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export async function createUser(userData: {
  username: string
  email: string
  password: string
  roles: string[]
}): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()
    return data.data ? data.data[0] : null
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

// Funciones para categorías
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/all`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function createCategory(name: string): Promise<Category | null> {
  try {
    console.log("Enviando solicitud para crear categoría:", { name })

    const response = await fetch(`${API_BASE_URL}/categories/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error al crear categoría. Status:", response.status, "Respuesta:", errorText)
      throw new Error(`Error al crear categoría: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log("Respuesta de crear categoría:", data)
    return data.data ? data.data[0] : null
  } catch (error) {
    console.error("Error creating category:", error)
    return null
  }
}

export async function updateCategory(id: number, name: string): Promise<Category | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })

    const data = await response.json()
    return data.data ? data.data[0] : null
  } catch (error) {
    console.error("Error updating category:", error)
    return null
  }
}

export async function deleteCategory(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/delete/${id}`, {
      method: "DELETE",
    })

    return response.status === 204
  } catch (error) {
    console.error("Error deleting category:", error)
    return false
  }
}

// Funciones para cursos
export async function getCourses(): Promise<Course[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/all`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching courses:", error)
    return []
  }
}

export async function searchCourses(params: CourseSearchParams): Promise<CourseSearchResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    const data = await response.json()
    return data || { courses: [], totalResults: 0, page: 0, pageSize: 10, totalPages: 0 }
  } catch (error) {
    console.error("Error searching courses:", error)
    return { courses: [], totalResults: 0, page: 0, pageSize: 10, totalPages: 0 }
  }
}

export async function createCourse(courseData: {
  title: string
  category: string
  instructorId: number
  description: string
  price: number
  status: string
  average_grade: number
  difficultyLevel?: string
  publicationDate?: string
  durationInHours?: number
}): Promise<Course | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    })

    const data = await response.json()
    return data.data ? data.data[0] : null
  } catch (error) {
    console.error("Error creating course:", error)
    return null
  }
}

export async function updateCourse(
  id: number,
  courseData: {
    title: string
    category: string
    instructorId: number
    description: string
    price: number
    status: string
    average_grade: number
    difficultyLevel?: string
    publicationDate?: string
    durationInHours?: number
  },
): Promise<Course | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    })

    const data = await response.json()
    return data.data ? data.data[0] : null
  } catch (error) {
    console.error("Error updating course:", error)
    return null
  }
}

export async function deleteCourse(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/delete/${id}`, {
      method: "DELETE",
    })

    return response.status === 204
  } catch (error) {
    console.error("Error deleting course:", error)
    return false
  }
}

// Funciones para contenido
export async function getContentsByCourse(courseId: number): Promise<Content[]> {
  try {
    console.log("Enviando solicitud para obtener contenido del curso:", courseId)
    const response = await fetch(`${API_BASE_URL}/content/course/${courseId}`)
    const data = await response.json()
    console.log("Respuesta de obtener contenido del curso:", data)
    return data.data || []
  } catch (error) {
    console.error("Error fetching contents:", error)
    return []
  }
}

export async function uploadContent(contentData: {
  file: File
  type: string
  courseId: number
}): Promise<Content | null> {
  try {
    if (!validateFileSize(contentData.file)) {
      throw new Error(`El archivo excede el tamaño máximo permitido de ${UPLOAD_MAX_SIZE / 1024 / 1024}MB`)
    }

    const formData = new FormData()
    formData.append('file', contentData.file)
    formData.append('type', contentData.type)
    formData.append('courseId', contentData.courseId.toString())

    const response = await fetch(`${API_BASE_URL}/content/update`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    return data.data ? data.data[0] : null
  } catch (error) {
    console.error("Error uploading content:", error)
    return null
  }
}

export async function deleteContent(contentId: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/content/delete/${contentId}`, {
      method: 'DELETE',
    })

    return response.status === 204
  } catch (error) {
    console.error("Error deleting content:", error)
    return false
  }
}

export async function downloadContent(contentId: number): Promise<void> {
  try {
    // Abrir el endpoint de descarga en una nueva ventana/pestaña
    window.open(`${API_BASE_URL}/content/download/${contentId}`, '_blank')
  } catch (error) {
    console.error("Error downloading content:", error)
    throw new Error('Error al descargar el archivo')
  }
}
