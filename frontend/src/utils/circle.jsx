export const drawCircle = (canvasRef, x, y) => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(x,y,10, 0, 2 * Math.PI);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.stroke();
};
