"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Book, Layers, Users, Search, FileText } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-40">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Link href="/" className="flex ml-2 md:mr-24">
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-primary-700">
                PAL
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div className="px-3 py-2 border-t border-gray-200 lg:px-5 bg-gray-50">
        <div className="flex items-center space-x-4">
          <Link
            href="/cursos"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              pathname === "/cursos"
                ? "text-white bg-primary-600 hover:bg-primary-700"
                : "text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Book className="w-5 h-5 mr-2" />
            <span>Cursos</span>
          </Link>
          <Link
            href="/cursos/buscar"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              pathname.includes("/cursos/buscar")
                ? "text-white bg-primary-600 hover:bg-primary-700"
                : "text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Search className="w-5 h-5 mr-2" />
            <span>Buscar</span>
          </Link>
          <Link
            href="/categorias"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              pathname.includes("/categorias")
                ? "text-white bg-primary-600 hover:bg-primary-700"
                : "text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Layers className="w-5 h-5 mr-2" />
            <span>Categorías</span>
          </Link>
          <Link
            href="/usuarios"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              pathname.includes("/usuarios")
                ? "text-white bg-primary-600 hover:bg-primary-700"
                : "text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            <span>Usuarios</span>
          </Link>
          <Link
            href="/examenes"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
              pathname.includes("/examenes")
                ? "text-white bg-primary-600 hover:bg-primary-700"
                : "text-gray-900 hover:bg-gray-100"
            }`}
          >
            <FileText className="w-5 h-5 mr-2" />
            <span>Exámenes</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
