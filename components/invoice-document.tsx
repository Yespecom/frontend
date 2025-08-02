import type React from "react"

interface InvoiceDocumentProps {
  order: {
    orderNumber: string
    createdAt: string
    customerInfo: {
      name: string
      email: string
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

// Helper functions (copied from page.tsx for self-containment)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ order, shopInfo }) => {
  return (
    <div className="p-8 bg-white text-gray-900 font-sans leading-normal">
      <div className="max-w-3xl mx-auto border border-gray-300 p-8 shadow-lg">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{shopInfo.name}</h1>
            <p className="text-sm text-gray-600">
              {shopInfo.address.street}, {shopInfo.address.city}, {shopInfo.address.state} - {shopInfo.address.zipCode}
            </p>
            <p className="text-sm text-gray-600">Phone: {shopInfo.phone}</p>
            <p className="text-sm text-gray-600">Email: {shopInfo.email}</p>
            <p className="text-sm text-gray-600">Website: {shopInfo.website}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">INVOICE</h2>
            <p className="text-sm text-gray-700">
              Invoice No: <span className="font-semibold">#{order.orderNumber}</span>
            </p>
            <p className="text-sm text-gray-700">
              Date: <span className="font-semibold">{formatDate(order.createdAt)}</span>
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Bill To:</h3>
          <p className="font-medium text-gray-800">{order.customerInfo.name}</p>
          <p className="text-sm text-gray-600">{order.customerInfo.email}</p>
          <p className="text-sm text-gray-600">
            {order.customerInfo.address.street}, {order.customerInfo.address.city}, {order.customerInfo.address.state} -{" "}
            {order.customerInfo.address.zipCode}
          </p>
          <p className="text-sm text-gray-600">{order.customerInfo.address.country}</p>
        </div>

        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Item</th>
              <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Qty</th>
              <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">Unit Price</th>
              <th className="py-2 px-4 text-right text-sm font-semibold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-2 px-4 text-sm text-gray-800">{item.name}</td>
                <td className="py-2 px-4 text-sm text-gray-800">{item.quantity}</td>
                <td className="py-2 px-4 text-right text-sm text-gray-800">{formatCurrency(item.price)}</td>
                <td className="py-2 px-4 text-right text-sm text-gray-800">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-full max-w-xs space-y-2 text-right">
            <div className="flex justify-between text-sm text-gray-700">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Tax:</span>
              <span className="font-semibold">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Shipping:</span>
              <span className="font-semibold">{formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Discount:</span>
              <span className="font-semibold">{formatCurrency(order.discount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-800 border-t border-gray-300 pt-2 mt-2">
              <span>Grand Total:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 mt-12">
          <p>Thank you for your business!</p>
          <p>Please make all checks payable to {shopInfo.name}.</p>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDocument
