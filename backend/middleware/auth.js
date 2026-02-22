module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send("No Authorization");

  const token = auth.split(" ")[1];
  const [user, pass] = Buffer.from(token, "base64")
    .toString()
    .split(":");

  if (user === "admin" && pass === "123") {
    next();
  } else {
    res.status(403).send("Invalid Login");
  }
};