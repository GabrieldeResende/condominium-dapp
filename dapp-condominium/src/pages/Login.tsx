import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doLogin } from "../services/Web3Service";

function Login() {
  const navigate = useNavigate()

  const [message, setMessage] = useState("")

  function btnLoginClick() {
    doLogin().then(result => navigate("/topics")).catch(err => setMessage(err.message))
  }

  return (
    <main className="main-content  mt-0">
      <div className="page-header align-items-start min-vh-100"
        style={{ backgroundImage: "url('https://media.istockphoto.com/id/1145034668/pt/foto/modern-european-complex-of-apartment-buildings.webp?b=1&s=612x612&w=0&k=20&c=6200ASHO3AHH7OOH6qZ3-63q-F3xHK4IRQbZtMrOMnc=')" }}>
        <span className="mask bg-gradient-dark opacity-6"></span>
        <div className="container my-auto">
          <div className="row">
            <div className="col-lg-4 col-md-8 col-12 mx-auto">
              <div className="card z-index-0 fadeIn3 fadeInBottom">
                <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                  <div className="bg-gradient-primary shadow-primary border-radius-lg py-3 pe-1">
                    <h4 className="text-white font-weight-bolder text-center mt-2 mb-0">Condominium DAO</h4>
                  </div>
                </div>
                <div className="card-body">
                  <form role="form" className="text-start">
                    <div className="text-center">
                      <img src="/logo192.png" alt="Condominium Logo" />
                    </div>
                    <div className="text-center">
                      <button onClick={btnLoginClick} type="button" className="btn bg-gradient-primary w-100 my-4 mb-2">
                        <img src="/assets/metamask.svg" alt="MetaMask Logo" width={48} className="me-2" />
                        Sign in with MetaMask
                      </button>
                    </div>
                    <p className="mt-4 text-sm text-center">
                      Don't have an account? Ask to the
                      <a href="mailto:resende.web3@gmail.com" className="text-primary text-gradient font-weight-bold"> Manager</a>
                    </p>
                    <p className="mt-4 text-sm text-danger">
                      {message}
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="footer position-absolute bottom-2 py-2 w-100">
          <div className="container">
            Created by Gabriel de Resende
          </div>
        </footer>
      </div>
    </main>
  );
}

export default Login;
