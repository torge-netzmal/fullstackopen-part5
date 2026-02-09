import {useState, useEffect} from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'


const App = () => {
    const [blogs, setBlogs] = useState([])
    const [successMessage, setSuccessMessage] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useState(null)

    useEffect(() => {
        blogService.getAll().then(blogs =>
            setBlogs(blogs)
        )
    }, [])

    const handleLogin = async event => {
        event.preventDefault()

        try {
            const user = await loginService.login({username, password})

            window.localStorage.setItem(
                'loggedNoteappUser', JSON.stringify(user)
            )
            blogService.setToken(user.token)
            setUser(user)
            setUsername('')
            setPassword('')
        } catch {
            setErrorMessage('wrong credentials')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
        }
    }
    const loginForm = () => (
        <form onSubmit={handleLogin}>
            <div>
                <label>
                    username
                    <input
                        type="text"
                        value={username}
                        onChange={({target}) => setUsername(target.value)}
                    />
                </label>
            </div>
            <div>
                <label>
                    password
                    <input
                        type="password"
                        value={password}
                        onChange={({target}) => setPassword(target.value)}
                    />
                </label>
            </div>
            <button type="submit">login</button>
        </form>
    )

    return (
        <div>
            <h2>blogs</h2>
            <Notification message={errorMessage} notificationType='error'/>
            <Notification message={successMessage} notificationType='success'/>
            {!user && loginForm()}
            {user && (<p>{user.name} logged in</p>)}
            {user && blogs.map(blog =>
                <Blog key={blog.id} blog={blog}/>
            )}
        </div>
    )
}

export default App