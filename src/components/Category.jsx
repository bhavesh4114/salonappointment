import React from 'react'

const Category = ({ onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[420px] relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">
          Men's Salon & Massage
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => onSelect('salon')}
            className="border rounded-lg p-4 cursor-pointer hover:border-teal-mint"
          >
            Salon for Men
          </div>

          <div
            onClick={() => onSelect('massage')}
            className="border rounded-lg p-4 cursor-pointer hover:border-teal-mint"
          >
            Massage for Men
          </div>
        </div>

      </div>
    </div>
  )
}

export default Category
