import React, { useEffect, useState } from 'react';
import { db, auth, storage } from '../firebase'
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    Timestamp,
    orderBy,
    doc,
    setDoc,
    getDoc,
    updateDoc
}
    from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage'
import User from '../components/User';
import MessageForm from '../components/MessageForm';
import Message from '../components/Message';
import imgChoose from '../img/choose.svg'


const Home = () => {
    const [users, setUsers] = useState([]);
    const [chat, setChat] = useState('')
    const [text, setText] = useState('')
    const [img, setImg] = useState('')
    const [msg, setMsg] = useState([])
    const user1 = auth.currentUser.uid
    useEffect(() => {
        const usersRef = collection(db, 'users');
        // Zapytanie - Create Query
        const q = query(usersRef, where('uid', 'not-in', [user1]));
        // Wykonaj Zapytanie - Execute Query
        const unsub = onSnapshot(q, querySnapshot => {
            let users = []
            querySnapshot.forEach(doc => {
                users.push(doc.data())
            })
            setUsers(users)
        });
        return () => unsub();
    }, [])
    const selectUser = async (user) => {
        setChat(user);
        const user2 = user.uid
        const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

        const msgRef = collection(db, 'messages', id, 'chat');
        const q = query(msgRef, orderBy('createdAt', 'asc'))

        onSnapshot(q, querySnapshot => {
            let msg = []
            querySnapshot.forEach(doc => {
                msg.push(doc.data())
            });
            setMsg(msg)
        })
        const docSnap = await getDoc(doc(db, 'lastMsg', id))
        if (docSnap.data() && docSnap.data().from !== user1) {
            await updateDoc(doc(db, 'lastMsg', id), {
                unread: false
            })
        }
    }
    const handleSubmit = async e => {
        e.preventDefault()
        const user2 = chat.uid
        const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
        let url;
        if (img) {
            const imgRef = ref(storage, `images/${new Date().getTime()} - ${img.name}`);
            const snap = await uploadBytes(imgRef, img)
            const dUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
            url = dUrl
        }
        await addDoc(collection(db, 'messages', id, 'chat'), {
            text,
            from: user1,
            to: user2,
            createdAt: Timestamp.fromDate(new Date()),
            media: url || ''
        });
        await setDoc(doc(db, 'lastMsg', id), {
            text,
            from: user1,
            to: user2,
            createdAt: Timestamp.fromDate(new Date()),
            media: url || '',
            unread: true
        })

        setText('')
    }
    return (

        <div className='home wrapper'>
            <div className="users_container">
                {users.map(user =>
                    <User
                        key={user.uid}
                        user={user}
                        selectUser={selectUser}
                        user1={user1}
                        chat={chat}
                    />)}
            </div>
            <div className="message_container">
                {chat ?
                    (
                        <>
                            <div className='message_user'>
                                <h3>{chat.name}</h3>
                            </div>
                            <div className="messages">
                                {msg.length ? msg.map((msg, i) => <Message key={i} msg={msg} user1={user1} />)
                                    :
                                    null}
                            </div>
                            <MessageForm
                                handleSubmit={handleSubmit}
                                text={text}
                                setText={setText}
                                setImg={setImg} />
                        </>
                    ) : (
                        <>
                            <h3 className='no_choose'>Select a user to start a conversation!</h3>
                            <img src={imgChoose} className='img_choose' />
                        </>
                    )}
            </div>
        </div>
    )
}

export default Home