import React, { useState, useEffect } from 'react'
import Img from '../img/img1.jpg'
import Camera from '../components/svg/Camera'
import Trash from '../components/svg/Trash'
import { storage, auth, db } from '../firebase'
import { ref, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useHistory } from 'react-router-dom'

const Profile = () => {
    const [img, setImg] = useState('')
    const [user, setUser] = useState();
    const history = useHistory('')
    useEffect(() => {
        getDoc(doc(db, 'users', auth.currentUser.uid))
            .then(docSnap => {
                if (docSnap.exists) {
                    setUser(docSnap.data());
                }
            })
        if (img) {
            const uploadImg = async () => {
                const imgRef = ref(storage, `avatar/${new Date().getTime()} - ${img.name}`);
                try {
                    if (user.avatarPath) {
                        await deleteObject(ref(storage, user.avatarPath))
                    }
                    const snap = await uploadBytes(imgRef, img);
                    const url = await getDownloadURL(ref(storage, snap.ref.fullPath));
                    await updateDoc(doc(db, 'users', auth.currentUser.uid),
                        {
                            avatar: url,
                            avatarPath: snap.ref.fullPath
                        });
                    setImg('')
                } catch (err) {
                    console.log(err.message);
                }

            };
            uploadImg()
        };


    }, [img])
    const deleteImg = async () => {
        try {
            const confirm = window.confirm('Are you sure you want to delete the avatar?')
            if (confirm) {
                await deleteObject(ref(storage, user.avatarPath));
                await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                    avatar: '',
                    avatarPath: '',
                });
                history.replace('/')
            }
        } catch (err) {
            console.log(err.message);
        }

    }
    return user ? (
        <section className='wrapper'>
            <div className="profile formbox">
                <div className="img_container">
                    <img src={user.avatar || Img} alt="avatar" />
                    <div className="overlay">
                        <div>
                            <label htmlFor="photo">
                                <Camera />
                            </label>
                            {user.avatar ? <Trash deleteImg={deleteImg} /> : null}
                            <input
                                type="file"
                                accept='image/*'
                                style={{ display: 'none' }}
                                id='photo'
                                onChange={e => setImg(e.target.files[0])}
                            />
                        </div>
                    </div>
                </div>
                <div className="text_container">
                    <h3>{user.name.toUpperCase()}</h3>
                    <p>{user.email.toLowerCase()}</p>
                    <br />
                    <hr />
                    <small>Joined: {user.createdAt.toDate().toDateString()}</small>
                </div>
            </div>
        </section>
    ) : null

}
export default Profile
