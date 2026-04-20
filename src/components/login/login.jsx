import {useState} from 'react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Intentando iniciar sesión con:");
        console.log("Email:", email);
        console.log("Password:", password);
    };

    return (
        <form>
            <h2>Iniciar Sesión</h2>
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