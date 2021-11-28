import React, { Component, useEffect } from "react";
import Image from 'material-ui-image';
import PhotoAlbumRowMenu from "./PhotoAlbumRowMenuComponent"

/**
* This component is used to display the individual PhotoAlbumRows and contains the link
* to display the Photos UI for the given Album.
*/


const PhotoAlbumRow = ({ state, row }) => {
    return (
        <section key={row._id} className="albumRow">
            <section className="albumRowPhotoThumbnail">
                {row.photos != undefined && row.photos.length > 0 &&

                    <a href="#main">
                        <Image src={"/albumid/" +
                            `${row._id}` + "/photofilename/" +
                            `${row.photos[0].photoThumbnailFileName}`}
                            onClick={() => { state.viewPhotos(row._id, row.albumName);state.setPaginationPage(1); }} />
                    </a>
                }

            </section>
            <section className="albumRowTitle" onClick={() => { state.viewPhotos(row._id, row.albumName); }} >
                <a href="#main" onClick={() => {state.viewPhotos(row._id, row.albumName);state.setPaginationPage(1);}}>{row.albumName}</a>
            </section>
            <section className="albumRowDescription">
                <article>{row.albumDescription}</article>
            </section>
            <section className="albumRowAuthor"><article>{row.originalAuthor}</article></section>
            <section className="albumRowFileNumber"><article>{row.numberOfFiles}</article></section>
            <section className="albumRowMenu">{state.userName == row.originalAuthor && <PhotoAlbumRowMenu state={state} albumId={row._id} originalAuthor={row.originalAuthor}/>}</section>
        </section>
    )
}

export default PhotoAlbumRow;