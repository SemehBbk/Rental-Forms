exports.whoCanDo = (...roles) => {
  return (req, res, next) => {
    //console.log("User roles:", req.user.roles); // Debug

    if (!req.user.roles.some((role) => roles.includes(role))) {
      //   Vérifie si au moins un rôle correspond
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to perform this action !!!!",
      });
    }
    next();
  };
};
