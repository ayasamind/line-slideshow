'use client'
import React, { useState, useEffect } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ListSubheader from '@mui/material/ListSubheader';
import IconButton from '@mui/material/IconButton';
import Zoom from 'react-medium-image-zoom'

let images: Array<any> = [];

const getImageFromS3 = async (apiUrl: string) => {
  const res = await fetch(apiUrl);
  const data = await res.json()
  return data;
}

const PhotoList = () => {
  const s3Url: string = process.env.NEXT_PUBLIC_S3_URL as string;
  const apiGatewayUrl: string = process.env.NEXT_PUBLIC_APIGATEWAY_URL as string;
  const [s3images, setImageData] = useState([])
  useEffect(() => {
    getImageFromS3(apiGatewayUrl).then(data => {
      setImageData(data)
    });
  }, [])

  if (images.length === 0) {
    s3images.forEach(image => {
      images.push({
        label: image["key"],
        imgPath: s3Url+image["key"],
      })
    });
  }

  return (
    <ImageList
        sx={{ margin: '2px', minHeight: 300 }}
        variant="masonry"
        cols={2}
        gap={5}
        >
        <ImageListItem key="Subheader">
            <ListSubheader component="div">
                {`0319披露宴フォト`}
            </ListSubheader>
        </ImageListItem>
        {images.map((item) => (
            <Zoom key={item.imgPath}>
              <ImageListItem key={item.imgPath}>
                <img
                    src={`${item.imgPath}?w=248&fit=crop&auto=format`}
                    srcSet={`${item.imgPath}?w=248&fit=crop&auto=format&dpr=2 2x`}
                    alt={item.label}
                    loading="lazy"
                />
                <ImageListItemBar
                    title={`test`}
                    actionIcon={
                    <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        aria-label={`info about ${`test`}`}
                    >
                  </IconButton>
                }
              />
              </ImageListItem>
            </Zoom>
        ))}
    </ImageList>
  );
}

export default PhotoList;