function requireAuth(request, response, next) {
  if (!request.session?.user?.id) {
    return response.status(401).json({
      message: 'Authentication required.',
    });
  }

  request.user = request.session.user;
  return next();
}

module.exports = requireAuth;
