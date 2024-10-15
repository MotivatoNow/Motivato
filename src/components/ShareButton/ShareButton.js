import React, {useState} from 'react';
import ModalShare from '../Modal/ModalShare/ModalShare'

const ShareButton = ({posts}) => {

    const [modalOpen, setModalOpen] = useState (false);

    const HandleShare = async () => {

    }

    return (
        <>
            <span onClick={() => setModalOpen (true)}>שיתוף</span>
            <ModalShare modalOpen={modalOpen}
                        setModalOpen={setModalOpen}
                        postsId={posts.id}
            />
        </>
    )
}

export default ShareButton;