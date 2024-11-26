import React, { useState } from 'react'
import { useAuth } from '../../../context/AuthContext';
import { getMissions } from '../../../context/Firestore';

const LeftSide = () => {
        const { currentUser } = useAuthAuth();
        const [allMissions, setAllMissions] = useStatetate([]);
      
        useEffect(() => {
          getMissions(setAllMissions);
        }, []);
      


  return (
    <div>LeftSide</div>
  )
}

export default LeftSide