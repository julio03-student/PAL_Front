// Constante para la URL base de la API
const API_BASE_URL = "/api"

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
}

export interface Payment {
  id: number
  user: User
  amount: number
  paymentDate: string
}

export interface Enrollment {
  id: number
  user: User
  course: Course
  enrollmentDate: string
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
      method: "POST", // Cambiado de GET a POST
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

// Funciones para pagos
export async function createPayment(paymentData: {
  userID: number
  amount: number
  paymentDate: string
}): Promise<Payment | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error al crear pago. Status:", response.status, "Respuesta:", errorText)
      throw new Error(`Error al crear pago: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return data.data ? data.data[0] : null
  } catch (error) {
    console.error("Error creating payment:", error)
    return null
  }
}

export async function getPayments(): Promise<Payment[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/all`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching payments:", error)
    return []
  }
}

export async function getPaymentById(id: number): Promise<Payment | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/${id}`)
    const data = await response.json()
    return data.data ? data.data[0] : null
  } catch (error) {
    console.error("Error fetching payment:", error)
    return null
  }
}

// Funciones para inscripciones
export async function enrollInCourse(enrollmentData: {
  userId: number
  courseId: number
  enrollmentDate: string
  paymentId?: number
}): Promise<Enrollment | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/enrollments/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enrollmentData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Error al inscribirse en el curso")
    }

    const data = await response.json()
    return data.data ? data.data[0] : null
  } catch (error) {
    console.error("Error enrolling in course:", error)
    throw error
  }
}

export async function getMyEnrollments(userId: number): Promise<Enrollment[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/enrollments/my-courses?userId=${userId}`)
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    return []
  }
}
