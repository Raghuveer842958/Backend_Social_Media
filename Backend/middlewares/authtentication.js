const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
  // extract jwt token
  const auth = req.headers.authorization;
  if (!auth) {
    console.log("Token not found in jwtMiddleware");
    return res.send({ error: "Invalid Token" });
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    console.log("token not found");
    res.send("token not found");
  }

  // verify jwt token
  try {
    const decodedMs = jwt.verify(token, "Raghu");
    req.userToken = decodedMs;
    console.log("You are Successfully Authenticated");
    next();
  } catch (err) {
    console.log("errorn in jwtmiddleware :", err);
    res.send(err);
  }
};

module.exports = { authentication };
