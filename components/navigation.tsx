"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Book, Layers, Users, Home, Settings, Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/cursos", label: "Cursos", icon: Book },
    { href: "/cursos/buscar", label: "Buscar", icon: Search },
    { href: "/categorias", label: "Categorías", icon: Layers },
    { href: "/usuarios", label: "Usuarios", icon: Users },
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ]

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-40">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="sm:hidden mr-2">
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              <Link href="/" className="flex ml-2">
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap">
                  Portal Educativo
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 z-30 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto bg-pastel-blue bg-opacity-20">
          <ul className="space-y-2 font-medium">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-2 rounded-lg transition-colors duration-200 
                      ${
                        isActive
                          ? "bg-pastel-blue text-primary-700"
                          : "text-gray-700 hover:bg-pastel-blue hover:bg-opacity-50"
                      }`}
                    onClick={() => {
                      if (sidebarOpen) setSidebarOpen(false)
                    }}
                  >
                    <item.icon
                      className={`w-6 h-6 transition duration-75 ${isActive ? "text-primary-600" : "text-gray-500"}`}
                    />
                    <span className="ml-3">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>
    </>
  )
}
