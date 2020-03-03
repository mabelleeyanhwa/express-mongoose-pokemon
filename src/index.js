require("./utils/db");

const app = require("./app");
const port = process.env.PORT || 3000;

const server = app.listen(port, () =>
  console.log(`Express app started on http://localhost:${port}`)
);
