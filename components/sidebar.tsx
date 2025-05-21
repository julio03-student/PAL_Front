"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Book, Layers, Users, Home, Settings, Search } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-0 left-0 z-30 w-64 h-screen pt-28 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0">
      <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
        <ul className="space-y-2 font-medium">
          <li>
            <Link
              href="/"
              className={`flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 ${
                pathname === "/" ? "bg-gray-100" : ""
              }`}
            >
              <Home className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
              <span className="ml-3">Inicio</span>
            </Link>
          </li>
          <li>
            <Link
              href="/cursos"
              className={`flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 ${
                pathname === "/cursos" ? "bg-gray-100" : ""
              }`}
            >
              <Book className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
              <span className="ml-3">Cursos</span>
            </Link>
          </li>
          <li>
            <Link
              href="/cursos/buscar"
              className={`flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 ${
                pathname.includes("/cursos/buscar") ? "bg-gray-100" : ""
              }`}
            >
              <Search className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
              <span className="ml-3">Buscar Cursos</span>
            </Link>
          </li>
          <li>
            <Link
              href="/categorias"
              className={`flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 ${
                pathname.includes("/categorias") ? "bg-gray-100" : ""
              }`}
            >
              <Layers className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
              <span className="ml-3">Categorías</span>
            </Link>
          </li>
          <li>
            <Link
              href="/usuarios"
              className={`flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 ${
                pathname.includes("/usuarios") ? "bg-gray-100" : ""
              }`}
            >
              <Users className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
              <span className="ml-3">Usuarios</span>
            </Link>
          </li>
          <li>
            <Link
              href="/configuracion"
              className={`flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 ${
                pathname.includes("/configuracion") ? "bg-gray-100" : ""
              }`}
            >
              <Settings className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" />
              <span className="ml-3">Configuración</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  )
}
