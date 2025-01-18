import React, { useEffect, useState } from 'react'
import logo from '../../assets/images/Icon.png'
import {FaFacebookF,FaDribbble,FaLinkedinIn,FaInstagram,FaBehance} from 'react-icons/fa'
import { loadCategories } from '../../hooks/useLoadCategories';

const Footer = () => {
    const [categories,setCategories] = useState([]);
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
    <div className='w-full bg-white py-24'>
        <div className='md:max-w-[1480px] m-auto grid md:grid-cols-5 max-[780px]:grid-cols-2  gap-8 max-w-[600px]  px-4 md:px-0'>
            
            <div className='col-span-2'>
                <img src={logo} className="h-10 " />
                <h3 className='text-2xl font-bold mt-10'>יצירת קשר</h3>
                <h3 className='py-2 text-[#6D737A]'>תתקשרו: 050000000</h3>
                <h3 className='py-2 text-[#6D737A]'>באר שבע</h3>
                <h3 className='py-2 text-[#363A3D]'>אימייל: motivatoffice@mail.com</h3>
                <div className='flex gap-4 py-4'>
                        <div className='p-4 bg-[#15CDCA25] rounded-xl'><FaDribbble size={25} style={{color:'#15CDCA'}} /></div>
                        <div className='p-4 bg-[#15CDCA25] rounded-xl'><FaLinkedinIn size={25} style={{color:'#15CDCA'}} /></div>
                        <div className='p-4 bg-[#15CDCA25] rounded-xl'><FaInstagram size={25} style={{color:'#15CDCA'}} /></div>
                        <div className='p-4 bg-[#15CDCA25] rounded-xl'><FaBehance size={25} style={{color:'#15CDCA'}} /></div>

                </div>

            </div>

            <div>
                <h3 className='text-2xl font-bold'>גלה</h3>
                <ul className='py-6 text-[#6D737A]'>
                    <li className='py-2'>דף הבית</li>
                    <li className='py-2'>עלינו</li>
                    <li className='py-2'>בלוג</li>
                    <li className='py-2'>יצירת קשר</li>

                </ul>
            </div>

            <div>
                <h3 className='text-2xl font-bold'>קטגוריות</h3>
                <ul className='py-6 text-[#6D737A]'>
                    {categories.map((category,index) => (
                        <li key={index}>{category.nameCategory}</li>
                    )
                )}
                </ul>
            </div>

            <div className='max-[780px]:col-span-2'>
                <h3 className='text-2xl font-bold'>הירשמו לניוזלטר שלנו</h3>
                <h3 className='py-2 text-[#6D737A]'>הצטרפו לניוזלטר שלנו לקבלת עדכונים, טיפים ותכנים ייחודיים ישירות לתיבת המייל שלכם. אל תפספסו את ההזדמנות להישאר מעודכנים!</h3>
                <form className='py-4'>
                    <input 
                        className='bg-[#F2F3F4] p-4 w-full rounded' 
                        placeholder='Email here' 
                    />
                    <button className='max-[780px]:w-full my-4 px-5 py-3 rounded-md bg-[#15CDCA] text-white font-medium'>הירשמו עכשיו</button>

                </form>


            </div>
        
        </div>
    </div>
  )
}

export default Footer