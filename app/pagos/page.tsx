"use client"

import type React from "react"

import { useState } from "react"
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
import { createPayment, type Payment } from "@/lib/api"
import { CreditCard, Plus } from "lucide-react"
import { ErrorMessage } from "@/components/error-message"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const userId = process.env.NEXT_PUBLIC_USER_ID ? Number.parseInt(process.env.NEXT_PUBLIC_USER_ID) : 2

  const [formData, setFormData] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number.parseFloat(value) : value,
    }))
  }

  const resetForm = () => {
    setFormData({
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
    })
  }

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      resetForm()
      setError(null)
      setSuccess(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const paymentData = {
        userID: userId,
        amount: formData.amount,
        paymentDate: formData.paymentDate,
      }

      const newPayment = await createPayment(paymentData)
      if (newPayment) {
        setPayments([...payments, newPayment])
        setSuccess("Pago realizado con éxito. Ahora puedes inscribirte en cursos de pago.")
        setTimeout(() => {
          setOpen(false)
          resetForm()
        }, 2000)
      }
    } catch (err) {
      setError("Error al realizar el pago. Por favor, intenta de nuevo.")
      console.error("Error creating payment:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mt-2">Pagos</h1>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Realizar Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Realizar Nuevo Pago</DialogTitle>
                <DialogDescription>
                  Completa los detalles del pago para poder inscribirte en cursos de pago.
                </DialogDescription>
              </DialogHeader>
              {error && <ErrorMessage message={error} />}
              {success && <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">{success}</div>}
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Monto</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentDate">Fecha de Pago</Label>
                  <Input
                    id="paymentDate"
                    name="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Procesando..." : "Pagar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Realizar un Pago</CardTitle>
            <CardDescription>
              Realiza un pago para poder inscribirte en cursos de pago. Los pagos son necesarios para acceder a cursos
              premium.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6">
              <CreditCard className="h-16 w-16 text-primary" />
            </div>
          </CardContent>
          <CardFooter>
            <DialogTrigger asChild>
              <Button className="w-full">Realizar Pago</Button>
            </DialogTrigger>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Pagos</CardTitle>
            <CardDescription>
              Los pagos realizados te permiten inscribirte en cursos premium. Cada pago puede ser utilizado para
              inscribirte en uno o más cursos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>• Los pagos son procesados inmediatamente</li>
              <li>• Puedes usar un pago para inscribirte en múltiples cursos</li>
              <li>• Los pagos no son reembolsables</li>
              <li>• Se requiere un pago válido para cursos de pago</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {payments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Pagos Recientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pago #{payment.id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Monto: ${payment.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Fecha: {formatDate(payment.paymentDate)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
