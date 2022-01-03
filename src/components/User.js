import React, { useEffect, useState } from 'react'
import Img from '../img/img1.jpg'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase'
const User = ({ user, user1, selectUser, chat }) => {
    const user2 = user?.uid
    const [data, setData] = useState('')

    useEffect(() => {
        const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
        let unsub = onSnapshot(doc(db, 'lastMsg', id), doc => {
            setData(doc.data())
        });
        return () => unsub
    }, [])
    return (
        <div className={`user_wrapper ${chat.name === user.name && 'selected_user'}`}
            onClick={() => selectUser(user)}
        >
            <div className="user_info">
                <div className="user_detail">
                    <img src={user.avatar || Img} alt="avatar" className='avatar' />
                    <h4>{user.name}</h4>
                    {data?.from !== user1 && data?.unread && (
                        <small className='unread_msg'>New Message</small>
                    )}
                    <div className={`user_status ${user.isOnline ? 'online' : 'offline'}`}></div>
                </div>
            </div>
            {data && (

                <p className='last_msg'>
                    <strong>{data.from === user1 ? 'Me:' : null}</strong>
                    {data.text}</p>
            )}
        </div >
    )
}

export default User
