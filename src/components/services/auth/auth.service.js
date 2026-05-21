const apiBaseUrl = 'http://localhost:4000/api/users';

const parseJsonResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Ocurrio un error en la solicitud.');
  }

  return data;
};

export const loginUser = async ({ email, password }) => {
  const response = await fetch(`${apiBaseUrl}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return parseJsonResponse(response);
};

export const registerUser = async ({ name, dni, email, password, role }) => {
  const response = await fetch(`${apiBaseUrl}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, dni, email, password, role }),
  });

  return parseJsonResponse(response);
};
