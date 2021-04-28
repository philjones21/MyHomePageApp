import * as path from "path";
import { Constants } from "./Constants";

const Datastore = require("nedb");

//Interface to define IBlogs data format for consumers of this class.
export interface IBlogs {
    _id?: string,
    originalAuthor: string,
    blogTitle: string,
    blogArticle?: string,
    createdDate?: Date,
    blogEmbedURL?: string,
}

/*
* Worker class to perform list, add, delete operations on database for Blog Entries.
*/
export class Worker {
    private db: Nedb;

    constructor() {
        this.db = new Datastore({ filename: path.join(Constants.DATABASE_DIR, "blogs.db"), autoload: true });
    }

    /**
    * Return a list of all the Blog Entries   
    * @return Promise of type IBlogs[]     
    */
    public listBlogs(): Promise<IBlogs[]> {
        return new Promise((inResolve, inReject) => {
            this.db.find({}).sort({ createdDate: -1 }).exec(
                (inError: Error | null, inDocs: IBlogs[]) => {
                    if (inError) {
                        inReject(inError);
                    } else {
                        inResolve(inDocs);
                    }
                }
            );
        });
    }

    /**
    * Add a new Blog Posting to the database
    * @param inBlog
    * @return Promise of type IBlogs[]      
    */
    public addBlog(inBlog: IBlogs): Promise<IBlogs> {
        inBlog.createdDate = new Date();
        return new Promise((inResolve, inReject) => {
            this.db.insert(inBlog, async (inError: Error | null, inNewDoc: IBlogs) => {
                if (inError) {
                    inReject(inError);
                } else {
                    inResolve(inNewDoc);
                }
            });
        });
    }

    /**
    * Delete the blog entry based on id and originalAuthor match. Return number of
    * records deleted (should be 1 if successful)
    * @param inID
    * @param inUserName
    * @returns Promise of type number     
    */
    public deleteBlog(inID: string, inUserName: string): Promise<number> {
        return new Promise((inResolve, inReject) => {
            this.db.remove({ _id: inID, originalAuthor: inUserName }, {}, (inError: Error | null, inNumberRemoved: number) => {
                if (inError) {
                    inReject(inError);
                } else {
                    inResolve(inNumberRemoved);
                }
            });
        });
    }
}