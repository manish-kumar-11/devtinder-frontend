import React, { useState } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { addUser } from './utils/userSlice'
import { useNavigate } from 'react-router-dom'
import { BASE_URL } from './utils/constants'

const Login = () => {
  const [emailId , setemailId] = useState('')
  const [password,setpassword] = useState('')
  const [error, setError] = useState("");
  const [firstName,setFirstName] = useState("")
    const [lastName,setlastName] = useState("")

  const [isLogin,setisLogin] = useState(false)
  const dispatch  = useDispatch()
  const navigate = useNavigate()

  const handleLogin = async()=>{
     try {
      const res = await axios.post(
       BASE_URL+"/LOGIN",
        {
          emailId,
          password,
        },
        {
          withCredentials:true
        }
        
      );
   
    dispatch(addUser(res.data))
    navigate('/')
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    }
  }


  const handelSignup = async()=>{
      try {
      const res = await axios.post(
       BASE_URL+"/signup",
        {
          firstName,
          lastName,
          emailId,
          password,
        },
        {
          withCredentials:true
        }
        
      );
   
    dispatch(addUser(res.data.data));
      return navigate("/profile");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    }

  }



  return (
    <div> <div className="flex justify-center my-10">
      <div className="card bg-base-300 w-96 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">{isLogin ? "Login" : "Sign Up New User"}</h2>
          <div>

             {
              !isLogin ? <>
                 <label className="form-control w-full max-w-xs my-2">
              <div className="label">
                <span className="label-text">First Name:</span>
              </div>
              <input
                type="text"
               value={firstName}
                className="input input-bordered w-full max-w-xs"
                onChange={(e)=>setFirstName(e.target.value)}
              />
            </label>
            <label className="form-control w-full max-w-xs my-2">
              <div className="label">
                <span className="label-text">Last Name</span>
              </div>
              <input
                type="text"
                value={lastName}
                className="input input-bordered w-full max-w-xs"
               onChange={(e)=>setlastName(e.target.value)}
              />
            </label>
              </> : ""
             }






            <label className="form-control w-full max-w-xs my-2">
              <div className="label">
                <span className="label-text">Email ID:</span>
              </div>
              <input
                type="text"
               value={emailId}
                className="input input-bordered w-full max-w-xs"
                onChange={(e)=>setemailId(e.target.value)}
              />
            </label>
            <label className="form-control w-full max-w-xs my-2">
              <div className="label">
                <span className="label-text">Password</span>
              </div>
              <input
                type="text"
                value={password}
                className="input input-bordered w-full max-w-xs"
               onChange={(e)=>setpassword(e.target.value)}
              />
            </label>
          </div>
           <p className="text-red-500">{error}</p>
          <div className="card-actions justify-center m-2">
            <button className="btn btn-primary" onClick={isLogin ? handleLogin : handelSignup}>
              {isLogin ? "Login" : "Register"}
            </button>
          </div>

            <p
            className="m-auto cursor-pointer py-2"
            onClick={() => setisLogin((value) => !value)}
          >
            {isLogin
              ? "New User? Signup Here"
              : "Existing User? Login Here"}
          </p>
        </div>
      </div>
    </div></div>
  )
}

export default Login