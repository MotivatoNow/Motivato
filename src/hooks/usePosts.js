export function usePosts(){
    async function createPost(post,setPosts){
        //create post axios/ fetch / firebase
        // setPosts(prev=>[...prev,post])
    }
    async function getPosts(setPosts){
        //create get axios/ fetch / firebase
        // setPosts(posts)
    }

    return {createPost,getPosts}
}