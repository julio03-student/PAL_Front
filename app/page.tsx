import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, Layers, Users } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6 mt-2">Portal Educativo</h1>
      <p className="text-gray-600 mb-8">
        Bienvenido al portal educativo para estudiantes e instructores. Aquí podrás gestionar cursos, categorías y
        usuarios, así como realizar inscripciones, exámenes y calificaciones.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/cursos">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Cursos</CardTitle>
              <Book className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gray-600">
                Gestiona los cursos disponibles, crea nuevos o actualiza los existentes.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/categorias">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Categorías</CardTitle>
              <Layers className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gray-600">
                Administra las categorías para organizar los cursos por temáticas.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/usuarios">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Usuarios</CardTitle>
              <Users className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gray-600">
                Gestiona los usuarios, tanto estudiantes como instructores.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
