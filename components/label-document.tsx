import type React from "react"

interface LabelDocumentProps {
  order: {
    orderNumber: string
    customerInfo: {
      name: string
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
    <div className="p-8 bg-white text-gray-900 font-sans leading-normal">
      <div className="max-w-md mx-auto border border-gray-300 p-6 shadow-lg rounded-lg">
        <div className="mb-6 border-b pb-4 border-gray-200">
          <h1 className="text-xl font-bold text-slate-800 mb-1">Shipping Label</h1>
          <p className="text-sm text-gray-600">
            Order ID: <span className="font-semibold">#{order.orderNumber}</span>
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Ship From:</h2>
          <p className="font-medium text-gray-800">{shopInfo.name}</p>
          <p className="text-sm text-gray-600">
            {shopInfo.address.street}, {shopInfo.address.city}, {shopInfo.address.state} - {shopInfo.address.zipCode}
          </p>
          <p className="text-sm text-gray-600">Phone: {shopInfo.phone}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Ship To:</h2>
          <p className="font-medium text-gray-800">{order.customerInfo.name}</p>
          <p className="text-sm text-gray-600">{order.customerInfo.phone}</p>
          <p className="text-sm text-gray-600">
            {order.customerInfo.address.street}, {order.customerInfo.address.city}, {order.customerInfo.address.state} -{" "}
            {order.customerInfo.address.zipCode}
          </p>
          <p className="text-sm text-gray-600">{order.customerInfo.address.country}</p>
        </div>

        <div className="mb-6 border-t pt-4 border-gray-200">
          <h3 className="text-md font-semibold text-slate-800 mb-2">Items:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {order.items.map((item, index) => (
              <li key={index}>
                {item.name} (Qty: {item.quantity})
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center mt-8">
          {/* Placeholder for a barcode/QR code */}
          <div className="w-48 h-16 bg-gray-200 mx-auto flex items-center justify-center text-gray-500 text-xs">
            [BARCODE / QR CODE HERE]
          </div>
          <p className="text-xs text-gray-500 mt-2">Scan for tracking information</p>
        </div>
      </div>
    </div>
  )
}

export default LabelDocument
