export const sendSuccess = (res, data = {}, message = 'Thao tác thành công', statusCode = 200, meta = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
};

export const sendError = (res, message = 'Có lỗi xảy ra', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};
