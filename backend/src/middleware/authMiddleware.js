import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided " });
  }

  //spliting Bearer and the Token as arrays: [Beareer, edfigrgd...]
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //So the other controllers could use the req.user to know if this user is valid (Authored)
    req.user = decoded.id; //id of the user as string
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token is invalid or expired",
    });
  }
};
