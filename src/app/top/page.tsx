'use client'
import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const images = [];

const getImageFromS3 = async () => {
  const res = await fetch("https://jbbgdzaqvfrioaqbdyyavwthfq0gcfof.lambda-url.ap-northeast-1.on.aws/");
  const data = await res.json()
  return data;
}

const SwipeableTextMobileStepper = () => {
  const [s3images, setImageData] = useState([])
  useEffect(() => {
    getImageFromS3().then(data => {
      setImageData(data)
      console.log();
    });
  }, [])

  console.log(s3images);

  if (images.length === 0) {
    s3images.forEach(image => {
      images.push({
        label: image["key"],
        imgPath: "https://images-from-line.s3.ap-northeast-1.amazonaws.com/"+image["key"],
      })
    });
  }

  const theme = useTheme();
  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = images.length;
  const handle = useFullScreenHandle();
  const handleStepChange = (step: number) => {
    setActiveStep(step);
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
            </div>
            ))}
        </AutoPlaySwipeableViews>
        <MobileStepper
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
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