const express = require("express");
const app = express();
const port = 3000;

// 현재 폴더를 정적 파일 제공
app.use(express.static("."));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});