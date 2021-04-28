import React, { Component } from "react";
import ReactPlayer from 'react-player/lazy';
import BlogMenu from "./BlogMenuComponent"

/**
* Blog entries can currently contain an article and a link to a YouTube video
* that will display in the Blog Post. This could potentially be enhanced to 
* embed links to facebook and other social media sites.
*/

const BlogEntry = ({ state, row }) => {
    const postedDate: Date = new Date(row.createdDate);
    const postedDateString: string = postedDate.toLocaleString();
    let embedURL: string = null;
    if(row.blogEmbedURL){
        if(ReactPlayer.canPlay(row.blogEmbedURL)){
            embedURL = row.blogEmbedURL;
        }
    }

    return (
        <section key={row._id} className="blogEntry">
            <section className="blogTitle"><article>{row.blogTitle}</article></section>
            <section className="blogMenu">{state.userName == row.originalAuthor && <BlogMenu state={state} blogId={row._id} originalAuthor={row.originalAuthor}/>}</section>
            <section className="blogAuthor"><article>Posted By: {row.originalAuthor}</article></section>
            <section className="blogArticle"><article>{row.blogArticle}</article></section>
            <section className="blogEmbeddedURL"><article>{embedURL != null && <ReactPlayer id="react-player" url={embedURL} controls={true} width={400} height={225}/>}</article></section>
            <section className="blogDate"><article>Posted On: {postedDateString}</article></section>       
        </section>
    )
}

export default BlogEntry;