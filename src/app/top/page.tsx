'use client'
import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

let images: Array<any> = [];
let profiles: {[id: string]: {label: string, imgPath: string}} = {};
let message: string = '';
const apiGatewayUrl: string = process.env.NEXT_PUBLIC_APIGATEWAY_URL as string;
const websocketApiGatewayUrl: string = process.env.NEXT_PUBLIC_WEBSOCKET_APIGATEWAY_URL as string;

const getImageFromS3 = async (apiUrl: string) => {
  const res = await fetch(apiUrl);
  const data = await res.json()
  return data;
}

const addImageAndProfile = (objectKey: string, isPush: boolean = true) => {
  const s3Url: string = process.env.NEXT_PUBLIC_S3_URL as string;
  let key = objectKey.split('/');
  let author = key[1].split('_')[0];
  let messageId = key[0];
  if (objectKey.endsWith("photo")) {
    if (isPush) {
      images.push({
        label: messageId,
        imgPath: s3Url+objectKey,
      })
    } else {
      images.unshift({
        label: messageId,
        imgPath: s3Url+objectKey,
      })
    } 
  } else if (objectKey.endsWith("profile")) {
    profiles[messageId] = {
      label: author,
      imgPath: s3Url+objectKey,
    }
  }
}

const SwipeableTextMobileStepper = () => {
  const s3Url: string = process.env.NEXT_PUBLIC_S3_URL as string;
  const [s3images, setImageData] = useState([])
  useEffect(() => {
    getImageFromS3(apiGatewayUrl).then(data => {
      setImageData(data)
    });
  }, [])

  if (images.length === 0) {
    s3images.forEach(image => {
      addImageAndProfile(image["key"]);
    });
  }

  const output = () => {
    images.some((image, index) =>  {
      if (profiles[image.label]) {
        handleStepChange(index);
        return true;
      }
    })
  }

  const reload = () => window.location.reload();

  const [message, setMessage] = useState('');
  useEffect(() => {
    const socket = new WebSocket(websocketApiGatewayUrl);
    socket.onopen = (event) => {
      // クライアント接続
      console.log("onopen", event);
    };

    socket.onmessage = async (event) => {
      // サーバーからのメッセージ受信時
      console.log("onmessgae", event);
      await addImageAndProfile(event.data, false);
      setTimeout(output, 2000)
    };

    socket.onclose = (event) => {
      // クライアント切断時
      console.log("onclose", event);
      setMessage('WebSocket接続が切断されました')
      setTimeout(reload, 2000)
    };
  }, []);

  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = images.length;
  const handle = useFullScreenHandle();
  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <FullScreen handle={handle}>
        <Box sx={{ maxWidth: 'auto', flexGrow: 1 }}>
        <AutoPlaySwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={activeStep}
            onChangeIndex={handleStepChange}
            enableMouseEvents
            interval={7500}
        >
          {images.map((step, index) => (
            <div key={step.label}>
              {Math.abs(activeStep - index) <= 2 ? (
                <ImageListItem key={step.imgPath}>
                <img
                    src={`${step.imgPath}?w=248&fit=crop&auto=format`}
                    srcSet={`${step.imgPath}?w=248&fit=crop&auto=format&dpr=2 2x`}
                    alt={step.label}
                    loading="lazy"
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      width: 'auto',
                      height: '1050px',
                      margin: 'auto', 
                    }}
                />
                  <ImageListItemBar
                    title={profiles[step.label] ? profiles[step.label].label : ''}
                    actionPosition='left'
                    actionIcon={
                    <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        aria-label={`info about ${`test`}`}
                    >
                      {
                        profiles[step.label]?
                        (<img width="150px" style={{ borderRadius: '50%'}} src={ profiles[step.label].imgPath } ></img>) : ''
                      }
                    </IconButton>
                  }
                  />
                </ImageListItem>
              ) : null}
            </div>
          ))}
        </AutoPlaySwipeableViews>
        <MobileStepper
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            nextButton={
              <Button
                size="small"
                onClick={handleNext}
                disabled={activeStep === maxSteps - 1}
              >
                Next {message}
                {theme.direction === 'rtl' ? (
                  <KeyboardArrowLeft />
                ) : (
                  <KeyboardArrowRight />
                )}
              </Button>
            }
            backButton={
              <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                {theme.direction === 'rtl' ? (
                  <KeyboardArrowRight />
                ) : (
                  <KeyboardArrowLeft />
                )}
                Back
              </Button>
            }
        />
        <Button
            size="small"
            onClick={handle.enter}
        >
            Full
        </Button>
        </Box>
    </FullScreen>
  );
}

export default SwipeableTextMobileStepper;