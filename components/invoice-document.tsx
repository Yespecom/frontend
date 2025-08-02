import type React from "react"
import { formatCurrency, formatDate } from "@/app/admin/orders/page" // Assuming these are exported from page.tsx

interface InvoiceDocumentProps {
  order: {
    orderNumber: string
    createdAt: string
    customerInfo: {
      name: string
      email: string
      phone: string
      address: {
        street: string
        city: string
        state: string
        zipCode: string
        country: string
      }
    }
    items: Array<{
      name: string
      quantity: number
      price: number
      total: number
    }>
    subtotal: number
    tax: number
    shipping: number
    discount: number
    total: number
    paymentMethod: string
    paymentStatus: string
  }
  shopInfo: {
    name: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    phone: string
    email: string
    website: string
  }
}

const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ order, shopInfo }) => {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white font-sans text-gray-800">
      <header className="flex justify-between items-center border-b pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{shopInfo.name}</h1>
          <p className="text-sm text-gray-600">
            {shopInfo.address.street}, {shopInfo.address.city}, {shopInfo.address.state} - {shopInfo.address.zipCode},{" "}
            {shopInfo.address.country}
          </p>
          <p className="text-sm text-gray-600">Phone: {shopInfo.phone}</p>
          <p className="text-sm text-gray-600">Email: {shopInfo.email}</p>
          <p className="text-sm text-gray-600">Website: {shopInfo.website}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-slate-900">INVOICE</h2>
          <p className="text-lg font-semibold text-slate-700">#{order.orderNumber}</p>
          <p className="text-sm text-gray-600">Date: {formatDate(order.createdAt)}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Bill To:</h3>
          <p className="font-medium text-slate-800">{order.customerInfo.name}</p>
          <p className="text-sm text-gray-600">{order.customerInfo.email}</p>
          <p className="text-sm text-gray-600">{order.customerInfo.phone}</p>
          <p className="text-sm text-gray-600">
            {order.customerInfo.address.street}, {order.customerInfo.address.city}, {order.customerInfo.address.state} -{" "}
            {order.customerInfo.address.zipCode}, {order.customerInfo.address.country}
          </p>
        </div>
        <div className="text-right">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Payment Status:</h3>
          <p className="text-xl font-bold text-green-600 uppercase">{order.paymentStatus}</p>
          <p className="text-sm text-gray-600">Method: {order.paymentMethod}</p>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Order Details:</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">Product</th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">Qty</th>
              <th className="py-2 px-4 text-right text-sm font-medium text-gray-700">Price</th>
              <th className="py-2 px-4 text-right text-sm font-medium text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2 px-4 text-sm">{item.name}</td>
                <td className="py-2 px-4 text-sm">{item.quantity}</td>
                <td className="py-2 px-4 text-right text-sm">{formatCurrency(item.price)}</td>
                <td className="py-2 px-4 text-right text-sm">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex justify-end mb-8">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax:</span>
            <span className="font-medium">{formatCurrency(order.tax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping:</span>
            <span className="font-medium">{formatCurrency(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Discount:</span>
            <span className="font-medium text-red-600">-{formatCurrency(order.discount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>Grand Total:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </section>

      <footer className="text-center text-gray-500 text-xs pt-6 border-t">
        <p>Thank you for your business!</p>
        <p>
          &copy; {new Date().getFullYear()} {shopInfo.name}. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default InvoiceDocument
