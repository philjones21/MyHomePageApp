import "normalize.css";
import "../css/main.css";

import React from "react";
import ReactDOM from "react-dom";

import BaseLayout from "./components/BaseLayout";
import * as Blog from "./Blogs";

//Render the UI with the top level BaseLayout component.
const baseComponent = ReactDOM.render(<BaseLayout />, document.body);

//Now go get the list of BlogEntries to display when the UI initially loads.
baseComponent.state.showHidePleaseWait(true);

async function listBlogs() {
    const blogWorker: Blog.Worker = new Blog.Worker();
    try {  
        const blogs: Blog.IBlogs[] = await blogWorker.listBlogs();
        baseComponent.state.addMultiBlogsArray(blogs);
    } catch (e) {
    }
}
listBlogs().then(() => {
    baseComponent.state.showHidePleaseWait(false);
});

