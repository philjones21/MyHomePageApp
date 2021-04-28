import axios, { AxiosResponse } from "axios";

//Interface to define Blog data format for client/server communication.
export interface IBlogs {
    _id?: string,
    originalAuthor: string,
    blogTitle: string,
    blogArticle?: string,
    createdDate?: Date,
    blogEmbedURL?: string,
}

/**
* Worker class for calling RESTful API's on the server
*/
export class Worker {

    /**
     * Gets list of Blog Entries
     * @returns Promise of type IBlogs[]
     */
    public async listBlogs(): Promise<IBlogs[]> {
        const response: AxiosResponse = await axios.get('blogs')
        return response.data;
    } 

    /**
     * Posts a new Blog Entry
     * @param inBlog conforms to IBlogs format
     * @returns Promise of type IBlogs
     */
    public async addBlog(inBlog: IBlogs): Promise<IBlogs> {
        const response: AxiosResponse = await axios.post('blog', inBlog);
        return response.data;
    } 

    /**
     * Deletes a Blog Entry
     * @param inId BlogId
     * @returns Promise of type string
     */
    public async deleteBlog(inId: string): Promise<string> {
        const response: AxiosResponse = await axios.delete(`blog/${inId}`);
        return response.data;
    } 

} 