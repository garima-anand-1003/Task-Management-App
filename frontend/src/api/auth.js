import api from "./axiosConfig";

export const registerUser = (data) => {
  return api.post("/users/register", data);
};

export const loginUser = (email, password) => {
  const formData = new URLSearchParams();
  formData.append("username", email);   
  formData.append("password", password);

  return api.post("/users/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};