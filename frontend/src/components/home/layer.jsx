/* eslint-disable react/prop-types */
import styles from "./home.module.css";

const Layer = ({ canvasRef }) => {
  return <canvas className={styles.canvas} ref={canvasRef}></canvas>;
};

export default Layer;
