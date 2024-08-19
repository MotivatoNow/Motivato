// src/pages/AdminDashboard/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import AddCategory from "../../features/AddCategory/AddCategory";

const Dashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            const querySnapshot = await getDocs(collection(db, 'Users'));
            const studentsList = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(user => user.userType === 'Student' && !user.isVerified);
            setStudents(studentsList);
            setLoading(false);
        };

        fetchStudents();
    }, []);

    const handleApprove = async (id) => {
        const userDoc = doc(db, 'Users', id);
        await updateDoc(userDoc, { isVerified: true });
        setStudents(students.filter(student => student.id !== id));
    };

    const handleReject = async (id) => {
        const userDoc = doc(db, 'Users', id);
        await deleteDoc(userDoc);
        setStudents(students.filter(student => student.id !== id));
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <table>
                <thead>
                <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>College</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {students.map(student => (
                    <tr key={student.id}>
                        <td><img src={student.studentCard} alt="Student Card" style={{ width: '100px', height: '100px' }} /></td>
                        <td>{student.firstName} {student.lastName}</td>
                        <td>{student.email}</td>
                        <td>{student.studentCollege}</td>
                        <td>
                            <button onClick={() => handleApprove(student.id)}>Approve</button>
                            <button onClick={() => handleReject(student.id)}>Reject</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <AddCategory/>
        </div>

    );
};

export default Dashboard;
