import React,{useState,useEffect} from 'react'
import CategoryCard from './CategoryCard'
import { loadCategories } from '../../../hooks/useLoadCategories'

const Categories = () => {


   const [categories, setCategories] = useState([]);
   const [loading,setLoading] = useState(true);
  
    useEffect(() => {
       const fetchData = async () => {
         try {
           loadCategories(setCategories);   
           setLoading(false);
         } catch (error) {
           console.error("שגיאה במהלך שליפת הנתונים :", error);
           setLoading(false);
         }
       };
   
       fetchData();
     }, []);
   
  return (
    <div id="categories" className='w-full  bg-[#15CDCA13] py-24'>
        <div className='md:max-w-[1480px] m-auto max-w-[600px]  px-4 md:px-0'>
                <h1 className='md:leading-[72px] text-3xl font-bold'> הקטגוריות <span className='text-[#15CDCA]'>הפופולריות</span></h1>
                <p className='text-lg text-gray-600'>הפלטפורמה שלנו התפתחה לאורך זמן, תוך שילוב של רעיונות מכוונים ולעיתים גם תגליות מקריות</p>
                
                <div className='grid lg:grid-cols-4 grid-cols-2 py-12 md:gap-4 gap-1'>

                   {categories.map((category,index)=>(
                    <div className='tooltip tooltip-bottom tooltip-accent' data-tip={category.descriptionCategory}>
                    <CategoryCard className="" key={index}icons={category.imageURL} title={category.nameCategory}/>
                    </div>
                   )

                   )}

                    

                </div>
        
        
        </div>
    </div>
  )
}

export default Categories