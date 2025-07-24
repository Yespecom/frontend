import { formatCurrency, formatDate } from "@/app/orders/page" // Re-using formatters from orders page

interface ShopInfo {
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

interface Order {
  _id: string
  orderNumber: string
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
    productId: string
    name: string
    price: number
    quantity: number
    total: number
  }>
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  status: string
  paymentStatus: string
  paymentMethod: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface InvoiceDocumentProps {
  order: Order
  shopInfo: ShopInfo
}

export default function InvoiceDocument({ order, shopInfo }: InvoiceDocumentProps) {
  return (
    <div className="p-8 bg-white text-gray-900 font-sans leading-normal">
      <div className="max-w-3xl mx-auto border border-gray-300 p-8 shadow-lg">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{shopInfo.name}</h1>
            <p className="text-sm text-gray-600">
              {shopInfo.address.street}, {shopInfo.address.city}, {shopInfo.address.state} - {shopInfo.address.zipCode}
            </p>
            <p className="text-sm text-gray-600">
              {shopInfo.address.country} | Phone: {shopInfo.phone} | Email: {shopInfo.email}
            </p>
            <p className="text-sm text-gray-600">{shopInfo.website}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-semibold text-slate-700">INVOICE</h2>
            <p className="text-sm text-gray-600">
              Order ID: <span className="font-medium text-slate-800">#{order.orderNumber}</span>
            </p>
            <p className="text-sm text-gray-600">
              Date: <span className="font-medium text-slate-800">{formatDate(order.createdAt)}</span>
            </p>
          </div>
        </div>

        <div className="mb-8 border-t border-b border-gray-200 py-4">
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Bill To:</h3>
          <p className="font-medium text-slate-800">{order.customerInfo.name}</p>
          <p className="text-sm text-gray-600">{order.customerInfo.email}</p>
          <p className="text-sm text-gray-600">{order.customerInfo.phone}</p>
          <p className="text-sm text-gray-600">
            {order.customerInfo.address.street}, {order.customerInfo.address.city}, {order.customerInfo.address.state} -{" "}
            {order.customerInfo.address.zipCode}, {order.customerInfo.address.country}
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-700 mb-3">Order Items:</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-2 text-sm font-medium text-gray-700">Item</th>
                <th className="py-2 text-sm font-medium text-gray-700 text-right">Qty</th>
                <th className="py-2 text-sm font-medium text-gray-700 text-right">Price</th>
                <th className="py-2 text-sm font-medium text-gray-700 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-0">
                  <td className="py-2 text-sm text-slate-800">{item.name}</td>
                  <td className="py-2 text-sm text-slate-800 text-right">{item.quantity}</td>
                  <td className="py-2 text-sm text-slate-800 text-right">{formatCurrency(item.price)}</td>
                  <td className="py-2 text-sm text-slate-800 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-8">
          <div className="w-full md:w-1/2 space-y-2">
            <div className="flex justify-between text-sm text-gray-700">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-800">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Tax:</span>
              <span className="font-medium text-slate-800">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Shipping:</span>
              <span className="font-medium text-slate-800">{formatCurrency(order.shipping)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-gray-700">
                <span>Discount:</span>
                <span className="font-medium text-red-600">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-slate-800 border-t border-gray-300 pt-2 mt-2">
              <span>Total Amount:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 border-t border-gray-200 pt-4">
          <p>
            Payment Method: <span className="font-medium text-slate-800">{order.paymentMethod}</span>
          </p>
          <p>
            Payment Status: <span className="font-medium text-slate-800">{order.paymentStatus}</span>
          </p>
          {order.notes && (
            <p>
              Notes: <span className="font-medium text-slate-800">{order.notes}</span>
            </p>
          )}
          <p className="mt-4">
            &copy; {new Date().getFullYear()} {shopInfo.name}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
