'use client'
import React, { useState, useEffect } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

let images: Array<any> = [];

const getImageFromS3 = async (apiUrl: string) => {
  const res = await fetch(apiUrl);
  const data = await res.json()
  return data;
}

function srcset(image: string, size: number, rows = 1, cols = 1) {
    return {
      src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
      srcSet: `${image}?w=${size * cols}&h=${
        size * rows
      }&fit=crop&auto=format&dpr=2 2x`,
    };
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
        sx={{ width: 'auto', height: 'auto' }}
        variant="masonry"
        cols={5}
        gap={10}
        >
        {images.map((item) => (
            <ImageListItem key={item.img} cols={item.cols || 1} rows={item.rows || 1}>
            <img
                {...srcset(item.imgPath, 121, item.rows, item.cols)}
                alt={item.label}
                loading="lazy"
            />
            </ImageListItem>
        ))}
    </ImageList>
  );
}

export default PhotoList;