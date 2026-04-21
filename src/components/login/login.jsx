import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

const Login=()=> {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate('');
    const handleSubmit = (e) => {
        e.preventDefault();

        setError('');
        if (email === '' || password === '') {
            setError('Por favor complete todos los campos');
            return;
        }
        
        if (email !== 'admin@gmail.com' || password !== '123') {
            setError('Email o contrraseña incorectos. admin@gmail.com 123');
            return;
        }else {
            navigate('/dashboard');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Iniciar Sesión</h2>
            {error && <p style={{color:'red'}}>{error}</p>}
            <div>
                <label>Email</label>
                <input
                 type="email" 
                 placeholder="tu@email.com"
                 value={email}
                 onChange={(e)=> setEmail(e.target.value)}
                />
            </div>
            <div>
                <label>Contraseña:</label>
                <input 
                    type="password"
                    placeholder='Tu contraseña'
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />
            </div>
            <button type="submit">Ingresar</button>
        </form>
    );
}

export default Login;