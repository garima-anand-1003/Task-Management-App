import api from "./axiosConfig";

export const registerUser = (data) => {
  return api.post("/users/register", data);
};

export const loginUserApi = (data) => {
  const formData = new URLSearchParams();
  formData.append("username", data.email);   
  formData.append("password", data.password);

  return api.post("/users/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};