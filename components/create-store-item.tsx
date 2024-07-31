"use client"

import { PlusCircle } from "lucide-react"

interface CreateNewsStoreItemProp {
    onClick: () => void
}

export const CreateNewStoreItem = ({onClick}: CreateNewsStoreItemProp) => {
  return (
    <div onClick={onClick}
    className="flex items-center bg-gray-50 px-2 py1 cursor-pointer
    text-muted-foreground hover:text-primary">
        <PlusCircle className="mr-2 h5 w-5"/>
        Create Store
    </div>
  )
}
