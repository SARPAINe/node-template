import { ForbiddenError, UnauthorizedError } from "../errors/index.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const verifyJWT = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new UnauthorizedError("Unauthorized request");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!user) {
    throw new UnauthorizedError("Invalid access token");
  }

  req.user = user;
  next();
};

/**
 * @param {AvailableUserRoles} roles
 * @description
 * * This middleware is responsible for validating multiple user role permissions at a time.
 * * So, in future if we have a route which can be accessible by multiple roles, we can achieve that with this middleware
 */
export const verifyPermission =
  (roles = []) =>
  async (req, res, next) => {
    if (!req.user?._id) {
      throw new UnauthorizedError("Unauthorized request");
    }
    if (roles.includes(req.user?.role)) {
      next();
    } else {
      throw new ForbiddenError("You are not allowed to perform this action");
    }
  };
