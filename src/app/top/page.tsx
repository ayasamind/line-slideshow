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

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

let images: Array<any> = [];

const getImageFromS3 = async (apiUrl: string) => {
  const res = await fetch(apiUrl);
  const data = await res.json()
  return data;
}

const SwipeableTextMobileStepper = () => {
  useEffect(() => {
    if ("Notification" in window) {
      // 通知が許可されていたら早期リターン
      const permission = Notification.permission;
      if (permission === "denied" || permission === "granted") {
        return;
      }
      // 通知の許可を求める
      Notification.requestPermission().then(() => new Notification("テスト"));
    }
  }, []);

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
      if (imageKey.endsWith("photo")) {
        images.push({
          label: image["key"],
          imgPath: s3Url+image["key"],
        })
      }
    });
  }

  const [message, setMessage] = useState("")
  useEffect(() => {
    const socket = new WebSocket(
      "wss://hdkt3jtq6c.execute-api.ap-northeast-1.amazonaws.com/dev"
    );
    socket.onopen = (event) => {
      // クライアント接続時
      console.log("onopen", event);
    };

    socket.onmessage = (event) => {
      // サーバーからのメッセージ受信時
      console.log("onmessgae", event);
      setMessage(event.data);
      new Notification(message);
    };

    socket.onclose = (event) => {
      // クライアント切断時
      console.log("onclose", event);
    };
  });

  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
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
        >
            {images.map((step, index) => (
            <div key={step.label}>
              {Math.abs(activeStep - index) <= 2 ? (
                <Box
                    component="img"
                    sx={{
                    display: 'block',
                    overflow: 'hidden',
                    width: 'auto',
                    height: '1050px',
                    margin: 'auto',
                    }}
                    src={step.imgPath}
                    alt={step.label}
                />
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
                Next
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