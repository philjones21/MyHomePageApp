﻿import React, { Component } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import BlogEntry from "./BlogEntryComponent";
import PaginationControl from "./PaginationComponent";
import { Constants } from "../Constants";

/**
* Top level Blog component and contains a dialog popup for adding new Blog posts.
*/
const Blog = ({ state }) => {
    let numberOfBlogEntries: number = 0;

    if (state.blogEntries.length > 0) {
        numberOfBlogEntries = state.blogEntries.length;
    }

    let totalPages: number = numberOfBlogEntries / Constants.MAX_BLOG_ENTRIES_PER_PAGE;
    totalPages = Math.ceil(totalPages);

    return (
        <section>
            <section className="contentBlogContainer" >

                {state.blogEntries.map((row, index) => (
                    index >= state.currentBlogsStartIndex && index <= state.currentBlogsEndIndex && <BlogEntry state={state} row={row} />
                ))}

                <section id="blog_toolbar_addButton"><button className="button" onClick={() => state.viewAddBlogPopup(true)}>New Post</button></section>
                <section className="paginationbar">
                    <PaginationControl state={state} totalPages={totalPages} />
                </section>

                <Dialog open={state.viewAddBlog} onClose={() => state.viewAddBlogPopup(false)} aria-labelledby="form-dialog-title"
                    disableBackdropClick={true} disableEscapeKeyDown={true}>
                    <DialogTitle id="form-dialog-title">New Post</DialogTitle>
                    <form>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="blogTitle"
                                label="Blog Title (Required)"
                                type="text"
                                fullWidth
                                required
                                onChange={state.fieldChangeHandler}

                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="blogArticle"
                                label="Article"
                                multiline
                                rows={4}
                                type="text"
                                fullWidth
                                onChange={state.fieldChangeHandlerForBlogArticle}
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="blogEmbedURL"
                                label="YouTube URL"
                                type="text"
                                fullWidth
                                helperText="Ex. https://www.youtube.com/watch?v=JGJdU2dpYxg"
                                onChange={state.fieldChangeHandler}

                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => state.addBlog()} color="primary">
                                Save
                            </Button>
                            <Button onClick={() => state.viewAddBlogPopup(false)} color="primary">
                                Cancel
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </section>
        </section >
    )
}

export default Blog;

