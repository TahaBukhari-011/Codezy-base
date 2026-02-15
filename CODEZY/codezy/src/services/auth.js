
export const getCurrentUser = () => {
  const userString = localStorage.getItem("user"); 
  if (!userString) return null;

  try {
    return JSON.parse(userString);
  } catch (err) {
    console.error("Error parsing user from localStorage", err);
    return null;
  }
};
