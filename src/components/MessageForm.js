import React from 'react'
import Attachment from './svg/Attachment'

const MessageForm = ({ handleSubmit, text, setText, setImg }) => {
    return (
        <div className="wrapper">
            <form className='message_form' onSubmit={handleSubmit}>
                <label htmlFor="img">
                    <Attachment />
                </label>
                <input
                    type="file"
                    name=""
                    id="img"
                    accept='image/*'
                    onChange={e => setImg(e.target.files[0])}
                    style={{ display: 'none' }} />
                <div>
                    <input
                        type="text"
                        placeholder='Enter message..'
                        value={text}
                        onChange={e => setText(e.target.value)} />
                </div>
                <div>
                    <button className='btn'>Send</button>
                </div>
            </form>
        </div>
    )
}

export default MessageForm
