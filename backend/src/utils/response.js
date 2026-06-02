export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export const errorResponse = (res, message = 'Server error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  }
  if (errors) response.errors = errors
  return res.status(statusCode).json(response)
}

export const paginatedResponse = (res, data, total, page, limit, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  })
}
