import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";
function Register() {
   const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const result = await registerUser({
        name,
        email,
        password,
      });

      console.log(result);

      alert(
        result.message ||
          "Registration Successful"
      );
       navigate("/login");
    } catch (error) {
      console.log(error);

      alert("Registration Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white p-8 rounded-lg w-96 shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Register
        </h1>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full border p-2 rounded mb-4"
        />

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
          onClick={handleRegister}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Register
        </button>
        <p className="text-center mt-4">
  Already have an account?{" "}
  <span
    onClick={() =>
      navigate("/login")
    }
    className="text-blue-500 cursor-pointer"
  >
    Login
  </span>
</p>
      </div>
    </div>
  );
}

export default Register;