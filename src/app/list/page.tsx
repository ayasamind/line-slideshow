'use client'
import React, { useState, useEffect } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ListSubheader from '@mui/material/ListSubheader';
import IconButton from '@mui/material/IconButton';
import Zoom from 'react-medium-image-zoom'

let images: Array<any> = [];
// let profiles: { property: string; };
const profiles: {[id: string]: {label: string, imgPath: string}} = {};
// let profiles: Array<any> = [];

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
      let imageKey: string = image["key"];
      let key = imageKey.split('/');
      let author = key[1].split('_')[0];
      let messageId = key[0];
      if (imageKey.endsWith("photo")) {
        images.push({
          label: messageId,
          imgPath: s3Url+image["key"],
        })
      } else if (imageKey.endsWith("profile")) {
        profiles[messageId] = {
          label: author,
          imgPath: s3Url+image["key"],
        }
      }
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
        {images.map((item, index) => (
            <Zoom key={item.imgPath}>
              <ImageListItem key={item.imgPath}>
                <img
                    src={`${item.imgPath}?w=248&fit=crop&auto=format`}
                    srcSet={`${item.imgPath}?w=248&fit=crop&auto=format&dpr=2 2x`}
                    alt={item.label}
                    loading="lazy"
                />
                <ImageListItemBar
                    subtitle={profiles[item.label].label}
                    actionPosition='left'
                    actionIcon={
                    <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        aria-label={`info about ${`test`}`}
                    >
                      <img width="30px" style={{ borderRadius: '50%'}} src={ profiles[item.label].imgPath } ></img>
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