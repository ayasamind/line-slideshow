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
        sx={{ margin: '2px' }}
        variant="masonry"
        cols={2}
        gap={5}
        >
        {images.map((item) => (
            <ImageListItem key={item.img}>
            <img
                src={`${item.imgPath}?w=248&fit=crop&auto=format`}
                srcSet={`${item.imgPath}?w=248&fit=crop&auto=format&dpr=2 2x`}
                alt={item.label}
                loading="lazy"
            />
            </ImageListItem>
        ))}
    </ImageList>
  );
}

export default PhotoList;