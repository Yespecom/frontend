import type React from "react"

interface LabelDocumentProps {
  order: {
    orderNumber: string
    customerInfo: {
      name: string
      address: {
        street: string
        city: string
        state: string
        zipCode: string
        country: string
      }
      phone: string
    }
    items: Array<{
      name: string
      quantity: number
    }>
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
  }
}

const LabelDocument: React.FC<LabelDocumentProps> = ({ order, shopInfo }) => {
  return (
    <div className="p-6 max-w-md mx-auto bg-white border border-gray-300 shadow-lg font-sans text-gray-800">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h1 className="text-xl font-bold text-slate-900">Shipping Label</h1>
        <p className="text-sm text-gray-600">
          Order ID: <span className="font-semibold">#{order.orderNumber}</span>
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Ship To:</h2>
        <p className="text-base font-medium text-slate-800">{order.customerInfo.name}</p>
        <p className="text-sm text-gray-700">{order.customerInfo.address.street}</p>
        <p className="text-sm text-gray-700">
          {order.customerInfo.address.city}, {order.customerInfo.address.state} - {order.customerInfo.address.zipCode}
        </p>
        <p className="text-sm text-gray-700">{order.customerInfo.address.country}</p>
        <p className="text-sm text-gray-700 mt-2">Phone: {order.customerInfo.phone}</p>
      </div>

      <div className="mb-6 border-t pt-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">From:</h2>
        <p className="text-base font-medium text-slate-800">{shopInfo.name}</p>
        <p className="text-sm text-gray-700">{shopInfo.address.street}</p>
        <p className="text-sm text-gray-700">
          {shopInfo.address.city}, {shopInfo.address.state} - {shopInfo.address.zipCode}
        </p>
        <p className="text-sm text-gray-700">{shopInfo.address.country}</p>
        <p className="text-sm text-gray-700 mt-2">Phone: {shopInfo.phone}</p>
      </div>

      <div className="border-t pt-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Contents:</h2>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {order.items.map((item, index) => (
            <li key={index}>
              {item.name} (Qty: {item.quantity})
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center mt-8">
        {/* Placeholder for a barcode or QR code */}
        <div className="w-48 h-16 bg-gray-200 mx-auto flex items-center justify-center text-gray-500 text-xs">
          [BARCODE / QR CODE HERE]
        </div>
        <p className="text-xs text-gray-500 mt-2">Scan for tracking information</p>
      </div>
    </div>
  )
}

export default LabelDocument
