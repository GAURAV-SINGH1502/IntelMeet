import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import useMeetingStore from "../store/useMeetingStore";

function Login() {
  const navigate = useNavigate();
const [error, setError] =
  useState("");
  const { setToken,
  setUser, } =
    useMeetingStore();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = async () => {
    console.log("Step 1");
    try {
console.log("Step 2");
      const result =
        await loginUser({
          email,
          password,
        });
 console.log("Step 3", result);
      console.log(result);
if (!result.token) {

  setError(
    "Invalid Email or Password"
  );

  return;
}
      if (result.token) {

        setToken(result.token);
        setUser(result.user);
        navigate("/");
      }

    } catch (error) {
console.error("Step 4", error);
      console.log(error);

    }
  };

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white p-8 rounded-lg w-96">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Login
        </h1>
{error && (
  <p className="text-red-500 mt-2">
    {error}
  </p>
)}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border p-2 rounded mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full border p-2 rounded mb-4"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Login
        </button>
        <p className="text-center mt-4">
  Don't have an account?{" "}
  <span
    onClick={() =>
      navigate("/register")
    }
    className="text-blue-500 cursor-pointer"
  >
    Register
  </span>
</p>
      </div>
    </div>
  );
}

export default Login;