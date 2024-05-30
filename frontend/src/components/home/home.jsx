import { useRef, useEffect } from "react";
import sample from "../../assets/video.mp4";
import Layer from "./layer";
import { drawCircle } from "../../utils/circle";
import styles from "./home.module.css";
import { positions } from "../../positions";

const Home = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // const drawCircles = (ctx, currentTime) => {
  //   ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

  //   positions.forEach(({pos}) => {
  //     console.log(pos);
  //     // if (pos[index].time <= currentTime) {
  //     //   drawCircle(canvasRef, pos[index].x, pos[index].y);
  //     // }
  //   });
  // };

  // useEffect(() => {
  //   if (canvasRef.current) {
  //     const styles = getComputedStyle(videoRef.current);
  //     canvasRef.current.height = parseInt(styles.height);
  //     canvasRef.current.width = parseInt(styles.width);
  //   }
  //   const videoElement = videoRef.current;
  //   const canvasElement = canvasRef.current;
  //   const ctx = canvasElement.getContext("2d");

  //   const updateCanvas = () => {
  //     if (videoElement.paused || videoElement.ended) return;
  //     drawCircles(ctx, videoElement.currentTime);
  //     requestAnimationFrame(updateCanvas);
  //   };

  //   videoElement.addEventListener("play", updateCanvas);
  //   return () => {
  //     videoElement.removeEventListener("play", updateCanvas);
  //   };
  // }, []);

  const handleClick = async () => {
    const response = await fetch("http://localhost:5000/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ circles:positions }),
    });
    if (response.ok) {
      console.log("success");
    } else {
      console.log("error");
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.player}>
        <Layer canvasRef={canvasRef} />
        <video
          ref={videoRef}
          src={sample}
          controls
          width="100%"
          height="100%"
          className={styles.video}
        />
      </div>
      <button onClick={handleClick}>Call Api</button>
    </div>
  );
};

export default Home;
