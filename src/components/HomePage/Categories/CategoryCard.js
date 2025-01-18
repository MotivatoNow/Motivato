import React from 'react'
import {BsArrowUpRight} from 'react-icons/bs'

const CategoryCard = ({icons,title}) => {
  return (
<div className='category-card bg-white md:p-4 p-2 shadow-lg rounded-md flex items-center justify-between gap-4 border border-transparent hover:border-[#15CDCA] hover:cursor-pointer group/edit'>
    <div className='flex items-center gap-4 overflow-hidden'>
        {icons}
        <h1 className='md:max-w-[200px] max-w-[70px] truncate md:text-2xl text-lg font-semibold'>
            {title}
        </h1>
    </div>
    <div className='group-hover/edit:bg-[#15CDCA] flex items-center justify-center rounded-lg p-3 flex-shrink-0'>
        <BsArrowUpRight
            size={30}
            style={{ color: '#15CDCA' }}
            className='arrow-icon group-hover/edit:fill-white'
        />
    </div>
</div>


  )
}

export default CategoryCard