'use client'
import React, { useState, useEffect } from 'react';
import styles from '../page.module.css'

let images: Array<any> = [];
let profiles: Array<any> = [];

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
        profiles.push(author)
      }
    });
  }

  const listItems = profiles.map((item, index) =>
    <li key={index}>{item}</li>
  );

  let count: {
    [key: string]: Number
  } = {}
  for (var i = 0; i < profiles.length; i++) {
    var elm = profiles[i];
    if (count[elm]) {
      count[elm] = +count[elm] + 1;
    } else {
      count[elm] = 1;
    }
  }

  var pairs = Object.entries(count);
  pairs.sort(function(p1, p2){
    var p1Val: Number = p1[1], p2Val: Number = p2[1];
    return +p2Val - +p1Val;
  })
  var result = Object.fromEntries(pairs);
  console.log(result);

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <ul>
          { listItems }
        </ul>
      </div>
      <div className={styles.grid}>
        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
        </a>
      </div>
    </main>
  );
}

export default PhotoList;