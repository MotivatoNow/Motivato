import React, {useMemo, useState} from "react";
import PostCard from "../../components/PostCard/PostCard";
import {useParams} from "react-router-dom";
import {getPosts} from "../../context/Firestore";

const Post = () => {
    const { id } = useParams();
    const [allPosts, setAllPosts] = useState([])
    useMemo(() => {
        getPosts(setAllPosts);
    }, []);

    const filteredPost = allPosts.find((post) => post.id === id);

    return (
        <>
            {filteredPost ? (
                <PostCard posts={filteredPost} />
            ) : (
                <p>Post not found</p>
            )}
        </>
    );
};

export default Post;