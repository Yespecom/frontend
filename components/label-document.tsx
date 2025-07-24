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
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
}

interface LabelDocumentProps {
  order: Order
  shopInfo: ShopInfo
}

export default function LabelDocument({ order, shopInfo }: LabelDocumentProps) {
  return (
    <div className="p-6 bg-white text-gray-900 font-sans leading-normal">
      <div className="max-w-sm mx-auto border border-gray-300 p-6 shadow-lg rounded-lg">
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Shipping Label</h2>
          <p className="text-sm text-gray-600">
            Order ID: <span className="font-medium text-slate-800">#{order.orderNumber}</span>
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-2">From:</h3>
          <p className="font-medium text-slate-800">{shopInfo.name}</p>
          <p className="text-sm text-gray-600">
            {shopInfo.address.street}, {shopInfo.address.city}, {shopInfo.address.state} - {shopInfo.address.zipCode}
          </p>
          <p className="text-sm text-gray-600">{shopInfo.address.country}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-2">To:</h3>
          <p className="font-medium text-slate-800">{order.customerInfo.name}</p>
          <p className="text-sm text-gray-600">
            {order.customerInfo.address.street}, {order.customerInfo.address.city}, {order.customerInfo.address.state} -{" "}
            {order.customerInfo.address.zipCode}
          </p>
          <p className="text-sm text-gray-600">{order.customerInfo.address.country}</p>
        </div>

        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  )
}
